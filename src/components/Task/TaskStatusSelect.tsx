import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import type { Task } from '../../types';

interface TaskStatusSelectProps {
  value: Task['status'];
  onChange: (status: Task['status']) => void;
}

export const TaskStatusSelect: React.FC<TaskStatusSelectProps> = ({ value, onChange }) => {
  const statuses = [
    { value: 'incompleted', label: 'Incompleted', icon: Circle, color: 'bg-gray-500' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-500' },
  ] as const;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Status
      </label>
      <div className="flex gap-2">
        {statuses.map(status => {
          const Icon = status.icon;
          return (
            <button
              key={status.value}
              type="button"
              onClick={() => onChange(status.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${value === status.value 
                  ? `${status.color} text-white` 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <Icon className="w-4 h-4" />
              {status.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}