import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TaskPriority } from '../Task/TaskPriority';
import { Calendar, Users } from 'lucide-react';

export const SharedTasksView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { boards } = useBoardStore();
  const { userEmail } = useAuthStore();

  // Get all shared tasks assigned to the current user (excluding private tasks)
  const sharedTasks = React.useMemo(() => {
    if (!userEmail) return [];

    return boards
      .flatMap(board => board.lists.flatMap(list => 
        list.tasks.map(task => ({
          ...task,
          boardTitle: board.title,
          listTitle: list.title,
          boardId: board.id
        }))
      ))
      // Only include tasks that are assigned to current user AND have other assignees
      .filter(task => 
        task.assignees.some(a => a.email === userEmail && task.assignees.length > 1)
      )
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [boards, userEmail]);

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}?${searchParams.toString()}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Shared Tasks</h1>
      
      <div className="space-y-4">
        {sharedTasks.map(task => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task.id)}
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-white font-medium">{task.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {task.boardTitle} • {task.listTitle}
                </p>
              </div>
              <TaskPriority priority={task.priority} />
            </div>

            {task.description && (
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <div className="flex items-center gap-1">
                  {task.assignees.map((assignee, index) => (
                    <React.Fragment key={`${assignee.type}-${assignee.id}`}>
                      {index > 0 && ', '}
                      <span className={assignee.email === userEmail ? 'text-indigo-400' : ''}>
                        {assignee.name}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {sharedTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No shared tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};