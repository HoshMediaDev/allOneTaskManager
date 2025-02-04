import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { LocationIdInput } from './LocationIdInput';

export const LocationConfig: React.FC = () => {
  const { locationId, setLocationId } = useAuthStore();
  const [isEditing, setIsEditing] = useState(!locationId);
  const [newLocationId, setNewLocationId] = useState(locationId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocationId(newLocationId);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">Location Configuration</h3>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
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
            {locationId ? 'Change Location ID' : 'Configure Location'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <LocationIdInput 
            value={newLocationId}
            onChange={setNewLocationId}
          />
          
          <div className="flex justify-end space-x-3">
            {locationId && (
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
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
};