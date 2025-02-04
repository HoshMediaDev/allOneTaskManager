import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { CustomField } from '../../types';
import { CustomFieldForm } from './CustomFieldForm';
import { useCustomFieldsStore } from '../../store/customFieldsStore';

export const CustomFieldsManager: React.FC = () => {
  const { customFields, isLoading, error, loadCustomFields, addCustomField, updateCustomField, deleteCustomField } = useCustomFieldsStore();
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  useEffect(() => {
    loadCustomFields();
  }, [loadCustomFields]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Custom Fields</h2>
        <button
          onClick={() => setIsAddingField(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </div>

      <div className="space-y-4">
        {customFields.map(field => (
          <div
            key={field.id}
            className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
          >
            <div>
              <h3 className="text-white font-medium">{field.name}</h3>
              <p className="text-gray-400 text-sm">Type: {field.type}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingField(field)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCustomField(field.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {customFields.length === 0 && !isAddingField && (
          <div className="text-center py-8 text-gray-400">
            No custom fields added yet. Click "Add Field" to create one.
          </div>
        )}
      </div>

      {(isAddingField || editingField) && (
        <CustomFieldForm
          field={editingField || undefined}
          onSubmit={async (fieldData) => {
            try {
              if (editingField) {
                await updateCustomField(fieldData as CustomField);
              } else {
                await addCustomField(fieldData);
              }
              setIsAddingField(false);
              setEditingField(null);
            } catch (error) {
              console.error('Error saving custom field:', error);
            }
          }}
          onCancel={() => {
            setIsAddingField(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};