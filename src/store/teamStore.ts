import { create } from 'zustand';
import type { TeamMember } from '../types/team';
import { TeamService } from '../services/team/team.service';
import { ApiError } from '../services/errors/ApiError';
import { useAuthStore } from './authStore';

interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  loadTeamMembers: () => Promise<void>;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: [],
  isLoading: false,
  error: null,

  loadTeamMembers: async () => {
    const { isOfflineMode, setOfflineMode } = useAuthStore.getState();
    
    // Don't attempt to load if in offline mode
    if (isOfflineMode) {
      set({ members: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const teamService = TeamService.getInstance();
      const response = await teamService.getTeamMembers();
      
      set({ 
        members: response.users || [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load team members:', error);
      
      // Handle server errors by switching to offline mode
      if (error instanceof ApiError && error.status === 500) {
        setOfflineMode(true);
        set({ 
          members: [],
          error: null,
          isLoading: false 
        });
        return;
      }

      // Handle other API errors with appropriate messages
      let errorMessage = 'Failed to load team members';
      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            errorMessage = 'Please configure API settings';
            break;
          case 403:
            errorMessage = 'Access denied';
            break;
          case 404:
            errorMessage = 'No team members found';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      set({ 
        error: errorMessage,
        isLoading: false,
        members: []
      });
    }
  }
}));