import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { useTaskComments } from '../../hooks/useTaskComments';
import { useAuthStore } from '../../store/authStore';

interface CommentsSectionProps {
  taskId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ taskId }) => {
  const { comments, isLoading, addComment, deleteComment } = useTaskComments(taskId);
  const { userEmail } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleAddComment = async (content: string) => {
    if (!userEmail) return;

    try {
      setIsSubmitting(true);
      await addComment({
        taskId,
        content,
        userId: userEmail,
        userName: userEmail.split('@')[0],
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setIsDeletingId(commentId);
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">Comments</h3>
        <span className="text-sm text-gray-400">({comments.length})</span>
      </div>
      
      <CommentForm onSubmit={handleAddComment} isSubmitting={isSubmitting} />
      
      <div className="mt-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent mx-auto"></div>
          </div>
        ) : (
          <CommentList 
            comments={comments} 
            onDeleteComment={handleDeleteComment}
            isDeletingId={isDeletingId}
          />
        )}
      </div>
    </div>
  );
};