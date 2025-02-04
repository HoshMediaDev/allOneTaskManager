import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Task } from '../../types';
import { TaskPriority } from './TaskPriority';
import { TaskLabels } from './TaskLabels';
import { Calendar, CheckSquare, Tag, Users, Circle, CheckCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to task details page instead of opening modal
    navigate(`/task/${task.id}?${searchParams.toString()}`);
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'incompleted':
        return <Circle className="w-4 h-4 text-gray-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAssigneeInitials = (assignee: Task['assignees'][0]) => {
    if (!assignee.name) return '?';
    const nameParts = assignee.name.split(' ').filter(Boolean);
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0][0]?.toUpperCase() || '?';
    return (nameParts[0][0]?.toUpperCase() || '') + (nameParts[nameParts.length - 1][0]?.toUpperCase() || '');
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? provided.draggableProps.style?.transform 
              : undefined,
            transition: snapshot.isDragging
              ? 'none'
              : undefined
          }}
          className={`group bg-gray-900/50 hover:bg-gray-800/90 border border-gray-700/50 hover:border-indigo-500/30 p-4 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500/20 opacity-90' : ''
          }`}
        >
          {/* Header: Title and Priority */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                {getStatusIcon()}
              </div>
              <h4 className="text-white font-medium truncate group-hover:text-indigo-100 transition-colors">
                {task.title}
              </h4>
            </div>
            <div className="flex-shrink-0 transition-transform group-hover:scale-105">
              <TaskPriority priority={task.priority} />
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className="text-gray-400 text-sm mt-2.5 line-clamp-2 group-hover:text-gray-300 transition-colors">
              {task.description}
            </p>
          )}
          
          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="mt-3">
              <TaskLabels labels={task.labels} />
            </div>
          )}
          
          {/* Footer: Meta Information */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {/* Assignees */}
            {task.assignees.length > 0 && (
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                <Users className="w-4 h-4" />
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map(assignee => (
                    <div
                      key={assignee.id}
                      className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 group-hover:border-gray-500 flex items-center justify-center transition-colors"
                      title={assignee.name || assignee.email || 'Unknown'}
                    >
                      <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                        {getAssigneeInitials(assignee)}
                      </span>
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 group-hover:border-gray-500 flex items-center justify-center transition-colors">
                      <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                        +{task.assignees.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                <Calendar className="w-4 h-4" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {/* Tags */}
            {task.tags?.length > 0 && (
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                <Tag className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{task.tags.join(', ')}</span>
              </div>
            )}
            
            {/* Checklist Progress */}
            {task.checklist?.length > 0 && (
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                <CheckSquare className="w-4 h-4" />
                <span>
                  {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};