import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Tag, Edit, Lock } from 'lucide-react';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { useAuthStore } from '../../store/authStore';
import { BackButton } from '../ui/BackButton';
import { PrivateTaskForm } from './PrivateTaskForm';
import { ListService } from '../../services/board/listService';
import { supabase } from '../../lib/supabase';
import type { Task } from '../../types';

export const PrivateTaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { userEmail } = useAuthStore();
  const { currentBoard, updateBoard } = usePrivateBoardStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId || !userEmail) return;

      try {
        setIsLoading(true);
        setError(null);

        // Set user email for RLS
        await supabase.rpc('set_user_email', { email: userEmail });

        // Get task from private_tasks table
        const { data, error } = await supabase
          .from('private_tasks')
          .select(`
            *,
            list:private_lists!private_tasks_list_id_fkey (
              id,
              title,
              board:private_boards!private_lists_board_id_fkey (
                id,
                title
              )
            )
          `)
          .eq('id', taskId)
          .eq('user_email', userEmail)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Task not found');

        setTask({
          id: data.id,
          title: data.title,
          description: data.description || '',
          content: data.content || '',
          priority: data.priority || 'medium',
          labels: data.labels || [],
          assignees: data.assignees || [],
          listId: data.list_id,
          tags: data.tags || [],
          customFieldValues: data.custom_field_values || [],
          attachments: data.attachments || [],
          checklist: data.checklist || [],
          dueDate: data.due_date,
          startDate: data.start_date,
          estimatedTime: data.estimated_time,
          actualTime: data.actual_time,
          status: data.status || 'incompleted',
          position: data.position,
          is_private: true,
          user_email: data.user_email
        });
      } catch (err) {
        console.error('Error loading private task:', err);
        setError('Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId, userEmail]);

  // Subscribe to task updates
  useEffect(() => {
    if (!taskId || !userEmail) return;

    const channel = supabase.channel(`private-task-${taskId}`)
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
            labels: payload.new.labels || [],
            assignees: payload.new.assignees || [],
            tags: payload.new.tags || [],
            checklist: payload.new.checklist || [],
            attachments: payload.new.attachments || [],
            customFieldValues: payload.new.custom_field_values || []
          } : null);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId, userEmail]);

  const handleSave = async (updatedTask: Task) => {
    if (!task || !currentBoard || !userEmail || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      // Update task in database
      const { error } = await supabase
        .from('private_tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          content: updatedTask.content || '',
          priority: updatedTask.priority,
          labels: updatedTask.labels,
          tags: updatedTask.tags,
          checklist: updatedTask.checklist,
          due_date: updatedTask.dueDate,
          start_date: updatedTask.startDate,
          estimated_time: updatedTask.estimatedTime,
          actual_time: updatedTask.actualTime,
          status: updatedTask.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .eq('user_email', userEmail);

      if (error) throw error;

      // Update local state
      const updatedLists = currentBoard.lists.map(list => ({
        ...list,
        tasks: list.tasks.map(t => t.id === task.id ? updatedTask : t)
      }));

      updateBoard({
        ...currentBoard,
        lists: updatedLists
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating private task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !userEmail || !confirm('Are you sure you want to delete this task?')) return;

    try {
      setIsSaving(true);
      setError(null);

      // Delete task from database
      const { error } = await supabase
        .from('private_tasks')
        .delete()
        .eq('id', task.id)
        .eq('user_email', userEmail);

      if (error) throw error;

      // Navigate back
      navigate(-1);
    } catch (err) {
      console.error('Error deleting private task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <BackButton fallbackPath="/private-boards" />
        <div className="text-center text-red-400 mt-6">
          {error || 'Task not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <BackButton fallbackPath="/private-boards" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {isEditing ? (
            <PrivateTaskForm
              onSubmit={handleSave}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSaving}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                    <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Private
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                    {task.status === 'completed' && (
                      <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {task.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-medium text-white mb-2">Description</h2>
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-200 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Due Date</p>
                    <p className="text-white">
                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {task.tags.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-white mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-900/50 text-gray-200 rounded-lg border border-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.checklist.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-white mb-2">Checklist</h2>
                  <div className="space-y-2">
                    {task.checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          readOnly
                          className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-200">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}