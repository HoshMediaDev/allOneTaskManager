import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { EditableText } from '../ui/EditableText';
import { CreatePrivateListButton } from './CreatePrivateListButton';

interface PrivateBoardHeaderProps {
  title: string;
  onCreateList: () => void;
}

export const PrivateBoardHeader: React.FC<PrivateBoardHeaderProps> = ({ title, onCreateList }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { currentBoard, updateBoard, deleteBoard } = usePrivateBoardStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showMenu]);

  const handleRename = (newTitle: string) => {
    if (!currentBoard) return;
    updateBoard({ ...currentBoard, title: newTitle });
    setIsEditing(false);
  };

  const handleDeleteBoard = () => {
    if (!currentBoard) return;
    if (currentBoard.lists.some(list => list.tasks.length > 0)) {
      alert('Cannot delete board with tasks. Please remove all tasks first.');
      return;
    }
    if (confirm('Are you sure you want to delete this board?')) {
      deleteBoard(currentBoard.id);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <EditableText
          value={title}
          onSave={handleRename}
          className="text-2xl font-bold text-white"
          autoEdit={isEditing}
        />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-white rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Rename Board
              </button>
              <button
                onClick={handleDeleteBoard}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Board
              </button>
            </div>
          )}
        </div>
      </div>

      <CreatePrivateListButton onClick={onCreateList} />
    </div>
  );
};