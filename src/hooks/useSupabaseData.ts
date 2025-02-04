import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';
import { useContactStore } from '../store/contactStore';
import { TaskService } from '../services/task/taskService';
import { supabase } from '../lib/supabase';

export const useSupabaseData = () => {
  const { locationId, userEmail, setOfflineMode } = useAuthStore();
  const { loadBoards } = useBoardStore();
  const { loadContacts } = useContactStore();
  const [isConnected, setIsConnected] = useState(false);

  // Check Supabase connection and initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data } = await supabase.from('boards').select('count');
        setIsConnected(true);
        setOfflineMode(false);
      } catch (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(false);
        setOfflineMode(true);
      }
    };

    initializeData();
  }, [setOfflineMode]);

  // Load data, sync with GHL, and set up real-time subscriptions
  useEffect(() => {
    if (!locationId || !userEmail || !isConnected) return;

    const loadData = async () => {
      try {
        // First sync tasks with GHL
        try {
          await TaskService.syncAllTasksWithGHL();
        } catch (error) {
          console.error('Error syncing tasks with GHL:', error);
          // Continue loading data even if sync fails
        }

        // Then load boards and contacts in parallel
        await Promise.all([
          loadBoards(),
          loadContacts()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        setOfflineMode(true);
      }
    };

    loadData();

    // Set up real-time subscriptions
    const boardsChannel = supabase.channel('any')
      // Board changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'boards',
        filter: `location_id=eq.${locationId}`
      }, () => {
        loadBoards();
      })
      // List changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lists'
      }, () => {
        loadBoards();
      })
      // Task changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, () => {
        loadBoards();
      })
      // Contact changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contacts'
      }, () => {
        loadContacts();
      })
      .subscribe();

    return () => {
      boardsChannel.unsubscribe();
    };
  }, [locationId, userEmail, isConnected, loadBoards, loadContacts, setOfflineMode]);

  return { isConnected };
};