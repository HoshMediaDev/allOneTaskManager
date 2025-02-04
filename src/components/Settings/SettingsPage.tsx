import React from 'react';
import { CustomFieldsManager } from './CustomFieldsManager';
import { ApiSettings } from './ApiSettings/ApiSettings';
import { LocationDisplay } from './LocationDisplay/LocationDisplay';
import { TeamList } from '../Team/TeamList';
import { BackButton } from '../ui/BackButton';
import { CustomCSSEditor } from './CustomCSS/CustomCSSEditor';

export const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BackButton fallbackPath="/tasks" />
          <h1 className="text-2xl font-bold text-white ml-4">Settings</h1>
        </div>
      </div>
      
      <div className="space-y-6">
        <ApiSettings />
        <LocationDisplay />
        <TeamList />
        <CustomCSSEditor />
        <div className="bg-gray-800 rounded-lg p-6">
          <CustomFieldsManager />
        </div>
      </div>
    </div>
  );
};