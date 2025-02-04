import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const ApiKeyConfig: React.FC = () => {
  const { apiKey, locationId, setApiKey, setLocationId } = useAuthStore();
  const [newApiKey, setNewApiKey] = useState(apiKey || '');
  const [newLocationId, setNewLocationId] = useState(locationId || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(newApiKey);
    setLocationId(newLocationId);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">API Configuration</h3>
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
            <p className="text-sm text-gray-400">Location ID</p>
            <p className="text-white font-mono">
              {locationId || 'Not configured'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Configure API Key
          </button>
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
              Location ID
            </label>
            <input
              type="text"
              value={newLocationId}
              onChange={(e) => setNewLocationId(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
};