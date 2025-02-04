import React from 'react';
import { Modal } from '../../ui/Modal';
import { useTaskTemplates } from '../../../hooks/useTaskTemplates';
import { Trash2 } from 'lucide-react';

interface LoadTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

export const LoadTemplateModal: React.FC<LoadTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { templates, deleteTemplate } = useTaskTemplates();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Load Template">
      <div className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No templates saved yet</p>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg group"
              >
                <div>
                  <h4 className="text-white font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-400">{template.title}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelect(template.id)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};