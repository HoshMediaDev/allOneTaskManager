import { GHLApiClient } from './api.client';
import type { Task } from '../../types';
import { GHLApiError } from './api.error';

interface GHLTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'completed' | 'incompleted';
  assignedTo?: string;
}

export class GHLTaskService {
  private static instance: GHLTaskService;
  private apiClient: GHLApiClient;

  private constructor() {
    this.apiClient = GHLApiClient.getInstance();
  }

  static getInstance(): GHLTaskService {
    if (!this.instance) {
      this.instance = new GHLTaskService();
    }
    return this.instance;
  }

  setAccessToken(token: string) {
    if (!token) {
      throw new Error('Access token is required');
    }
    this.apiClient.setAccessToken(token);
  }

  async getTask(taskId: string, contactId: string): Promise<GHLTask | null> {
    try {
      const token = this.apiClient.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      console.log('Fetching GHL task:', { taskId, contactId });

      const response = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}/tasks/${taskId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          console.log('Task not found in GHL:', { taskId, error: errorText });
          return null;
        }
        throw new GHLApiError(
          `Failed to fetch task: ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      if (!data || !data.task) {
        console.log('Invalid response from GHL:', data);
        throw new Error('Invalid response format from GHL');
      }

      // Transform GHL task data to our format
      const ghlTask: GHLTask = {
        id: data.task.id,
        title: data.task.title || '',
        description: data.task.description || '',
        dueDate: data.task.dueDate,
        status: data.task.completed ? 'completed' : 'incompleted',
        assignedTo: data.task.assignedTo
      };

      console.log('Successfully fetched GHL task:', {
        id: ghlTask.id,
        title: ghlTask.title,
        status: ghlTask.status
      });

      return ghlTask;
    } catch (error) {
      // Enhance error logging
      console.error('Error fetching GHL task:', {
        taskId,
        contactId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });

      // If task not found, return null
      if (error instanceof GHLApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  async createTask(task: Task, contactId: string): Promise<string> {
    const token = this.apiClient.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const teamMemberAssignee = task.assignees.find(a => !a.ghl_id);
      
      const payload = {
        title: task.title.trim(),
        dueDate: task.dueDate,
        description: task.description?.trim() || '',
        assignedTo: teamMemberAssignee?.id || '',
        status: task.status
      };

      console.log('Creating GHL task:', {
        contactId,
        title: payload.title,
        hasTeamMember: Boolean(teamMemberAssignee)
      });

      const response = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new GHLApiError(
          `Failed to create task: ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      if (!data.id) {
        throw new GHLApiError('Invalid task response from GHL', 500);
      }

      return data.id;
    } catch (error) {
      console.error('Failed to create GHL task:', {
        contactId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }

  async updateTask(taskId: string, contactId: string, updates: Partial<Task>): Promise<void> {
    const token = this.apiClient.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const teamMemberAssignee = updates.assignees?.find(a => !a.ghl_id);

      const payload = {
        title: updates.title?.trim(),
        dueDate: updates.dueDate,
        description: updates.description?.trim() || '',
        assignedTo: teamMemberAssignee?.id || '',
        status: updates.status
      };

      console.log('Updating GHL task:', {
        taskId,
        contactId,
        title: payload.title,
        status: payload.status
      });

      const response = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new GHLApiError(
          `Failed to update task: ${response.statusText} - ${errorText}`,
          response.status
        );
      }
    } catch (error) {
      console.error('Failed to update GHL task:', {
        taskId,
        contactId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }

  async deleteTask(taskId: string, contactId: string): Promise<void> {
    const token = this.apiClient.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Ignore 404 errors as the task may already be deleted
      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        throw new GHLApiError(
          `Failed to delete task: ${response.statusText} - ${errorText}`,
          response.status
        );
      }
    } catch (error) {
      // Log error but don't throw for 404s
      if (error instanceof Error && error.message.includes('404')) {
        console.log('Task already deleted from GHL:', { taskId, contactId });
        return;
      }

      console.error('Failed to delete GHL task:', {
        taskId,
        contactId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }
}