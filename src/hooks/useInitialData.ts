import { useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../store/authStore';
import { GHLApiClient } from '../services/ghl/api.client';

export const useInitialData = () => {
  const { loadTeamMembers } = useTeamStore();
  const { isOfflineMode, user } = useAuthStore();

  useEffect(() => {
    if (!isOfflineMode && user?.accessToken) {
      const apiClient = GHLApiClient.getInstance();
      apiClient.setAccessToken(user.accessToken);
      loadTeamMembers();
    }
  }, [loadTeamMembers, isOfflineMode, user]);
};