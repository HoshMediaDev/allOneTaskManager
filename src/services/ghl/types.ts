export interface GHLAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface GHLApiError {
  code: string;
  message: string;
  status: number;
}

export interface GHLUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  locationId: string;
}

export interface RefreshTokenParams {
  refresh_token: string;
  client_id: string;
  client_secret: string;
  grant_type: 'refresh_token';
}