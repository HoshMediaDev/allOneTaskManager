import React from 'react';
import { Trash2 } from 'lucide-react';
import { Comment } from '../../types/Comment';

interface CommentItemProps {
  comment: Comment;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete, isDeleting = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="font-medium text-white">{comment.userName}</span>
          <span className="text-gray-400 text-sm ml-2">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className={`text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDeleting ? 'animate-pulse' : ''
          }`}
          title={isDeleting ? 'Deleting...' : 'Delete comment'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <p className="text-gray-200 mt-2 whitespace-pre-wrap">{comment.content}</p>
    </div>
  );
};