import React, { useState, useRef, useEffect } from 'react';
import { useContactStore } from '../../store/contactStore';
import type { Task } from '../../types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Task | Omit<Task, 'id' | 'listId'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'incompleted',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate || '',
    assignees: task?.assignees || [],
    labels: task?.labels || [],
    tags: task?.tags || [],
    checklist: task?.checklist || []
  });

  const { contacts } = useContactStore();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...task,
      ...formData,
      content: task?.content || '',
      customFieldValues: task?.customFieldValues || [],
      attachments: task?.attachments || [],
      comments: task?.comments || []
    };

    await onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/95 p-6 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title
        </label>
        <input
          ref={titleInputRef}
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.status === 'incompleted'}
                onChange={() => setFormData(prev => ({ ...prev, status: 'incompleted' }))}
                className="form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-300">Incompleted</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.status === 'completed'}
                onChange={() => setFormData(prev => ({ ...prev, status: 'completed' }))}
                className="form-radio text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-300">Completed</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <div className="flex gap-4">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <label key={p} className="flex items-center">
                <input
                  type="radio"
                  checked={formData.priority === p}
                  onChange={() => setFormData(prev => ({ ...prev, priority: p }))}
                  className="form-radio text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-300 capitalize">{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Due Date
        </label>
        <input
          type="datetime-local"
          value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Assign to Contact
        </label>
        <select
          value={formData.assignees[0]?.id || ''}
          onChange={(e) => {
            const contact = contacts.find(c => c.id === e.target.value);
            if (contact) {
              setFormData(prev => ({
                ...prev,
                assignees: [{
                  id: contact.id,
                  name: `${contact.firstName} ${contact.lastName}`.trim(),
                  email: contact.email || '',
                  ghl_id: contact.ghl_id
                }]
              }));
            }
          }}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">Select a contact</option>
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};