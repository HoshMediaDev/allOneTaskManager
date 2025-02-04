import React from 'react';
import { Layout } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Layout className="w-8 h-8 text-indigo-500" />
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>
    </div>
  );
};