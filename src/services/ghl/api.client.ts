import { RateLimiter } from './rate-limiter';
import { GHLApiError } from './api.error';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export class GHLApiClient {
  private static instance: GHLApiClient;
  private rateLimiter: RateLimiter;
  private accessToken: string | null = null;
  private baseUrl = 'https://rest.gohighlevel.com/v1';

  private constructor() {
    this.rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
  }

  static getInstance(): GHLApiClient {
    if (!this.instance) {
      this.instance = new GHLApiClient();
    }
    return this.instance;
  }

  setAccessToken(token: string) {
    console.log('Setting GHL access token:', token ? 'Token provided' : 'No token');
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private getAuthHeaders(): HeadersInit {
    if (!this.accessToken) {
      throw new GHLApiError('No access token available', 401);
    }

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      'Accept': 'application/json'
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    await this.rateLimiter.waitForAvailability();

    if (!this.accessToken) {
      throw new GHLApiError('Authentication required', 401);
    }

    let url = `${this.baseUrl}${endpoint}`;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      url += `?${searchParams.toString()}`;
    }

    try {
      console.log('Making GHL API request:', {
        url,
        method: options.method || 'GET',
        hasToken: !!this.accessToken
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('GHL API Error Response:', {
          status: response.status,
          data,
          url,
          method: options.method || 'GET'
        });

        throw new GHLApiError(
          data?.message || `API request failed: ${response.statusText}`,
          response.status
        );
      }

      return data;
    } catch (error) {
      console.error('GHL API Request Failed:', {
        error,
        endpoint,
        method: options.method || 'GET'
      });

      if (error instanceof GHLApiError) {
        throw error;
      }

      throw new GHLApiError(
        error instanceof Error ? error.message : 'API request failed',
        500
      );
    }
  }
}