import React from 'react';
import { Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBoardStore } from '../../store/boardStore';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { useAuthStore } from '../../store/authStore';
import { TaskPriority } from '../Task/TaskPriority';

export const RecentTasks: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { boards: sharedBoards } = useBoardStore();
  const { boards: privateBoards } = usePrivateBoardStore();
  const { userEmail } = useAuthStore();
  
  const recentTasks = React.useMemo(() => {
    if (!userEmail) return [];

    // Get tasks from shared boards
    const sharedTasks = sharedBoards
      .flatMap(board => board.lists.flatMap(list => 
        list.tasks.map(task => ({
          ...task,
          boardTitle: board.title,
          listTitle: list.title,
          isPrivate: false
        }))
      ))
      .filter(task => task.assignees.some(a => a.email === userEmail));

    // Get tasks from private boards
    const privateTasks = privateBoards
      .flatMap(board => board.lists.flatMap(list => 
        list.tasks.map(task => ({
          ...task,
          boardTitle: board.title,
          listTitle: list.title,
          isPrivate: true
        }))
      ));

    // Combine and sort all tasks
    return [...sharedTasks, ...privateTasks]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5); // Only show 5 most recent tasks
  }, [sharedBoards, privateBoards, userEmail]);

  const handleTaskClick = (task: any) => {
    const path = task.isPrivate 
      ? `/private-boards/${task.boardId}/task/${task.id}`
      : `/task/${task.id}`;
    navigate(`${path}?${searchParams.toString()}`);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">My Recent Tasks</h2>
        <span className="text-sm text-gray-400">({recentTasks.length})</span>
      </div>

      <div className="space-y-4">
        {recentTasks.map(task => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task)}
            className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-medium flex items-center gap-2">
                  {task.title}
                  {task.isPrivate && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                      Private
                    </span>
                  )}
                </h3>
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

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              {task.dueDate && (
                <span>
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.status === 'completed' && (
                <span className="text-green-400">Completed</span>
              )}
            </div>
          </div>
        ))}

        {recentTasks.length === 0 && (
          <p className="text-center text-gray-400 py-4">No recent tasks</p>
        )}
      </div>
    </div>
  );
};