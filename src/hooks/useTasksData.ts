import { useState, useEffect } from 'react';
import { TasksService } from '../services/api/tasks.service';
import { useApiStore } from '../store/apiStore';

export const useTasksData = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiKey } = useApiStore();
  
  useEffect(() => {
    const loadTasks = async () => {
      if (!apiKey) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const tasksService = TasksService.getInstance();
        const data = await tasksService.getTasks();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [apiKey]);

  const createTask = async (task: { title: string; description?: string; priority: string }) => {
    try {
      const tasksService = TasksService.getInstance();
      const newTask = await tasksService.createTask(task);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<{ title: string; description: string; priority: string; status: string }>) => {
    try {
      const tasksService = TasksService.getInstance();
      const updatedTask = await tasksService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const tasksService = TasksService.getInstance();
      await tasksService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      throw err;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask
  };
};