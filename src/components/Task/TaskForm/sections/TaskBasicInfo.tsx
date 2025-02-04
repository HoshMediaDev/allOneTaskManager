import React from 'react';

interface TaskBasicInfoProps {
  title: string;
  description?: string;
  content: string;
  onChange: (updates: { title?: string; description?: string; content?: string }) => void;
}

export const TaskBasicInfo: React.FC<TaskBasicInfoProps> = ({
  title,
  description,
  content,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => onChange({ title: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => onChange({ description: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={e => onChange({ content: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          rows={5}
        />
      </div>
    </div>
  );
};