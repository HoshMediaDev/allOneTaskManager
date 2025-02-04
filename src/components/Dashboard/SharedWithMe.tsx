import React from 'react';
import { Share2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { TaskPriority } from '../Task/TaskPriority';

export const SharedWithMe: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { boards } = useBoardStore();
  const { userEmail } = useAuthStore();

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
      // Show tasks assigned to current user that have other assignees
      .filter(task => 
        task.assignees.includes(userEmail) && task.assignees.length > 1
      )
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [boards, userEmail]);

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}?${searchParams.toString()}`);
  };

  if (!sharedTasks.length) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Share2 className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Shared with me</h2>
        <span className="text-sm text-gray-400">({sharedTasks.length})</span>
      </div>

      <div className="space-y-4">
        {sharedTasks.map(task => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task.id)}
            className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-medium">{task.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {task.boardTitle} • {task.listTitle}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              <TaskPriority priority={task.priority} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};