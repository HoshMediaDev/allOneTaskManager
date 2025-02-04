import React, { useState } from 'react';
import { Calendar, Tag, Users, Edit, Circle, CheckCircle, Paperclip, Download, Copy, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { TaskPriority } from './TaskPriority';
import { TaskLabels } from './TaskLabels';
import { CommentsSection } from '../Comments/CommentsSection';
import { GHLTaskService } from '../../services/ghl/task.service';
import { useTaskActions } from '../../hooks/useTaskActions';
import { useNavigate } from 'react-router-dom';
import { useApiStore } from '../../store/apiStore';

interface TaskViewProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskView: React.FC<TaskViewProps> = ({ task, onEdit, onDelete }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { apiKey } = useApiStore();

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // For GHL tasks, delete from GHL first
      if (task.ghlTaskId && task.contactId && apiKey) {
        console.log('Deleting GHL task:', {
          taskId: task.ghlTaskId,
          contactId: task.contactId
        });

        const ghlTaskService = GHLTaskService.getInstance();
        ghlTaskService.setAccessToken(apiKey);

        try {
          await ghlTaskService.deleteTask(task.ghlTaskId, task.contactId);
          console.log('Successfully deleted GHL task');
        } catch (error) {
          // Only throw if it's not a 404 (already deleted) error
          if (error instanceof Error && !error.message.includes('404')) {
            throw error;
          }
          console.log('GHL task already deleted or not found');
        }
      }

      // Delete from local database
      await onDelete();
      navigate(-1);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-4">{task.title}</h1>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                task.status === 'completed' 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-gray-500/10 text-gray-500'
              }`}>
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {task.status === 'completed' ? 'Completed' : 'Incompleted'}
                </span>
              </div>
              <TaskPriority priority={task.priority} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Show delete button only for GHL tasks */}
            {task.ghlTaskId && task.contactId && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Task
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
          <h2 className="text-lg font-medium text-white mb-3">Description</h2>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-200 whitespace-pre-wrap">{task.description}</p>
          </div>
        </div>
      )}

      {/* Assignees */}
      {task.assignees.length > 0 && (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-white">Assigned to</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {task.assignees.map(assignee => (
              <div
                key={assignee.id}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-200">
                    {assignee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-200">{assignee.name}</span>
                  {assignee.email && (
                    <p className="text-gray-400">{assignee.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TaskLabels labels={task.labels} />

      {/* Due Date */}
      {task.dueDate && (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Due Date</p>
              <p className="text-gray-200 font-medium">
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-white">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-gray-900/50 rounded-lg text-gray-200 border border-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {task.attachments?.length > 0 && (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
          <div className="flex items-center gap-2 mb-4">
            <Paperclip className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-white">Attachments</h3>
            <span className="text-sm text-gray-400">({task.attachments.length})</span>
          </div>
          <div className="space-y-3">
            {task.attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {attachment.type === 'link' ? (
                    <div className="flex-1 min-w-0">
                      <a 
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 truncate block"
                      >
                        {attachment.name}
                      </a>
                      <p className="text-sm text-gray-400 truncate">{attachment.url}</p>
                    </div>
                  ) : (
                    <span className="text-gray-200 truncate">{attachment.name}</span>
                  )}
                  {attachment.size && (
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      ({(attachment.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {attachment.type === 'link' ? (
                    <button
                      onClick={() => handleCopyUrl(attachment.url, attachment.id)}
                      className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === attachment.id ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-inner">
        <CommentsSection taskId={task.id} />
      </div>
    </div>
  );
};