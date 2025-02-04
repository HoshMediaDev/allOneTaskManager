import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import type { Board as BoardType, List, Task } from '../types';

interface BoardProps {
  board: BoardType;
}

export const Board: React.FC<BoardProps> = ({ board }) => {
  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{board.title}</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add List</span>
        </button>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {board.lists.map((list) => (
          <List key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
};

const List: React.FC<{ list: List }> = ({ list }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 min-w-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{list.title}</h3>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        {list.tasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </div>
      
      <button className="w-full mt-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg flex items-center justify-center space-x-2">
        <Plus className="w-4 h-4" />
        <span>Add Task</span>
      </button>
    </div>
  );
};

const Task: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
      <div className="flex justify-between items-start">
        <h4 className="text-white font-medium">{task.title}</h4>
        <span className={`px-2 py-1 rounded text-xs ${
          task.priority === 'high' ? 'bg-red-500' :
          task.priority === 'medium' ? 'bg-yellow-500' :
          'bg-green-500'
        }`}>
          {task.priority}
        </span>
      </div>
      
      {task.description && (
        <p className="text-gray-400 text-sm mt-2">{task.description}</p>
      )}
      
      <div className="flex mt-3 space-x-2">
        {task.labels.map((label) => (
          <span
            key={label.id}
            className="px-2 py-1 rounded-full text-xs"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>
    </div>
  );
};