import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { TaskPriority } from '../Task/TaskPriority';

export const PrivateTasks: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { boards } = useBoardStore();
  const { userEmail } = useAuthStore();

  const privateTasks = React.useMemo(() => {
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
      // Only show tasks where the current user is the only assignee
      .filter(task => 
        task.assignees.length === 1 && task.assignees[0] === userEmail
      )
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5); // Only show 5 most recent private tasks

  }, [boards, userEmail]);

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}?${searchParams.toString()}`);
  };

  if (!privateTasks.length) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Lock className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Private Tasks</h2>
        <span className="text-sm text-gray-400">({privateTasks.length})</span>
      </div>

      <div className="space-y-4">
        {privateTasks.map(task => (
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