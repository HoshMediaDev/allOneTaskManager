import { create } from 'zustand';
import { ContactService } from '../services/ghl/contact.service';
import { useApiStore } from './apiStore';
import { useAuthStore } from './authStore';

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags: string[];
  dateAdded: string;
  dateUpdated: string;
  customFields: Array<{
    id: string;
    name: string;
    value: string;
  }>;
  ghl_id: string;
}

interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  loadContacts: () => Promise<void>;
  getContactById: (id: string) => Promise<Contact | null>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,

  loadContacts: async () => {
    const { apiKey } = useApiStore.getState();
    const { isOfflineMode } = useAuthStore.getState();

    if (isOfflineMode) {
      set({ contacts: [], error: null, isLoading: false });
      return;
    }

    if (!apiKey) {
      set({ contacts: [], error: 'API key not configured', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const contactService = ContactService.getInstance();
      contactService.initialize(apiKey);
      
      const response = await contactService.searchContacts({
        limit: 100,
        page: 1
      });

      set({ 
        contacts: response.contacts,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load contacts:', error);
      
      if (error instanceof Error) {
        set({ 
          error: error.message,
          isLoading: false,
          contacts: []
        });
      } else {
        set({ 
          error: 'Failed to load contacts',
          isLoading: false,
          contacts: []
        });
      }
    }
  },

  getContactById: async (id: string) => {
    const { apiKey } = useApiStore.getState();
    const { isOfflineMode } = useAuthStore.getState();

    if (isOfflineMode || !apiKey) {
      return null;
    }

    try {
      const contactService = ContactService.getInstance();
      contactService.initialize(apiKey);
      return await contactService.getContactById(id);
    } catch (error) {
      console.error('Failed to get contact:', error);
      return null;
    }
  }
}));