import React from 'react';
import { Comment } from '../../../types/Comment';
import { PrivateCommentItem } from './PrivateCommentItem';

interface PrivateCommentListProps {
  comments: Comment[];
  onDeleteComment: (commentId: string) => void;
  isDeletingId: string | null;
}

export const PrivateCommentList: React.FC<PrivateCommentListProps> = ({ 
  comments, 
  onDeleteComment,
  isDeletingId
}) => {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <PrivateCommentItem 
          key={comment.id} 
          comment={comment} 
          onDelete={() => onDeleteComment(comment.id)}
          isDeleting={isDeletingId === comment.id}
        />
      ))}
      {comments.length === 0 && (
        <p className="text-gray-400 text-center py-4">No comments yet</p>
      )}
    </div>
  );
};