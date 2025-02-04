import React from 'react';
import { Plus } from 'lucide-react';

interface AddListButtonProps {
  onClick: () => void;
}

export const AddListButton: React.FC<AddListButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
    >
      <Plus className="w-5 h-5" />
      <span>Add List</span>
    </button>
  );
};