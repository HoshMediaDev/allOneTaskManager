import React, { useState } from 'react';
import { MapPin, TestTube } from 'lucide-react';
import { useLocationStore } from '../../../store/locationStore';
import { LocationService } from '../../../services/location/location.service';

export const LocationSettings: React.FC = () => {
  const { apiKey, baseUrl, setApiKey, setBaseUrl } = useLocationStore();
  const [isEditing, setIsEditing] = useState(!apiKey);
  const [newApiKey, setNewApiKey] = useState(apiKey || '');
  const [newBaseUrl, setNewBaseUrl] = useState(baseUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(newApiKey);
    setBaseUrl(newBaseUrl);
    setIsEditing(false);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const locationService = LocationService.getInstance();
      const isConnected = await locationService.testConnection();
      setTestStatus(isConnected ? 'success' : 'error');
    } catch (error) {
      setTestStatus('error');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">Location API Settings</h3>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">API Key</p>
            <p className="text-white font-mono">
              {apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-8)}` : 'Not configured'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Base URL</p>
            <p className="text-white font-mono">{baseUrl}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Edit Settings
            </button>
            <button
              onClick={handleTestConnection}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              <TestTube className="w-4 h-4" />
              Test Connection
            </button>
          </div>
          {testStatus !== 'idle' && (
            <div className={`mt-2 text-sm ${
              testStatus === 'testing' ? 'text-yellow-400' :
              testStatus === 'success' ? 'text-green-400' :
              'text-red-400'
            }`}>
              {testStatus === 'testing' ? 'Testing connection...' :
               testStatus === 'success' ? 'Connection successful!' :
               'Connection failed'}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              API Key
            </label>
            <input
              type="text"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Base URL
            </label>
            <input
              type="url"
              value={newBaseUrl}
              onChange={(e) => setNewBaseUrl(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            {apiKey && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Save Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};