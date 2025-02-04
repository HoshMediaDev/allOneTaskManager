import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Board } from '../types';
import { useAuthStore } from './authStore';

interface PrivateBoardStore {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
  loadBoards: () => Promise<void>;
  createBoard: (board: { title: string }) => Promise<Board>;
  setCurrentBoard: (boardId: string) => void;
  updateBoard: (board: Board) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePrivateBoardStore = create<PrivateBoardStore>((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  loadBoards: async () => {
    const { userEmail } = useAuthStore.getState();
    if (!userEmail) {
      set({ boards: [], currentBoard: null, error: 'User email required', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        // Set user email for RLS
        await supabase.rpc('set_user_email', { email: userEmail });

        console.log('Loading private boards for user:', userEmail);

        const { data: boards, error } = await supabase
          .from('private_boards')
          .select(`
            *,
            lists:private_lists (
              *,
              tasks:private_tasks (*)
            )
          `)
          .eq('user_email', userEmail) // Filter by user email
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedBoards = (boards || []).map(board => ({
          id: board.id,
          title: board.title,
          lists: (board.lists || []).map(list => ({
            id: list.id,
            boardId: list.board_id,
            title: list.title,
            position: list.position,
            tasks: (list.tasks || []).map(task => ({
              id: task.id,
              title: task.title,
              description: task.description || '',
              content: task.content || '',
              priority: task.priority || 'medium',
              labels: task.labels || [],
              assignees: task.assignees || [],
              tags: task.tags || [],
              customFieldValues: task.custom_field_values || [],
              attachments: task.attachments || [],
              checklist: task.checklist || [],
              dueDate: task.due_date,
              startDate: task.start_date,
              estimatedTime: task.estimated_time,
              actualTime: task.actual_time,
              status: task.status || 'incompleted',
              position: task.position,
              listId: list.id,
              comments: []
            }))
          })),
          user_email: board.user_email,
          created_at: board.created_at,
          updated_at: board.updated_at,
          is_private: true
        }));

        const currentBoardId = get().currentBoard?.id;
        const newCurrentBoard = currentBoardId ? 
          transformedBoards.find(b => b.id === currentBoardId) || transformedBoards[0] : 
          transformedBoards[0];

        set({ 
          boards: transformedBoards,
          currentBoard: newCurrentBoard,
          isLoading: false,
          error: null
        });
        
        break;
      } catch (error) {
        console.error(`Error loading private boards (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          set({ 
            error: 'Failed to load private boards',
            isLoading: false 
          });
          return;
        }

        await wait(RETRY_DELAY * retries);
      }
    }
  },

  createBoard: async (board: { title: string }) => {
    const { userEmail } = useAuthStore.getState();
    if (!userEmail) {
      throw new Error('User email required');
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        // Set user email for RLS
        await supabase.rpc('set_user_email', { email: userEmail });

        const { data: newBoard, error } = await supabase
          .from('private_boards')
          .insert([{
            title: board.title,
            user_email: userEmail,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        if (!newBoard) throw new Error('Failed to create private board');

        const transformedBoard: Board = {
          id: newBoard.id,
          title: newBoard.title,
          lists: [],
          user_email: newBoard.user_email,
          created_at: newBoard.created_at,
          updated_at: newBoard.updated_at,
          is_private: true
        };

        set(state => ({
          boards: [transformedBoard, ...state.boards],
          currentBoard: transformedBoard
        }));

        return transformedBoard;
      } catch (error) {
        console.error(`Error creating private board (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          throw new Error('Failed to create private board');
        }

        await wait(RETRY_DELAY * retries);
      }
    }

    throw new Error('Failed to create private board after retries');
  },

  setCurrentBoard: (boardId: string) => {
    const { boards, currentBoard } = get();
    const { userEmail } = useAuthStore.getState();
    
    const newCurrentBoard = boards.find(board => 
      board.id === boardId && board.user_email === userEmail
    );
    
    if (newCurrentBoard && newCurrentBoard.id !== currentBoard?.id) {
      set({ currentBoard: newCurrentBoard });
    }
  },

  updateBoard: async (board: Board) => {
    const { userEmail } = useAuthStore.getState();
    
    if (board.user_email !== userEmail) {
      throw new Error('Cannot update board owned by another user');
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        // Set user email for RLS
        await supabase.rpc('set_user_email', { email: userEmail });

        const { error } = await supabase
          .from('private_boards')
          .update({
            title: board.title,
            updated_at: new Date().toISOString()
          })
          .eq('id', board.id)
          .eq('user_email', userEmail); // Add email check

        if (error) throw error;

        set(state => {
          const newBoards = state.boards.map(b => b.id === board.id ? board : b);
          return {
            boards: newBoards,
            currentBoard: state.currentBoard?.id === board.id ? board : state.currentBoard
          };
        });
        break;
      } catch (error) {
        console.error(`Error updating private board (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          throw new Error('Failed to update private board');
        }

        await wait(RETRY_DELAY * retries);
      }
    }
  },

  deleteBoard: async (boardId: string) => {
    const { userEmail } = useAuthStore.getState();
    const board = get().boards.find(b => b.id === boardId);
    
    if (!board) return;

    if (board.user_email !== userEmail) {
      throw new Error('Cannot delete board owned by another user');
    }
    
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        // Set user email for RLS
        await supabase.rpc('set_user_email', { email: userEmail });

        const { error } = await supabase
          .from('private_boards')
          .delete()
          .eq('id', boardId)
          .eq('user_email', userEmail); // Add email check

        if (error) throw error;

        set(state => {
          const newBoards = state.boards.filter(b => b.id !== boardId);
          return {
            boards: newBoards,
            currentBoard: state.currentBoard?.id === boardId ? newBoards[0] || null : state.currentBoard
          };
        });
        break;
      } catch (error) {
        console.error(`Error deleting private board (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          throw new Error('Failed to delete private board');
        }

        await wait(RETRY_DELAY * retries);
      }
    }
  }
}));