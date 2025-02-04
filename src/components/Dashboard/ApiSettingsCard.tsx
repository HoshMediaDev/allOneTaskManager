import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { useApiStore } from '../../store/apiStore';
import { useTeamStore } from '../../store/teamStore';

export const ApiSettingsCard: React.FC = () => {
  const { apiKey, setApiKey } = useApiStore();
  const { loadTeamMembers } = useTeamStore();
  const [isEditing, setIsEditing] = useState(!apiKey);
  const [newApiKey, setNewApiKey] = useState(apiKey || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(newApiKey);
    setIsEditing(false);
    await loadTeamMembers();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">API Settings</h3>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">API Key</p>
            <p className="text-white font-mono">
              {apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-8)}` : 'Not configured'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {apiKey ? 'Change API Key' : 'Configure API Key'}
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
              placeholder="Enter your API key"
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
              Save API Key
            </button>
          </div>
        </form>
      )}
    </div>
  );
};