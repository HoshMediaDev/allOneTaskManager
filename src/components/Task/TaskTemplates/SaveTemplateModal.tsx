import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { useTaskTemplates } from '../../../hooks/useTaskTemplates';
import type { Task } from '../../../types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const [templateName, setTemplateName] = useState('');
  const { addTemplate } = useTaskTemplates();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template = {
      name: templateName,
      title: task.title,
      description: task.description,
      content: task.content,
      priority: task.priority,
      labels: task.labels,
      tags: task.tags,
      checklist: task.checklist,
      customFieldValues: task.customFieldValues,
      estimatedTime: task.estimatedTime,
      assignees: [],
      attachments: [],
      comments: [],
    };

    addTemplate(template);
    setTemplateName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save as Template">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Template Name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Save Template
          </button>
        </div>
      </form>
    </Modal>
  );
};