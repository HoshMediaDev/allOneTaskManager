import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskService } from '../services/task/taskService';
import type { Task } from '../types';

export const useTaskDetails = (taskId: string | undefined) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTaskDetails = async () => {
      if (!taskId) {
        setTask(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const taskData = await TaskService.getTaskById(taskId);
        
        if (!taskData) {
          // Task was deleted (either not found or deleted due to GHL sync)
          navigate(-1); // Go back to previous page
          return;
        }
        
        setTask(taskData);
      } catch (err) {
        console.error('Error loading task details:', err);
        setError('Failed to load task details');
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskDetails();
  }, [taskId, navigate]);

  return { task, isLoading, error };
};