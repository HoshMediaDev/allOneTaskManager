import React from 'react';
import { Plus } from 'lucide-react';

interface CreatePrivateListButtonProps {
  onClick: () => void;
}

export const CreatePrivateListButton: React.FC<CreatePrivateListButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
    >
      <Plus className="w-5 h-5" />
      <span>Add Private List</span>
    </button>
  );
};