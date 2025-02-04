import React, { useState } from 'react';
import { X, Calendar, Users, Tag, Clock, CheckSquare, MessageSquare } from 'lucide-react';
import { TaskPriority } from './TaskPriority';
import { TaskLabels } from './TaskLabels';
import { useTeamStore } from '../../store/teamStore';
import { TaskDetailModal } from './TaskDetailModal';
import type { Task } from '../../types';

interface QuickViewProps {
  task: Task;
  onClose: () => void;
}

export const QuickView: React.FC<QuickViewProps> = ({ task, onClose }) => {
  const { members } = useTeamStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const assignedMembers = members.filter(member => 
    task.assignees.includes(member.id)
  );

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
    onClose(); // Close quick view when opening edit modal
  };

  const completedTasks = task.checklist?.filter(item => item.completed).length || 0;
  const totalTasks = task.checklist?.length || 0;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
        onClick={onClose}
      >
        <div 
          className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl m-4" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-white">{task.title}</h2>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <TaskPriority priority={task.priority} />
              {task.dueDate && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {task.description && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            <TaskLabels labels={task.labels} />

            {assignedMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Assigned to</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {task.estimatedTime && (
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="text-white">
                    {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                  </p>
                </div>
              )}

              {totalTasks > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <CheckSquare className="w-4 h-4" />
                    <span className="text-sm">Checklist</span>
                  </div>
                  <p className="text-white">{completedTasks}/{totalTasks} completed</p>
                </div>
              )}

              {task.comments?.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Comments</span>
                  </div>
                  <p className="text-white">{task.comments.length}</p>
                </div>
              )}
            </div>

            {task.tags?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-700 pt-4 mt-6">
              <button
                onClick={handleEditClick}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={task}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};