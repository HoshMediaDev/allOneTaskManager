import React from 'react';
import { Clock, Play, Pause, StopCircle } from 'lucide-react';
import { useTimeTracking } from '../../../hooks/useTimeTracking';
import type { Task } from '../../../types';

interface TimeTrackingSectionProps {
  task: Task;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({ task }) => {
  const { isTracking, elapsedTime, start, stop, formatTime } = useTimeTracking(task);

  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-medium text-white">Time Tracking</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {!isTracking ? (
            <button
              onClick={start}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          ) : (
            <>
              <button
                onClick={stop}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
              <button
                onClick={stop}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {task.estimatedTime && (
          <div>
            <span className="text-sm text-gray-400">Estimated</span>
            <p className="text-white font-medium">{formatTime(task.estimatedTime)}</p>
          </div>
        )}
        <div>
          <span className="text-sm text-gray-400">Actual</span>
          <p className="text-white font-medium">{formatTime(elapsedTime)}</p>
        </div>
      </div>
    </div>
  );
};