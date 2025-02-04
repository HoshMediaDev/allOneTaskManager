import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskDetails } from '../../hooks/useTaskDetails';
import { TaskView } from './TaskView';
import { TaskForm } from './TaskForm';
import { useBoardStore } from '../../store/boardStore';
import { BackButton } from '../ui/BackButton';
import { useTaskActions } from '../../hooks/useTaskActions';
import { TaskService } from '../../services/task/taskService';
import { supabase } from '../../lib/supabase';
import type { Task } from '../../types';

export const TaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { task: initialTask, isLoading, error: loadError } = useTaskDetails(taskId);
  const { customFields } = useBoardStore();
  const { deleteTask } = useTaskActions();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);

  // Set initial task
  useEffect(() => {
    if (initialTask) {
      setTask(initialTask);
    }
  }, [initialTask]);

  // Subscribe to task updates
  useEffect(() => {
    if (!taskId) return;

    // Subscribe to both shared and private tasks
    const sharedChannel = supabase.channel(`shared-task-${taskId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `id=eq.${taskId}`
      }, (payload) => {
        if (payload.new) {
          setTask(current => current ? {
            ...current,
            ...payload.new,
            assignees: payload.new.assignees || current.assignees,
            labels: payload.new.labels || current.labels,
            tags: payload.new.tags || current.tags,
            checklist: payload.new.checklist || current.checklist,
            attachments: payload.new.attachments || current.attachments,
            customFieldValues: payload.new.custom_field_values || current.customFieldValues
          } : null);
        }
      })
      .subscribe();

    const privateChannel = supabase.channel(`private-task-${taskId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'private_tasks',
        filter: `id=eq.${taskId}`
      }, (payload) => {
        if (payload.new) {
          setTask(current => current ? {
            ...current,
            ...payload.new,
            assignees: payload.new.assignees || current.assignees,
            labels: payload.new.labels || current.labels,
            tags: payload.new.tags || current.tags,
            checklist: payload.new.checklist || current.checklist,
            attachments: payload.new.attachments || current.attachments,
            customFieldValues: payload.new.custom_field_values || current.customFieldValues
          } : null);
        }
      })
      .subscribe();

    return () => {
      sharedChannel.unsubscribe();
      privateChannel.unsubscribe();
    };
  }, [taskId]);

  const handleSave = async (updatedTask: Task) => {
    if (!task || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      const result = await TaskService.updateTask(task.id, updatedTask);
      setTask(result);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTask(task.id, task.listId);
      navigate(-1);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (loadError || !task) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <BackButton fallbackPath="/tasks" />
        <div className="text-center text-red-400 mt-6">
          {loadError || 'Task not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <BackButton fallbackPath="/tasks" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {isEditing ? (
            <TaskForm
              task={task}
              customFields={customFields}
              onSubmit={handleSave}
              onCancel={() => setIsEditing(false)}
              onDelete={handleDelete}
              isSubmitting={isSaving}
              mode="edit"
            />
          ) : (
            <TaskView 
              task={task} 
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};