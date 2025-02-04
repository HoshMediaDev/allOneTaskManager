import { useState, useEffect, useCallback } from 'react';
import { useTaskActions } from './useTaskActions';
import type { Task } from '../types';

export const useTimeTracking = (task: Task) => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(task.actualTime || 0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const { updateTask } = useTaskActions();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000 / 60);
        setElapsedTime((task.actualTime || 0) + elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime, task.actualTime]);

  const start = useCallback(() => {
    setIsTracking(true);
    setStartTime(Date.now());
  }, []);

  const stop = useCallback(() => {
    setIsTracking(false);
    if (startTime) {
      const now = Date.now();
      const additionalMinutes = Math.floor((now - startTime) / 1000 / 60);
      const newActualTime = (task.actualTime || 0) + additionalMinutes;
      
      updateTask({
        ...task,
        actualTime: newActualTime,
      });
    }
    setStartTime(null);
  }, [startTime, task, updateTask]);

  const updateManualTime = useCallback((minutes: number) => {
    updateTask({
      ...task,
      actualTime: minutes,
    });
    setElapsedTime(minutes);
  }, [task, updateTask]);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }, []);

  return {
    isTracking,
    elapsedTime,
    start,
    stop,
    updateManualTime,
    formatTime,
  };
};