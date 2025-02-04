import { supabase } from '../../lib/supabase';
import { GHLTaskService } from '../ghl/task.service';
import type { Task } from '../../types';
import { useApiStore } from '../../store/apiStore';
import { useAuthStore } from '../../store/authStore';
import { useBoardStore } from '../../store/boardStore';
import { GHLApiError } from '../ghl/api.error';

export class TaskService {
  private static ghlTaskService = GHLTaskService.getInstance();

  static async getTaskById(taskId: string): Promise<Task | null> {
    try {
      console.log('Fetching task:', taskId);

      // First try to get task from shared tasks
      const { data: sharedTask, error: sharedError } = await supabase
        .from('tasks')
        .select(`
          *,
          list:lists!inner(
            *,
            board:boards!inner(*)
          )
        `)
        .eq('id', taskId)
        .single();

      if (!sharedError && sharedTask) {
        console.log('Found shared task:', sharedTask);
        return this.transformTaskData(sharedTask);
      }

      // If not found in shared tasks, try private tasks
      const { data: privateTask, error: privateError } = await supabase
        .from('private_tasks')
        .select(`
          *,
          list:private_lists!inner(
            *,
            board:private_boards!inner(*)
          )
        `)
        .eq('id', taskId)
        .single();

      if (!privateError && privateTask) {
        console.log('Found private task:', privateTask);
        return this.transformTaskData(privateTask);
      }

      // If neither found, log the errors and return null
      if (sharedError && privateError) {
        console.error('Errors fetching task:', {
          sharedError,
          privateError
        });
      }

      return null;
    } catch (error) {
      console.error('Error in getTaskById:', error);
      throw error;
    }
  }

