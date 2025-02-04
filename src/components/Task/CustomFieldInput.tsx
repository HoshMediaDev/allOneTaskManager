import React from 'react';
import type { CustomField, CustomFieldValue } from '../../types';

interface CustomFieldInputProps {
  field: CustomField;
  value: CustomFieldValue['value'];
  onChange: (value: CustomFieldValue['value']) => void;
}

export const CustomFieldInput: React.FC<CustomFieldInputProps> = ({
  field,
  value,
  onChange,
}) => {
  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {field.name}
          </label>
          <input
            type="text"
            value={value as string || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required={field.required}
          />
        </div>
      );

    case 'number':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {field.name}
          </label>
          <input
            type="number"
            value={value as number || ''}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required={field.required}
          />
        </div>
      );

    case 'date':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {field.name}
          </label>
          <input
            type="date"
            value={value as string || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required={field.required}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {field.name}
          </label>
          <select
            value={value as string || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );

    case 'multiselect':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {field.name}
          </label>
          <select
            multiple
            value={value as string[] || []}
            onChange={e => {
              const values = Array.from(e.target.selectedOptions).map(opt => opt.value);
              onChange(values);
            }}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required={field.required}
          >
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return null;
  }
};