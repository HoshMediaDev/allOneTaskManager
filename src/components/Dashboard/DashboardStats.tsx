import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, ListTodo, Clock, Calendar } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const { boards: sharedBoards } = useBoardStore();
  const { boards: privateBoards } = usePrivateBoardStore();
  const { userEmail } = useAuthStore();

  // Calculate stats
  const stats = React.useMemo(() => {
    const allTasks = [
      ...sharedBoards.flatMap(board => board.lists.flatMap(list => list.tasks)),
      ...privateBoards.flatMap(board => board.lists.flatMap(list => list.tasks))
    ].filter(task => task.assignees.some(a => a.email === userEmail));

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const dueSoonTasks = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      return dueDate <= threeDaysFromNow && dueDate >= today;
    }).length;
    const overdueTasks = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today && task.status !== 'completed';
    }).length;

    return {
      total: totalTasks,
      completed: completedTasks,
      dueSoon: dueSoonTasks,
      overdue: overdueTasks
    };
  }, [sharedBoards, privateBoards, userEmail]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-lg">
            <ListTodo className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Tasks</p>
            <p className="text-2xl font-semibold text-white">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Completed</p>
            <p className="text-2xl font-semibold text-white">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Due Soon</p>
            <p className="text-2xl font-semibold text-white">{stats.dueSoon}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <Calendar className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Overdue</p>
            <p className="text-2xl font-semibold text-white">{stats.overdue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};