  private static transformTaskData(data: any): Task {
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      content: data.content || '',
      priority: data.priority || 'medium',
      labels: data.labels || [],
      assignees: data.assignees || [],
      listId: data.list_id,
      tags: data.tags || [],
      customFieldValues: data.custom_field_values || [],
      attachments: data.attachments || [],
      checklist: data.checklist || [],
      dueDate: data.due_date,
      startDate: data.start_date,
      estimatedTime: data.estimated_time,
      actualTime: data.actual_time,
      status: data.status || 'incompleted',
      position: data.position,
      ghlTaskId: data.ghl_task_id,
      contactId: data.contact_id,
      is_private: data.is_private || false,
      user_email: data.user_email,
      comments: []
    };
  }

  static async updateTask(taskId: string, updatedTask: Task): Promise<Task> {
    try {
      const isPrivate = updatedTask.is_private;
      const table = isPrivate ? 'private_tasks' : 'tasks';

      // Set user email for RLS if updating a private task
      if (isPrivate && updatedTask.user_email) {
        await supabase.rpc('set_user_email', { email: updatedTask.user_email });
      }

      const { data, error } = await supabase
        .from(table)
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          content: updatedTask.content,
          priority: updatedTask.priority,
          labels: updatedTask.labels,
          assignees: updatedTask.assignees,
          tags: updatedTask.tags,
          custom_field_values: updatedTask.customFieldValues,
          checklist: updatedTask.checklist,
          due_date: updatedTask.dueDate,
          start_date: updatedTask.startDate,
          estimated_time: updatedTask.estimatedTime,
          actual_time: updatedTask.actualTime,
          status: updatedTask.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update task');

      return this.transformTaskData(data);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      // Try to delete from shared tasks first
      const { error: sharedError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (!sharedError) {
        console.log('Deleted shared task:', taskId);
        return;
      }

      // If not found in shared tasks, try private tasks
      const { error: privateError } = await supabase
        .from('private_tasks')
        .delete()
        .eq('id', taskId);

      if (!privateError) {
        console.log('Deleted private task:', taskId);
        return;
      }

      // If both failed, throw an error
      throw new Error('Failed to delete task');
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  static async syncTaskWithGHL(task: Task): Promise<Task | null> {
    try {
      if (!task.ghlTaskId || !task.contactId) {
        console.log('Task not linked to GHL, skipping sync:', task.id);
        return null;
      }

      const { apiKey } = useApiStore.getState();
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      // Initialize GHL service
      this.ghlTaskService.setAccessToken(apiKey);

      try {
        console.log('Fetching GHL task:', {
          taskId: task.ghlTaskId,
          contactId: task.contactId
        });

        // Get task from GHL
        const ghlTask = await this.ghlTaskService.getTask(task.ghlTaskId, task.contactId);
        
        if (!ghlTask) {
          console.log('Task not found in GHL, may have been deleted:', task.id);
          // Delete task locally first
          await this.deleteTask(task.id);
          return null;
        }

        // Check if task needs updating
        const needsUpdate = (
          ghlTask.title !== task.title ||
          ghlTask.description !== task.description ||
          ghlTask.dueDate !== task.dueDate ||
          ghlTask.status !== task.status ||
          (ghlTask.assignedTo && task.assignees.every(a => !a.ghl_id || a.id !== ghlTask.assignedTo))
        );

        if (!needsUpdate) {
          console.log('Task is up to date:', task.id);
          return task;
        }

        console.log('Updating task from GHL:', {
          taskId: task.id,
          oldTitle: task.title,
          newTitle: ghlTask.title,
          oldStatus: task.status,
          newStatus: ghlTask.status
        });

        // Update local task with GHL data
        const updatedTask = {
          ...task,
          title: ghlTask.title,
          description: ghlTask.description || '',
          dueDate: ghlTask.dueDate,
          status: ghlTask.status,
          // Update team member assignee if changed
          assignees: ghlTask.assignedTo ? 
            task.assignees.map(a => !a.ghl_id ? { ...a, id: ghlTask.assignedTo! } : a) :
            task.assignees
        };

        // Update local state first
        const { boards, updateBoard } = useBoardStore.getState();
        const board = boards.find(b => b.lists.some(l => l.tasks.some(t => t.id === task.id)));
        if (board) {
          const updatedLists = board.lists.map(list => ({
            ...list,
            tasks: list.tasks.map(t => t.id === task.id ? updatedTask : t)
          }));
          updateBoard({ ...board, lists: updatedLists });
        }

        // Then update database
        const { error } = await supabase
          .from('tasks')
          .update({
            title: updatedTask.title,
            description: updatedTask.description,
            due_date: updatedTask.dueDate,
            status: updatedTask.status,
            assignees: updatedTask.assignees,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) {
          console.error('Database error updating task:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Task successfully updated from GHL:', task.id);
        return updatedTask;
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          // Task was deleted in GHL, delete it locally
          console.log('Task was deleted in GHL, removing locally:', task.id);
          await this.deleteTask(task.id);
          return null;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error syncing task with GHL:', {
        taskId: task.id,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }

  static async syncAllTasksWithGHL(): Promise<void> {
    try {
      const { locationId } = useAuthStore.getState();
      const { apiKey } = useApiStore.getState();

      if (!locationId) {
        throw new Error('Location ID is required');
      }

      if (!apiKey) {
        throw new Error('API key not configured');
      }

      // Get all tasks that are linked to GHL
      const { data: tasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('location_id', locationId)
        .not('ghl_task_id', 'is', null)
        .not('contact_id', 'is', null);

      if (fetchError) {
        console.error('Error fetching tasks:', fetchError);
        throw new Error('Failed to fetch tasks from database');
      }

      if (!tasks?.length) {
        console.log('No GHL-linked tasks found to sync');
        return;
      }

      console.log('Starting sync for', tasks.length, 'tasks');

      // Sync each task in batches to avoid overwhelming the API
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < tasks.length; i += batchSize) {
        batches.push(tasks.slice(i, i + batchSize));
      }

      let succeeded = 0;
      let failed = 0;
      const errors: Array<{ taskId: string; error: any }> = [];

      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(task => this.syncTaskWithGHL(task as Task))
        );

        // Process results
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            succeeded++;
          } else {
            failed++;
            errors.push({
              taskId: batch[index].id,
              error: result.reason
            });
          }
        });

        // Small delay between batches to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Log detailed results
      console.log('Sync completed:', {
        total: tasks.length,
        succeeded,
        failed,
        errors: errors.length ? errors : 'none'
      });

      // If any tasks failed to sync, throw an error with details
      if (failed > 0) {
        throw new Error(`Failed to sync ${failed} out of ${tasks.length} tasks. Check console for details.`);
      }
    } catch (error) {
      console.error('Error syncing all tasks:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }
}