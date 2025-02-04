export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  locationId: string;
  accessToken: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: string;
    locationId: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}