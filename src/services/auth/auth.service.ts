import type { AuthUser } from './types';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

class AuthService {
  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }

  getAuthData(): AuthUser | null {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private setAuthData(user: AuthUser): void {
    localStorage.setItem(AUTH_TOKEN_KEY, user.accessToken);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
}

export const authService = new AuthService();