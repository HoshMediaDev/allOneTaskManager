import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { CustomField } from '../types';
import { useAuthStore } from './authStore';

interface CustomFieldsStore {
  customFields: CustomField[];
  isLoading: boolean;
  error: string | null;
  loadCustomFields: () => Promise<void>;
  addCustomField: (field: Omit<CustomField, 'id'>) => Promise<void>;
  updateCustomField: (field: CustomField) => Promise<void>;
  deleteCustomField: (id: string) => Promise<void>;
}

export const useCustomFieldsStore = create<CustomFieldsStore>((set, get) => ({
  customFields: [],
  isLoading: false,
  error: null,

  loadCustomFields: async () => {
    const { locationId } = useAuthStore.getState();
    if (!locationId) return;

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ 
        customFields: data || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading custom fields:', error);
      set({ error: 'Failed to load custom fields', isLoading: false });
    }
  },

  addCustomField: async (field) => {
    const { locationId } = useAuthStore.getState();
    if (!locationId) return;

    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .insert([{ ...field, location_id: locationId }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        customFields: [...state.customFields, data]
      }));
    } catch (error) {
      console.error('Error adding custom field:', error);
      throw error;
    }
  },

  updateCustomField: async (field) => {
    try {
      const { error } = await supabase
        .from('custom_fields')
        .update(field)
        .eq('id', field.id);

      if (error) throw error;

      set(state => ({
        customFields: state.customFields.map(f => 
          f.id === field.id ? field : f
        )
      }));
    } catch (error) {
      console.error('Error updating custom field:', error);
      throw error;
    }
  },

  deleteCustomField: async (id) => {
    try {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        customFields: state.customFields.filter(f => f.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting custom field:', error);
      throw error;
    }
  }
}));