import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isOfflineMode: boolean;
  locationId: string | null;
  userEmail: string | null;
  setOfflineMode: (mode: boolean) => void;
  setLocationId: (id: string | null) => void;
  setUserEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isOfflineMode: false,
      locationId: null,
      userEmail: null,
      setOfflineMode: (isOfflineMode) => set({ isOfflineMode }),
      setLocationId: (locationId) => set({ locationId }),
      setUserEmail: (email) => set({ 
        // Always store email in lowercase for consistent comparison
        userEmail: email ? email.toLowerCase() : null 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);