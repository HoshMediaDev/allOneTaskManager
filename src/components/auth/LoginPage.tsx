import React from 'react';
import { Layout } from 'lucide-react';
import { OAuthService } from '../../services/auth/oauth.service';
import { useAuthStore } from '../../store/authStore';

export const LoginPage: React.FC = () => {
  const { error, isLoading } = useAuthStore();

  const handleLogin = () => {
    window.location.href = OAuthService.getAuthUrl();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg text-center">
        <div className="flex justify-center">
          <Layout className="w-12 h-12 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">AO-Tasks</h2>
          <p className="mt-2 text-gray-400">Connect to GoHighLevel Task Manager</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Connecting...' : 'Connect to GHL Tasks'}
        </button>
      </div>
    </div>
  );
}