import React from 'react';
import { Clock } from 'lucide-react';

interface TaskTimeTrackingProps {
  estimatedTime?: number;
  actualTime?: number;
  onChange: (updates: { estimatedTime?: number; actualTime?: number }) => void;
}

export const TaskTimeTracking: React.FC<TaskTimeTrackingProps> = ({
  estimatedTime,
  actualTime,
  onChange,
}) => {
  const formatTime = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string) => {
    if (!timeStr) return undefined;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-white">Time Tracking</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Estimated Time (HH:MM)
          </label>
          <input
            type="text"
            value={formatTime(estimatedTime)}
            onChange={e => onChange({ estimatedTime: parseTime(e.target.value) })}
            placeholder="0:00"
            pattern="\d+:[0-5]\d"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Actual Time (HH:MM)
          </label>
          <input
            type="text"
            value={formatTime(actualTime)}
            onChange={e => onChange({ actualTime: parseTime(e.target.value) })}
            placeholder="0:00"
            pattern="\d+:[0-5]\d"
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};