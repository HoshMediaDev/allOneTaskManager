import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PrivateCommentList } from './PrivateCommentList';
import { PrivateCommentForm } from './PrivateCommentForm';
import { usePrivateTaskComments } from '../../../hooks/usePrivateTaskComments';
import { useAuthStore } from '../../../store/authStore';

interface PrivateCommentsSectionProps {
  taskId: string;
}

export const PrivateCommentsSection: React.FC<PrivateCommentsSectionProps> = ({ taskId }) => {
  const { comments, isLoading, addComment, deleteComment } = usePrivateTaskComments(taskId);
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
      console.error('Error adding private comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setIsDeletingId(commentId);
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting private comment:', error);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-medium text-white">Private Comments</h3>
        <span className="text-sm text-gray-400">({comments.length})</span>
      </div>
      
      <PrivateCommentForm onSubmit={handleAddComment} isSubmitting={isSubmitting} />
      
      <div className="mt-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent mx-auto"></div>
          </div>
        ) : (
          <PrivateCommentList 
            comments={comments} 
            onDeleteComment={handleDeleteComment}
            isDeletingId={isDeletingId}
          />
        )}
      </div>
    </div>
  );
};