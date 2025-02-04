import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ContactService } from '../services/ghl/contact.service';

export const useContactSync = () => {
  const { user, isOfflineMode } = useAuthStore();

  useEffect(() => {
    if (isOfflineMode || !user?.accessToken) return;

    const syncContacts = async () => {
      try {
        const contactService = ContactService.getInstance();
        contactService.initialize(user.accessToken);
        await contactService.searchContacts({ limit: 100 });
      } catch (error) {
        console.warn('Contact sync failed:', error);
      }
    };

    // Initial sync
    syncContacts();

    // Set up periodic sync every 5 minutes
    const syncInterval = setInterval(syncContacts, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, [user?.accessToken, isOfflineMode]);
};