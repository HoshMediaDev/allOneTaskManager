import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  apiKey: string | null;
  baseUrl: string;
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  clearSettings: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      apiKey: null,
      baseUrl: 'https://rest.gohighlevel.com/v1/',
      setApiKey: (apiKey) => set({ apiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      clearSettings: () => set({ apiKey: null }),
    }),
    {
      name: 'location-storage',
    }
  )
);