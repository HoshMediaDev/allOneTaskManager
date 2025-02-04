import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types/Comment';
import { useAuthStore } from '../store/authStore';

export const usePrivateTaskComments = (taskId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userEmail } = useAuthStore();

  useEffect(() => {
    if (!userEmail) return;

    // Load initial comments
    const loadComments = async () => {
      try {
        setIsLoading(true);
        
        // Set user email for RLS
        await supabase.rpc('set_user_email', { email: userEmail });

        const { data, error } = await supabase
          .from('private_comments')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error loading private comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();

    // Subscribe to real-time changes
    const channel = supabase.channel(`private-comments-${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'private_comments',
        filter: `task_id=eq.${taskId}`
      }, (payload) => {
        setComments(prev => {
          const exists = prev.some(c => c.id === payload.new.id);
          if (exists) return prev;
          return [payload.new as Comment, ...prev];
        });
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'private_comments',
        filter: `task_id=eq.${taskId}`
      }, (payload) => {
        setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId, userEmail]);

  const addComment = async (comment: Omit<Comment, 'id'>) => {
    if (!userEmail) return;

    try {
      // Create optimistic comment with temporary ID
      const optimisticComment: Comment = {
        ...comment,
        id: `temp-${Date.now()}`
      };

      // Update UI immediately
      setComments(prev => [optimisticComment, ...prev]);

      // Set user email for RLS
      await supabase.rpc('set_user_email', { email: userEmail });

      // Add to database
      const { data, error } = await supabase
        .from('private_comments')
        .insert({
          task_id: taskId,
          user_id: comment.userId,
          user_name: comment.userName,
          content: comment.content,
          created_at: comment.createdAt
        })
        .select()
        .single();

      if (error) {
        // Remove optimistic comment if there was an error
        setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
        throw error;
      }

      // Replace optimistic comment with real one
      setComments(prev => prev.map(c => 
        c.id === optimisticComment.id ? data : c
      ));

      return data;
    } catch (error) {
      console.error('Error adding private comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!userEmail) return;

    try {
      // Remove comment from UI immediately
      setComments(prev => prev.filter(c => c.id !== commentId));

      // Set user email for RLS
      await supabase.rpc('set_user_email', { email: userEmail });

      // Delete from database
      const { error } = await supabase
        .from('private_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        // Restore comment if deletion failed
        const { data } = await supabase
          .from('private_comments')
          .select('*')
          .eq('id', commentId)
          .single();
          
        if (data) {
          setComments(prev => [data, ...prev]);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error deleting private comment:', error);
      throw error;
    }
  };

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
  };
};