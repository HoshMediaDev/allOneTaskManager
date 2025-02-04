import React from 'react';
import type { Task } from '../../types';

interface TaskPriorityProps {
  priority: Task['priority'];
}

export const TaskPriority: React.FC<TaskPriorityProps> = ({ priority }) => {
  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${priorityColors[priority]}`}>
      {priority}
    </span>
  );
};