import React, { useRef, useEffect } from 'react';

interface TaskBasicInfoProps {
  title: string;
  description?: string;
  onChange: (updates: { title?: string; description?: string }) => void;
  mode?: 'create' | 'edit';
}

export const TaskBasicInfo: React.FC<TaskBasicInfoProps> = ({
  title,
  description,
  onChange,
  mode = 'create'
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title input when creating a new task
  useEffect(() => {
    if (mode === 'create' && titleInputRef.current) {
      // Small delay to ensure modal transition is complete
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Title
        </label>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={e => onChange({ title: e.target.value })}
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-700 hover:border-gray-600 transition-colors"
          required
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => onChange({ description: e.target.value })}
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-700 hover:border-gray-600 transition-colors min-h-[100px]"
          placeholder="Enter task description"
          rows={4}
        />
      </div>
    </div>
  );
};