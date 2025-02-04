import React from 'react';
import { Calendar, Tag, Edit, Users } from 'lucide-react';
import type { Task } from '../../../types';
import { TaskPriority } from '../TaskPriority';
import { TaskLabels } from '../TaskLabels';
import { TimeTrackingSection } from '../sections/TimeTrackingSection';
import { AttachmentSection } from '../sections/AttachmentSection';
import { CommentsSection } from '../../Comments/CommentsSection';
import { useTeamStore } from '../../../store/teamStore';

interface TaskDetailContentProps {
  task: Task;
  onEdit: () => void;
}

export const TaskDetailContent: React.FC<TaskDetailContentProps> = ({ task, onEdit }) => {
  const { members } = useTeamStore();
  const assignedMembers = members.filter(member => 
    task.assignees.includes(member.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TaskPriority priority={task.priority} />
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      {assignedMembers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-300">Assigned To</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignedMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-xs">
                    {member.firstName[0]}{member.lastName[0]}
                  </span>
                </div>
                <span className="text-sm">
                  {member.firstName} {member.lastName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <TaskLabels labels={task.labels} />

      {task.description && (
        <div className="text-gray-300 whitespace-pre-wrap mt-4">{task.description}</div>
      )}

      {task.content && (
        <div className="text-gray-300 whitespace-pre-wrap mt-4">{task.content}</div>
      )}

      <TimeTrackingSection task={task} />
      <AttachmentSection taskId={task.id} />
      <CommentsSection taskId={task.id} />
    </div>
  );
};