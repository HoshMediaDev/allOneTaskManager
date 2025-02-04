import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GHLApiClient } from '../services/ghl/api.client';

interface ApiState {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

export const useApiStore = create<ApiState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (apiKey) => {
        // Initialize GHL API client with new key
        const apiClient = GHLApiClient.getInstance();
        apiClient.setAccessToken(apiKey);
        set({ apiKey });
      },
      clearApiKey: () => {
        // Clear API client token
        const apiClient = GHLApiClient.getInstance();
        apiClient.setAccessToken('');
        set({ apiKey: null });
      },
    }),
    {
      name: 'api-storage',
    }
  )
);