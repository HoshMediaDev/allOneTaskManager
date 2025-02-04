import React from 'react';
import { Calendar } from 'lucide-react';

interface TaskDatesProps {
  dueDate?: string;
  onChange: (updates: { dueDate?: string }) => void;
}

export const TaskDates: React.FC<TaskDatesProps> = ({
  dueDate,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Due Date
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="datetime-local"
          value={dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ''}
          onChange={e => onChange({ dueDate: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  );
};