import React from 'react';

interface LocationIdInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const LocationIdInput: React.FC<LocationIdInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Location ID
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your Location ID"
        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        required
      />
      <p className="mt-1 text-sm text-gray-400">
        Enter your GoHighLevel Location ID to connect to your account
      </p>
    </div>
  );
};