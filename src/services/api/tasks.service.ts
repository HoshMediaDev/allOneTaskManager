import { createClient } from '@supabase/supabase-js';
import { useApiStore } from '../../store/apiStore';

export class TasksService {
  private static instance: TasksService;
  private supabase;

  private constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  static getInstance(): TasksService {
    if (!this.instance) {
      this.instance = new TasksService();
    }
    return this.instance;
  }

  private async getApiKeyId(apiKey: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .select('id')
      .eq('key', apiKey)
      .single();

    if (error) {
      console.error('Error getting API key:', error);
      return null;
    }

    return data?.id;
  }

  async getTasks() {
    const { apiKey } = useApiStore.getState();
    if (!apiKey) throw new Error('API key not configured');

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createTask(task: { title: string; description?: string; priority: string }) {
    const { apiKey } = useApiStore.getState();
    if (!apiKey) throw new Error('API key not configured');

    const apiKeyId = await this.getApiKeyId(apiKey);
    if (!apiKeyId) throw new Error('Invalid API key');

    const { data, error } = await this.supabase
      .from('tasks')
      .insert([{ ...task, api_key_id: apiKeyId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(taskId: string, updates: Partial<{ title: string; description: string; priority: string; status: string }>) {
    const { apiKey } = useApiStore.getState();
    if (!apiKey) throw new Error('API key not configured');

    const { data, error } = await this.supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(taskId: string) {
    const { apiKey } = useApiStore.getState();
    if (!apiKey) throw new Error('API key not configured');

    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }
}