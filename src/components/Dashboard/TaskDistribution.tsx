import React from 'react';
import { PieChart } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';

export const TaskDistribution: React.FC = () => {
  const { boards } = useBoardStore();
  
  // Create a distribution that includes both board and list names
  const distribution = (boards || []).reduce((acc, board) => {
    (board.lists || []).forEach(list => {
      const key = `${board.title} - ${list.title}`;
      acc[key] = (list.tasks || []).length;
    });
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  // Sort entries by task count in descending order
  const sortedEntries = Object.entries(distribution)
    .sort(([, countA], [, countB]) => countB - countA);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <PieChart className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Task Distribution</h2>
      </div>

      <div className="space-y-4">
        {sortedEntries.map(([key, count]) => {
          const [boardName, listName] = key.split(' - ');
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400">{listName}</span>
                  <span className="text-xs text-gray-500">{boardName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white">{count}</span>
                  <span className="text-gray-500 text-xs">({percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        {sortedEntries.length === 0 && (
          <p className="text-center text-gray-400 py-4">No tasks found</p>
        )}
      </div>
    </div>
  );
};