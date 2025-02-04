import React from 'react';
import type { CustomField, CustomFieldValue } from '../../../types';
import { CustomFieldInput } from '../CustomFieldInput';

interface TaskCustomFieldsProps {
  fields: CustomField[];
  values: CustomFieldValue[];
  onChange: (values: CustomFieldValue[]) => void;
}

export const TaskCustomFields: React.FC<TaskCustomFieldsProps> = ({
  fields,
  values,
  onChange,
}) => {
  const handleFieldChange = (fieldId: string, value: CustomFieldValue['value']) => {
    const newValues = [...values];
    const existingIndex = newValues.findIndex(v => v.fieldId === fieldId);
    
    if (existingIndex >= 0) {
      newValues[existingIndex] = { fieldId, value };
    } else {
      newValues.push({ fieldId, value });
    }
    
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      {fields.map(field => (
        <CustomFieldInput
          key={field.id}
          field={field}
          value={values.find(v => v.fieldId === field.id)?.value}
          onChange={value => handleFieldChange(field.id, value)}
        />
      ))}
    </div>
  );
};