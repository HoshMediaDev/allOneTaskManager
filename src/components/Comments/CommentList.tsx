import React from 'react';
import { Comment } from '../../types/Comment';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  onDeleteComment: (commentId: string) => void;
  isDeletingId: string | null;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, onDeleteComment, isDeletingId }) => {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem 
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