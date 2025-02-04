import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Task, Assignee } from '../types';

export const useTaskAssignees = (taskId: string) => {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('assignees')
          .eq('id', taskId)
          .single();

        if (error) throw error;
        setAssignees(data.assignees || []);
      } catch (err) {
        console.error('Error fetching assignees:', err);
        setError('Failed to load assignees');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignees();

    // Subscribe to task changes
    const channel = supabase.channel(`task-assignees-${taskId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `id=eq.${taskId}`
      }, (payload) => {
        if (payload.new) {
          setAssignees(payload.new.assignees || []);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId]);

  const updateAssignees = async (newAssignees: Assignee[]) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assignees: newAssignees })
        .eq('id', taskId);

      if (error) throw error;
      // No need to manually update state - subscription will handle it
    } catch (err) {
      console.error('Error updating assignees:', err);
      throw err;
    }
  };

  return {
    assignees,
    isLoading,
    error,
    updateAssignees
  };
};