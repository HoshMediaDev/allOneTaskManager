import { GHLApiClient } from './api.client';
import { supabase } from '../../lib/supabase';
import type { Contact } from './types/contact.types';

export class ContactSyncService {
  private static instance: ContactSyncService;
  private apiClient: GHLApiClient;

  private constructor() {
    this.apiClient = GHLApiClient.getInstance();
  }

  static getInstance(): ContactSyncService {
    if (!this.instance) {
      this.instance = new ContactSyncService();
    }
    return this.instance;
  }

  async syncContacts(): Promise<void> {
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        // Fetch contacts from GHL
        const response = await this.apiClient.request<any>('/contacts', {
          params: {
            page,
            limit: 100
          }
        });

        if (!response.contacts?.length) {
          hasMore = false;
          break;
        }

        // Prepare contacts for upsert
        const contacts = response.contacts.map(contact => ({
          ghl_id: contact.id,
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          tags: contact.tags || [],
          custom_fields: contact.customFields || [],
          metadata: {
            ghl_sync: {
              status: 'synced',
              lastSync: new Date().toISOString()
            }
          }
        }));

        // Upsert contacts to local database
        const { error } = await supabase
          .from('contacts')
          .upsert(contacts, {
            onConflict: 'ghl_id',
            ignoreDuplicates: false
          });

        if (error) throw error;

        // Check if there are more pages
        hasMore = response.contacts.length === 100;
        page++;
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      throw error;
    }
  }

  async getLocalContact(ghlId: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('ghl_id', ghlId)
      .single();

    if (error) {
      console.error('Error fetching local contact:', error);
      return null;
    }

    return data;
  }

  async updateSyncStatus(ghlId: string, status: 'synced' | 'error', error?: string): Promise<void> {
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        metadata: {
          ghl_sync: {
            status,
            lastSync: new Date().toISOString(),
            error
          }
        }
      })
      .eq('ghl_id', ghlId);

    if (updateError) {
      console.error('Error updating contact sync status:', updateError);
    }
  }
}