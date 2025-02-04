import type { AuthUser } from './types';

export class OAuthService {
  static getAuthUrl(): string {
    const state = Math.random().toString(36).substring(2, 15);
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GHL_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      response_type: 'code',
      state,
      user_type: 'Location'
    });

    return `https://marketplace.gohighlevel.com/oauth/chooselocation?${params.toString()}`;
  }

  static async handleCallback(code: string): Promise<AuthUser> {
    try {
      const tokenResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GHL_CLIENT_ID,
          client_secret: import.meta.env.VITE_GHL_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI,
          user_type: 'Location'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const response = await tokenResponse.json();

      // Return minimal user object since we're removing API integration
      return {
        id: 'local-user',
        email: 'local@example.com',
        firstName: 'Local',
        lastName: 'User',
        companyId: 'local',
        locationId: 'local',
        accessToken: response.access_token,
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Failed to complete authentication');
    }
  }
}