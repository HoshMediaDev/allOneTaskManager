import { supabase } from '../../lib/supabase';
import type { List, Task } from '../../types';

export class ListService {
  static async createList(boardId: string, title: string, isPrivate: boolean = false, userEmail?: string): Promise<List | null> {
    try {
      if (isPrivate && !userEmail) {
        throw new Error('User email required for private lists');
      }

      // Set user email for RLS if creating a private list
      if (isPrivate && userEmail) {
        await supabase.rpc('set_user_email', { email: userEmail });
      }

      // Get current max position
      const { data: lists } = await supabase
        .from(isPrivate ? 'private_lists' : 'lists')
        .select('position')
        .eq('board_id', boardId)
        .order('position', { ascending: false })
        .limit(1);

      const position = (lists?.[0]?.position || 0) + 1;

      // Create new list in the appropriate table
      const { data, error } = await supabase
        .from(isPrivate ? 'private_lists' : 'lists')
        .insert({
          board_id: boardId,
          title: title.trim(),
          position,
          user_email: userEmail
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating list:', error);
        throw error;
      }

      return data ? {
        id: data.id,
        boardId: data.board_id,
        title: data.title,
        position: data.position,
        tasks: [],
        is_private: isPrivate,
        user_email: data.user_email
      } : null;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }

  static async updateList(list: List, userEmail?: string): Promise<List> {
    try {
      // Set user email for RLS if updating a private list
      if (list.is_private && userEmail) {
        await supabase.rpc('set_user_email', { email: userEmail });
      }

      // Update list in the appropriate table
      const { data, error } = await supabase
        .from(list.is_private ? 'private_lists' : 'lists')
        .update({
          title: list.title.trim(),
          position: list.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', list.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating list:', error);
        throw error;
      }

      return {
        ...list,
        title: data.title,
        position: data.position
      };
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  }

  static async deleteList(list: List, userEmail?: string): Promise<void> {
    try {
      // Set user email for RLS if deleting a private list
      if (list.is_private && userEmail) {
        await supabase.rpc('set_user_email', { email: userEmail });
      }

      const { error } = await supabase
        .from(list.is_private ? 'private_lists' : 'lists')
        .delete()
        .eq('id', list.id);

      if (error) {
        console.error('Error deleting list:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  }

  static async createTask(listId: string, task: Omit<Task, 'id' | 'listId'>, isPrivate: boolean = false, userEmail?: string): Promise<Task | null> {
    try {
      if (isPrivate && !userEmail) {
        throw new Error('User email required for private tasks');
      }

      // Set user email for RLS if creating a private task
      if (isPrivate && userEmail) {
        await supabase.rpc('set_user_email', { email: userEmail });
      }

      // Get current max position
      const { data: tasks } = await supabase
        .from(isPrivate ? 'private_tasks' : 'tasks')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1);

      const position = (tasks?.[0]?.position || 0) + 1;

      // Create new task in the appropriate table
      const { data, error } = await supabase
        .from(isPrivate ? 'private_tasks' : 'tasks')
        .insert({
          list_id: listId,
          title: task.title.trim(),
          description: task.description?.trim(),
          content: task.content,
          priority: task.priority,
          labels: task.labels,
          assignees: task.assignees,
          tags: task.tags,
          custom_field_values: task.customFieldValues,
          attachments: task.attachments,
          checklist: task.checklist,
          due_date: task.dueDate || null,
          start_date: task.startDate || null,
          estimated_time: task.estimatedTime,
          actual_time: task.actualTime,
          position,
          status: task.status || 'incompleted',
          user_email: userEmail,
          location_id: isPrivate ? null : await this.getLocationIdForList(listId)
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      return data ? {
        id: data.id,
        listId: data.list_id,
        title: data.title,
        description: data.description || '',
        content: data.content || '',
        priority: data.priority || 'medium',
        labels: data.labels || [],
        assignees: data.assignees || [],
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
        comments: [],
        is_private: isPrivate,
        user_email: data.user_email
      } : null;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  private static async getLocationIdForList(listId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('boards!inner(location_id)')
        .eq('id', listId)
        .single();

      if (error) throw error;
      return data?.boards?.location_id || null;
    } catch (error) {
      console.error('Error getting location ID:', error);
      return null;
    }
  }
}