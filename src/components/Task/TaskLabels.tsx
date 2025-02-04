import React from 'react';
import type { Label } from '../../types';

interface TaskLabelsProps {
  labels: Label[];
}

export const TaskLabels: React.FC<TaskLabelsProps> = ({ labels }) => {
  return (
    <div className="flex mt-3 space-x-2">
      {labels.map((label) => (
        <span
          key={label.id}
          className="px-2 py-1 rounded-full text-xs"
          style={{ backgroundColor: label.color }}
        >
          {label.name}
        </span>
      ))}
    </div>
  );
};