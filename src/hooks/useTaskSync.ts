import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TaskSyncService } from '../services/ghl/task.sync.service';
import { useApiStore } from '../store/apiStore';
import { useAuthStore } from '../store/authStore';
import { useBoardStore } from '../store/boardStore';

export const useTaskSync = () => {
  const location = useLocation();
  const { apiKey } = useApiStore();
  const { locationId } = useAuthStore();
  const { boards, loadBoards } = useBoardStore();
  
  useEffect(() => {
    const syncTasks = async () => {
      if (!apiKey || !locationId) return;

      try {
        console.log('Syncing tasks with GHL...');
        const syncService = TaskSyncService.getInstance();
        await syncService.syncAllTasks(locationId, apiKey);
        
        // Reload boards to get updated task data
        await loadBoards();
      } catch (error) {
        console.error('Error syncing tasks:', error);
      }
    };

    // Sync tasks whenever the route changes
    syncTasks();
  }, [location.pathname, apiKey, locationId, loadBoards]);
};