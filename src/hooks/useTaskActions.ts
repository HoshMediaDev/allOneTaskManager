import { useBoardStore } from '../store/boardStore';
import { updateTaskInBoard } from '../utils/taskUtils';
import type { Task } from '../types';
import { supabase } from '../lib/supabase';

export const useTaskActions = () => {
  const { currentBoard, updateBoard } = useBoardStore();

  const updateTask = async (updatedTask: Task): Promise<Task> => {
    if (!currentBoard) throw new Error('No active board');
    
    try {
      console.log('Updating task in database:', updatedTask);

      // Update task in database
      const { data, error } = await supabase
        .from('tasks')
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
          due_date: updatedTask.dueDate || null,
          start_date: updatedTask.startDate || null,
          estimated_time: updatedTask.estimatedTime,
          actual_time: updatedTask.actualTime,
          status: updatedTask.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id)
        .select('*')
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Database update successful:', data);

      // Transform the response data to match Task type
      const transformedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
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
        comments: [],
        status: data.status || 'incompleted',
        position: data.position,
        ghlTaskId: data.ghl_task_id,
        contactId: data.contact_id
      };

      // Update local state immediately
      if (currentBoard) {
        console.log('Updating local state with transformed task:', transformedTask);
        
        const updatedLists = currentBoard.lists.map(list => ({
          ...list,
          tasks: list.tasks.map(t => t.id === transformedTask.id ? transformedTask : t)
        }));

        const updatedBoard = {
          ...currentBoard,
          lists: updatedLists
        };

        console.log('Updated board state:', updatedBoard);
        updateBoard(updatedBoard);
      }

      return transformedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string, listId: string) => {
    if (!currentBoard) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      const updatedBoard = {
        ...currentBoard,
        lists: currentBoard.lists.map(list =>
          list.id === listId
            ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
            : list
        ),
      };

      updateBoard(updatedBoard);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return {
    updateTask,
    deleteTask,
  };
};