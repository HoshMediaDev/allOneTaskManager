import React, { useState } from 'react';
import type { CustomField } from '../../types';

interface CustomFieldFormProps {
  field?: CustomField;
  onSubmit: (field: CustomField | Omit<CustomField, 'id'>) => void;
  onCancel: () => void;
}

export const CustomFieldForm: React.FC<CustomFieldFormProps> = ({
  field,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<CustomField, 'id'>>({
    name: field?.name || '',
    type: field?.type || 'text',
    required: field?.required || false,
    options: field?.options || [],
  });
  const [newOption, setNewOption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (field) {
      onSubmit({ ...formData, id: field.id });
    } else {
      onSubmit(formData);
    }
  };

  const addOption = () => {
    if (newOption && !formData.options?.includes(newOption)) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption],
      }));
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter(o => o !== option) || [],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">
          {field ? 'Edit Field' : 'Add New Field'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Field Type
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as CustomField['type'] }))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="multiselect">Multi-select</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={e => setFormData(prev => ({ ...prev, required: e.target.checked }))}
              className="rounded border-gray-500 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="required" className="ml-2 text-sm text-gray-300">
              Required field
            </label>
          </div>

          {(formData.type === 'select' || formData.type === 'multiselect') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Options
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.options?.map(option => (
                  <span
                    key={option}
                    className="bg-gray-600 text-white px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {option}
                    <button
                      type="button"
                      onClick={() => removeOption(option)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={e => setNewOption(e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Add an option"
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              {field ? 'Save Changes' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};