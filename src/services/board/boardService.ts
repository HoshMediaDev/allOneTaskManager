import { supabase } from '../../lib/supabase';
import type { Board, List, Task } from '../../types';

export class BoardService {
  static async getBoardData(boardId: string): Promise<Board | null> {
    try {
      // Get board with lists and tasks in a single query
      const { data: boardData, error } = await supabase
        .from('boards')
        .select(`
          *,
          lists!lists_board_id_fkey (
            *,
            tasks!tasks_list_id_fkey (*)
          )
        `)
        .eq('id', boardId)
        .order('position', { foreignTable: 'lists' })
        .order('position', { foreignTable: 'lists.tasks' })
        .single();

      if (error) throw error;
      if (!boardData) return null;

      // Transform data into Board type
      return {
        id: boardData.id,
        title: boardData.title,
        location_id: boardData.location_id,
        created_at: boardData.created_at,
        updated_at: boardData.updated_at,
        lists: (boardData.lists || []).map(list => ({
          id: list.id,
          boardId: list.board_id,
          title: list.title,
          position: list.position,
          tasks: (list.tasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            content: task.content || '',
            priority: task.priority || 'medium',
            labels: task.labels || [],
            assignees: task.assignees || [],
            listId: task.list_id,
            tags: task.tags || [],
            customFieldValues: task.custom_field_values || [],
            attachments: [],
            checklist: task.checklist || [],
            dueDate: task.due_date,
            startDate: task.start_date,
            estimatedTime: task.estimated_time,
            actualTime: task.actual_time,
            position: task.position,
            comments: []
          }))
        }))
      };
    } catch (error) {
      console.error('Error fetching board data:', error);
      return null;
    }
  }

  static async createList(boardId: string, title: string): Promise<List | null> {
    try {
      // Get current max position
      const { data: lists } = await supabase
        .from('lists')
        .select('position')
        .eq('board_id', boardId)
        .order('position', { ascending: false })
        .limit(1);

      const position = (lists?.[0]?.position || 0) + 1;

      // Create new list
      const { data, error } = await supabase
        .from('lists')
        .insert({
          board_id: boardId,
          title,
          position
        })
        .select()
        .single();

      if (error) throw error;
      return data ? {
        id: data.id,
        boardId: data.board_id,
        title: data.title,
        position: data.position,
        tasks: []
      } : null;
    } catch (error) {
      console.error('Error creating list:', error);
      return null;
    }
  }
}