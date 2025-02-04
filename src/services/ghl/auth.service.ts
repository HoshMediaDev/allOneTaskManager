import { GHLApiClient } from './api.client';
import { GHL_CONFIG, API_VERSION } from './config';
import type { TokenResponse, GHLUser } from './types';
import { GHLApiError } from './api.error';

export class GHLAuthService {
  private static instance: GHLAuthService;
  private apiClient: GHLApiClient;

  private constructor() {
    this.apiClient = GHLApiClient.getInstance();
  }

  static getInstance(): GHLAuthService {
    if (!this.instance) {
      this.instance = new GHLAuthService();
    }
    return this.instance;
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const formData = new URLSearchParams({
        client_id: GHL_CONFIG.CLIENT_ID,
        client_secret: GHL_CONFIG.CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: GHL_CONFIG.REDIRECT_URI,
        user_type: 'Location'
      });

      const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        throw new GHLApiError('Failed to exchange code for token', response.status);
      }

      const data = await response.json();
      this.apiClient.setAccessToken(data.access_token);
      return data;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  async getCurrentUser(accessToken: string): Promise<GHLUser> {
    this.apiClient.setAccessToken(accessToken);
    return this.apiClient.request<GHLUser>('/users/me');
  }
}