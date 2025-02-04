import { useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import { useApiStore } from '../store/apiStore';
import { useAuthStore } from '../store/authStore';
import { TeamService } from '../services/team/team.service';

export const useTeamData = () => {
  const { loadTeamMembers } = useTeamStore();
  const { apiKey } = useApiStore();
  const { isOfflineMode, setOfflineMode, userEmail } = useAuthStore();

  useEffect(() => {
    const loadData = async () => {
      if (!apiKey || isOfflineMode || !userEmail) return;

      try {
        const teamService = TeamService.getInstance();
        teamService.initialize(apiKey);
        await loadTeamMembers();
      } catch (error) {
        console.error('Failed to load team data:', error);
        setOfflineMode(true);
      }
    };

    loadData();
  }, [loadTeamMembers, apiKey, isOfflineMode, setOfflineMode, userEmail]);
};