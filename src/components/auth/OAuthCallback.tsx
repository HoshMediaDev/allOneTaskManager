import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { GHLAuthService } from '../../services/ghl/auth.service';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setError, setOfflineMode } = useAuthStore();
  const authService = GHLAuthService.getInstance();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (!code) {
        setError('No authorization code received');
        navigate('/');
        return;
      }

      try {
        console.log('Exchanging code for token...');
        const tokenResponse = await authService.exchangeCodeForToken(code);
        console.log('Token received, fetching user info...');
        
        try {
          const userData = await authService.getCurrentUser(tokenResponse.access_token);
          console.log('User info received:', userData);

          setUser({
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            companyId: userData.companyId || '',
            locationId: userData.locationId || '',
            accessToken: tokenResponse.access_token,
          });
        } catch (userError) {
          console.error('Failed to fetch user data, entering offline mode:', userError);
          // Create a temporary user for offline mode
          setUser({
            id: 'offline-user',
            email: 'offline@example.com',
            firstName: 'Offline',
            lastName: 'User',
            companyId: 'offline',
            locationId: 'offline',
            accessToken: tokenResponse.access_token,
          });
          setOfflineMode(true);
        }

        navigate('/tasks');
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setUser, setError, setOfflineMode]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};