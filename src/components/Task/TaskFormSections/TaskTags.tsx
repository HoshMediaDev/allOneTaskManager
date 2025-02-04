import React, { useState } from 'react';
import { Tag } from 'lucide-react';

interface TaskTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export const TaskTags: React.FC<TaskTagsProps> = ({ tags, onChange }) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="bg-gray-600 text-white px-2 py-1 rounded-full text-sm flex items-center"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Add a tag"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
        >
          Add
        </button>
      </div>
    </div>
  );
};