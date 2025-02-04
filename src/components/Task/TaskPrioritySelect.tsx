import React from 'react';
import type { Task } from '../../types';

interface TaskPrioritySelectProps {
  value: Task['priority'];
  onChange: (priority: Task['priority']) => void;
}

export const TaskPrioritySelect: React.FC<TaskPrioritySelectProps> = ({ value, onChange }) => {
  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-red-500' },
  ] as const;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Priority
      </label>
      <div className="flex gap-2">
        {priorities.map(priority => (
          <button
            key={priority.value}
            type="button"
            onClick={() => onChange(priority.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${value === priority.value 
                ? `${priority.color} text-white` 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {priority.label}
          </button>
        ))}
      </div>
    </div>
  );
};