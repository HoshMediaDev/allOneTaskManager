import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface PrivateCommentFormProps {
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
}

export const PrivateCommentForm: React.FC<PrivateCommentFormProps> = ({ onSubmit, isSubmitting = false }) => {
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
          placeholder="Add a private comment..."
          className="w-full bg-gray-900 text-white rounded-lg pl-3 pr-12 py-2 min-h-[80px] focus:ring-2 focus:ring-violet-500 focus:outline-none border border-gray-700 disabled:opacity-50"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className={`absolute right-2 bottom-2 p-2 text-gray-400 hover:text-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            isSubmitting ? 'animate-pulse' : ''
          }`}
          title={isSubmitting ? 'Sending...' : 'Send comment'}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};