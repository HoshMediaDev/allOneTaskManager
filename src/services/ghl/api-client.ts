import { GHL_API_BASE_URL } from './config';
import type { GHLApiError } from './types';

class GHLApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = GHL_API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.code || 'ERROR',
          message: data.message || 'An error occurred',
          status: response.status,
        } as GHLApiError;
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }
}

export const ghlApiClient = new GHLApiClient();