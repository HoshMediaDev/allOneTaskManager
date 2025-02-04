import React from 'react';
import { Calendar } from 'lucide-react';

interface TaskDatesProps {
  startDate?: string;
  dueDate?: string;
  onChange: (updates: { startDate?: string; dueDate?: string }) => void;
}

export const TaskDates: React.FC<TaskDatesProps> = ({
  startDate,
  dueDate,
  onChange,
}) => {
  return (
    <div className="flex space-x-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Start Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={startDate || ''}
            onChange={e => onChange({ startDate: e.target.value })}
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Due Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={dueDate || ''}
            onChange={e => onChange({ dueDate: e.target.value })}
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};