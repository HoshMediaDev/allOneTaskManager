import { GHLTaskService } from './task.service';
import { TaskService } from '../task/taskService';
import { supabase } from '../../lib/supabase';
import type { Task } from '../../types';

export class TaskSyncService {
  private static instance: TaskSyncService;
  private ghlTaskService: GHLTaskService;

  private constructor() {
    this.ghlTaskService = GHLTaskService.getInstance();
  }

  static getInstance(): TaskSyncService {
    if (!this.instance) {
      this.instance = new TaskSyncService();
    }
    return this.instance;
  }

  async syncAllTasks(locationId: string, apiKey: string): Promise<void> {
    try {
      // Initialize GHL service with API key
      this.ghlTaskService.setAccessToken(apiKey);

      // Get all tasks that are linked to GHL
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('location_id', locationId)
        .not('ghl_task_id', 'is', null)
        .not('contact_id', 'is', null);

      if (error) throw error;

      // Sync each task
      await Promise.all(
        tasks.map(async (task) => {
          try {
            await this.syncTask(task as Task);
          } catch (error) {
            console.error(`Error syncing task ${task.id}:`, error);
          }
        })
      );
    } catch (error) {
      console.error('Error syncing all tasks:', error);
      throw error;
    }
  }

  async syncTask(task: Task): Promise<void> {
    if (!task.ghlTaskId || !task.contactId) {
      console.log('Task is not linked to GHL, skipping sync:', task.id);
      return;
    }

    try {
      // Get task from GHL
      const ghlTask = await this.ghlTaskService.getTask(task.ghlTaskId, task.contactId);

      // If task doesn't exist in GHL (404), delete it from our app
      if (!ghlTask) {
        console.log('Task deleted in GHL, removing from app:', task.id);
        await TaskService.deleteTask(task.id);
        return;
      }

      // Check if task needs updating
      const needsUpdate = this.checkForUpdates(task, ghlTask);
      if (needsUpdate) {
        console.log('Task updated in GHL, syncing changes:', task.id);

        // Update our task with GHL data
        const updatedTask = {
          ...task,
          title: ghlTask.title,
          description: ghlTask.description || '',
          dueDate: ghlTask.dueDate,
          status: ghlTask.status as 'completed' | 'incompleted',
          assignees: task.assignees.map(assignee => {
            if (!assignee.ghl_id) {
              // Update team member assignee if changed in GHL
              return {
                ...assignee,
                id: ghlTask.assignedTo || assignee.id
              };
            }
            return assignee;
          })
        };

        // Update task in database
        await TaskService.updateTask(task.id, updatedTask);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('invalid task id')) {
        // Task was deleted in GHL, remove it from our app
        console.log('Task was deleted in GHL, removing from app:', task.id);
        await TaskService.deleteTask(task.id);
      } else {
        console.error('Error syncing task:', error);
        throw error;
      }
    }
  }

  private checkForUpdates(localTask: Task, ghlTask: any): boolean {
    // Check if any of the synced fields have changed
    return (
      localTask.title !== ghlTask.title ||
      localTask.description !== ghlTask.description ||
      localTask.dueDate !== ghlTask.dueDate ||
      localTask.status !== ghlTask.status ||
      this.hasAssigneeChanged(localTask, ghlTask)
    );
  }

  private hasAssigneeChanged(localTask: Task, ghlTask: any): boolean {
    // Find team member assignee
    const teamMemberAssignee = localTask.assignees.find(a => !a.ghl_id);
    if (!teamMemberAssignee) return false;

    // Check if assigned team member has changed
    return teamMemberAssignee.id !== ghlTask.assignedTo;
  }
}