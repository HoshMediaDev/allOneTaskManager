import { useEffect, useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { BoardService } from '../services/board/boardService';
import { supabase } from '../lib/supabase';
import type { Board } from '../types';

export const useBoardData = (boardId: string) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateBoard } = useBoardStore();

  useEffect(() => {
    const loadBoardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Loading board data for ID:', boardId);
        const boardData = await BoardService.getBoardData(boardId);
        if (!boardData) throw new Error('Board not found');

        console.log('Received board data:', boardData);
        setBoard(boardData);
        updateBoard(boardData);
      } catch (err) {
        console.error('Error loading board data:', err);
        setError('Failed to load board data');
      } finally {
        setIsLoading(false);
      }
    };

    if (boardId) {
      loadBoardData();

      // Set up real-time subscriptions
      const boardChannel = supabase.channel(`board-${boardId}`);

      // Board changes
      boardChannel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'boards',
          filter: `id=eq.${boardId}`
        }, (payload) => {
          console.log('Board change detected:', payload);
          loadBoardData();
        })
        // List changes
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `board_id=eq.${boardId}`
        }, (payload) => {
          console.log('List change detected:', payload);
          loadBoardData();
        })
        // Task changes
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `list_id=in.(select id from lists where board_id = '${boardId}')`
        }, (payload) => {
          console.log('Task change detected:', payload);
          loadBoardData();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to real-time changes for board:', boardId);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Failed to subscribe to real-time changes');
            setError('Failed to subscribe to real-time updates');
          }
        });

      return () => {
        console.log('Cleaning up board subscriptions');
        boardChannel.unsubscribe();
      };
    }
  }, [boardId, updateBoard]);

  return { board, isLoading, error };
};