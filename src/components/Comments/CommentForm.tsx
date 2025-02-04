import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isSubmitting) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full bg-gray-700 text-white rounded-lg pl-3 pr-12 py-2 min-h-[80px] focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={isSubmitting ? 'Sending...' : 'Send comment'}
        >
          <Send className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </form>
  );
};