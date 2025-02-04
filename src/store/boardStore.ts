import { create } from 'zustand';
import type { Board } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface BoardStore {
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

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  loadBoards: async () => {
    const { locationId } = useAuthStore.getState();
    if (!locationId) {
      set({ boards: [], currentBoard: null, error: 'No location ID provided', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        console.log('Loading boards for location:', locationId);

        const { data: boards, error } = await supabase
          .from('boards')
          .select(`
            *,
            lists (
              *,
              tasks (*)
            )
          `)
          .eq('location_id', locationId)
          .order('created_at', { ascending: false })
          .order('position', { foreignTable: 'lists' })
          .order('position', { foreignTable: 'lists.tasks' });

        if (error) throw error;

        const transformedBoards = (boards || []).map(board => ({
          ...board,
          lists: (board.lists || []).map(list => ({
            ...list,
            tasks: (list.tasks || []).map(task => ({
              ...task,
              content: task.content || '',
              priority: task.priority || 'medium',
              labels: task.labels || [],
              assignees: task.assignees || [],
              tags: task.tags || [],
              customFieldValues: task.custom_field_values || [],
              attachments: task.attachments || [],
              checklist: task.checklist || [],
              comments: []
            }))
          }))
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
        console.error(`Error loading boards (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          set({ 
            error: 'Failed to load boards',
            isLoading: false 
          });
          return;
        }

        await wait(RETRY_DELAY * retries);
      }
    }
  },

  createBoard: async (board: { title: string }) => {
    const { locationId } = useAuthStore.getState();
    if (!locationId) {
      throw new Error('Location ID is required');
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const { data: newBoard, error } = await supabase
          .from('boards')
          .insert([{
            title: board.title,
            location_id: locationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        if (!newBoard) throw new Error('Failed to create board');

        const transformedBoard: Board = {
          ...newBoard,
          lists: []
        };

        set(state => ({
          boards: [transformedBoard, ...state.boards],
          currentBoard: transformedBoard
        }));

        return transformedBoard;
      } catch (error) {
        console.error(`Error creating board (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          throw new Error('Failed to create board');
        }

        await wait(RETRY_DELAY * retries);
      }
    }

    throw new Error('Failed to create board after retries');
  },

  setCurrentBoard: (boardId: string) => {
    const { boards, currentBoard } = get();
    const { locationId } = useAuthStore.getState();
    
    const newCurrentBoard = boards.find(board => 
      board.id === boardId && board.location_id === locationId
    );
    
    if (newCurrentBoard && newCurrentBoard.id !== currentBoard?.id) {
      set({ currentBoard: newCurrentBoard });
    }
  },

  updateBoard: async (board: Board) => {
    const { locationId } = useAuthStore.getState();
    if (board.location_id !== locationId) {
      throw new Error('Cannot update board from different location');
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const { error } = await supabase
          .from('boards')
          .update({
            title: board.title,
            updated_at: new Date().toISOString()
          })
          .eq('id', board.id)
          .eq('location_id', locationId);

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
        console.error(`Error updating board (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          throw new Error('Failed to update board');
        }

        await wait(RETRY_DELAY * retries);
      }
    }
  },

  deleteBoard: async (boardId: string) => {
    const { locationId } = useAuthStore.getState();
    
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const { error } = await supabase
          .from('boards')
          .delete()
          .eq('id', boardId)
          .eq('location_id', locationId);

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
        console.error(`Error deleting board (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        retries++;

        if (retries === MAX_RETRIES) {
          throw new Error('Failed to delete board');
        }

        await wait(RETRY_DELAY * retries);
      }
    }
  }
}));