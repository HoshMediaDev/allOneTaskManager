import React from 'react';
import { MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const LocationDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('locationid');

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">Location Information</h3>
      </div>

      <div>
        <p className="text-sm text-gray-400">Location ID</p>
        <p className="text-white font-mono bg-gray-700 px-3 py-2 rounded-lg mt-1">
          {locationId || 'No location ID in URL'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Location ID is automatically set from the URL and cannot be changed manually
        </p>
      </div>
    </div>
  );
};