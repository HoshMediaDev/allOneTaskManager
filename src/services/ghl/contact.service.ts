import { GHLApiClient } from './api.client';
import type { Contact, ContactsResponse, ContactSearchParams } from './types/contact.types';
import { GHLApiError } from './api.error';
import { supabase } from '../../lib/supabase';
import { useApiStore } from '../../store/apiStore';
import { useAuthStore } from '../../store/authStore';

export class ContactService {
  private static instance: ContactService;
  private apiClient: GHLApiClient;

  private constructor() {
    this.apiClient = GHLApiClient.getInstance();
  }

  static getInstance(): ContactService {
    if (!this.instance) {
      this.instance = new ContactService();
    }
    return this.instance;
  }

  initialize(accessToken: string) {
    this.apiClient.setAccessToken(accessToken);
  }

  async searchContacts(params: ContactSearchParams = {}): Promise<ContactsResponse> {
    try {
      if (!this.apiClient.getAccessToken()) {
        console.warn('No access token available for contact search');
        return {
          contacts: [],
          meta: { total: 0, count: 0, currentPage: 1, totalPages: 1 }
        };
      }

      const { apiKey } = useApiStore.getState();
      const { locationId } = useAuthStore.getState();

      if (!locationId) {
        console.warn('No location ID available');
        return {
          contacts: [],
          meta: { total: 0, count: 0, currentPage: 1, totalPages: 1 }
        };
      }

      console.log('Searching GHL contacts:', {
        query: params.query,
        limit: params.limit,
        page: params.page,
        locationId
      });

      const response = await this.apiClient.request<any>('/contacts', {
        method: 'GET',
        params: {
          limit: params.limit || 100,
          page: params.page || 1,
          query: params.query
        }
      });

      if (!response || !Array.isArray(response.contacts)) {
        console.warn('Invalid response format from GHL:', response);
        return {
          contacts: [],
          meta: { total: 0, count: 0, currentPage: 1, totalPages: 1 }
        };
      }

      // Store data in background without affecting the main flow
      if (apiKey) {
        const contactsToUpsert = response.contacts.map(contact => ({
          ghl_id: contact.id,
          name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email || 'Unnamed Contact',
          location_id: locationId, // Use actual locationId
          api_key: apiKey
        }));

        // Background storage - don't await or handle errors in main flow
        supabase
          .from('contacts')
          .upsert(contactsToUpsert, {
            onConflict: 'ghl_id'
          })
          .then(() => {
            console.log('Contact data stored successfully');
          })
          .catch(error => {
            console.warn('Failed to store contact data:', error);
          });
      }

      // Return data directly from API response
      const contacts = response.contacts.map(contact => ({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        type: 'contact',
        source: 'ghl',
        tags: contact.tags || [],
        dateAdded: contact.dateCreated || contact.dateAdded || new Date().toISOString(),
        dateUpdated: contact.dateUpdated || new Date().toISOString(),
        customFields: contact.customFields || [],
        ghl_id: contact.id
      }));

      return {
        contacts,
        meta: {
          total: response.total || contacts.length,
          count: contacts.length,
          currentPage: params.page || 1,
          totalPages: Math.ceil((response.total || contacts.length) / (params.limit || 100))
        }
      };
    } catch (error) {
      console.error('Failed to fetch contacts from GHL:', error);
      throw error;
    }
  }

  async getContactById(contactId: string): Promise<Contact | null> {
    try {
      if (!this.apiClient.getAccessToken()) {
        console.warn('No access token available for contact lookup');
        return null;
      }

      const { apiKey } = useApiStore.getState();
      const { locationId } = useAuthStore.getState();

      if (!locationId) {
        console.warn('No location ID available');
        return null;
      }

      const response = await this.apiClient.request<any>(`/contacts/${contactId}`);
      
      if (!response || !response.contact) {
        console.warn('Contact not found:', contactId);
        return null;
      }

      // Store data in background without affecting the main flow
      if (apiKey) {
        supabase
          .from('contacts')
          .upsert({
            ghl_id: response.contact.id,
            name: `${response.contact.firstName || ''} ${response.contact.lastName || ''}`.trim() || response.contact.email || 'Unnamed Contact',
            location_id: locationId, // Use actual locationId
            api_key: apiKey
          }, {
            onConflict: 'ghl_id'
          })
          .then(() => {
            console.log('Contact data stored successfully');
          })
          .catch(error => {
            console.warn('Failed to store contact data:', error);
          });
      }

      // Return data directly from API response
      return {
        id: response.contact.id,
        firstName: response.contact.firstName,
        lastName: response.contact.lastName,
        email: response.contact.email,
        type: 'contact',
        source: 'ghl',
        tags: response.contact.tags || [],
        dateAdded: response.contact.dateCreated || new Date().toISOString(),
        dateUpdated: response.contact.dateUpdated || new Date().toISOString(),
        customFields: response.contact.customFields || [],
        ghl_id: response.contact.id
      };
    } catch (error) {
      console.error('Failed to fetch contact from GHL:', error);
      return null;
    }
  }
}