import React, { useState } from 'react';
import type { Task, CustomField } from '../../../types';
import { TaskBasicInfo } from './sections/TaskBasicInfo';
import { TaskAssignees } from './sections/TaskAssignees';
import { TaskPrioritySelect } from '../TaskPrioritySelect';
import { TaskLabelsSelect } from '../TaskLabelsSelect';
import { TaskDates } from './sections/TaskDates';
import { TaskTags } from './sections/TaskTags';
import { TaskChecklist } from './sections/TaskChecklist';
import { TaskCustomFields } from './sections/TaskCustomFields';
import { TaskAttachments } from './sections/TaskAttachments';
import { TaskTimeTracking } from './sections/TaskTimeTracking';

interface TaskFormProps {
  task: Task | Omit<Task, 'id'>;
  customFields: CustomField[];
  onSubmit: (task: Task | Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  customFields = [],
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Task | Omit<Task, 'id'>>({
    ...task,
    labels: task.labels || [],
    tags: task.tags || [],
    checklist: task.checklist || [],
    customFieldValues: task.customFieldValues || [],
    attachments: task.attachments || [],
    assignees: task.assignees || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TaskBasicInfo
            title={formData.title}
            description={formData.description}
            content={formData.content}
            onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />

          <TaskPrioritySelect
            value={formData.priority}
            onChange={(priority) => setFormData(prev => ({ ...prev, priority }))}
          />

          <TaskDates
            startDate={formData.startDate}
            dueDate={formData.dueDate}
            onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />

          <TaskLabelsSelect
            selectedLabels={formData.labels}
            onChange={(labels) => setFormData(prev => ({ ...prev, labels }))}
          />

          <TaskTags
            tags={formData.tags}
            onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
          />
        </div>

        <div className="space-y-6">
          <TaskAssignees
            assignees={formData.assignees}
            onChange={(assignees) => setFormData(prev => ({ ...prev, assignees }))}
          />

          <TaskChecklist
            items={formData.checklist}
            onChange={(checklist) => setFormData(prev => ({ ...prev, checklist }))}
          />

          <TaskCustomFields
            fields={customFields}
            values={formData.customFieldValues}
            onChange={(customFieldValues) => setFormData(prev => ({ ...prev, customFieldValues }))}
          />

          <TaskTimeTracking
            estimatedTime={formData.estimatedTime}
            actualTime={formData.actualTime}
            onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          />

          <TaskAttachments
            attachments={formData.attachments}
            onChange={(attachments) => setFormData(prev => ({ ...prev, attachments }))}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
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
          Save Task
        </button>
      </div>
    </form>
  );
};