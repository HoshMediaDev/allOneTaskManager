import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types/Comment';

export const useTaskComments = (taskId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial comments
    const loadComments = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();

    // Subscribe to real-time changes
    const channel = supabase.channel(`comments-${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `task_id=eq.${taskId}`
      }, (payload) => {
        console.log('New comment:', payload.new);
        // Only add the comment if it's not already in the list (avoid duplicates)
        setComments(prev => {
          const exists = prev.some(c => c.id === payload.new.id);
          if (exists) return prev;
          return [payload.new as Comment, ...prev];
        });
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
        filter: `task_id=eq.${taskId}`
      }, (payload) => {
        console.log('Deleted comment:', payload.old);
        setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to comments channel:', taskId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to comments channel:', taskId);
        }
      });

    return () => {
      console.log('Unsubscribing from comments channel:', taskId);
      channel.unsubscribe();
    };
  }, [taskId]);

  const addComment = async (comment: Omit<Comment, 'id'>) => {
    try {
      // Create optimistic comment with temporary ID
      const optimisticComment: Comment = {
        ...comment,
        id: `temp-${Date.now()}`
      };

      // Update UI immediately
      setComments(prev => [optimisticComment, ...prev]);

      // Add to database
      const { data, error } = await supabase
        .from('comments')
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
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      // Remove comment from UI immediately
      setComments(prev => prev.filter(c => c.id !== commentId));

      // Delete from database
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        // Restore comment if deletion failed
        const { data } = await supabase
          .from('comments')
          .select('*')
          .eq('id', commentId)
          .single();
          
        if (data) {
          setComments(prev => [data, ...prev]);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
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