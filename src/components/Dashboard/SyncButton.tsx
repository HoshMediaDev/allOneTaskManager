import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { TaskService } from '../../services/task/taskService';

export const SyncButton: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      await TaskService.syncAllTasksWithGHL();
    } catch (err) {
      console.error('Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync with All One');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg transition-colors ${
          isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
        }`}
      >
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>{isSyncing ? 'Syncing...' : 'Sync with All One'}</span>
      </button>
      
      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};