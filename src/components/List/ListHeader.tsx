import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { useAuthStore } from '../../store/authStore';
import { EditableText } from '../ui/EditableText';
import { ListService } from '../../services/board/listService';
import type { List } from '../../types';

interface ListHeaderProps {
  list: List;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ list }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentBoard: sharedBoard, updateBoard: updateSharedBoard } = useBoardStore();
  const { currentBoard: privateBoard, updateBoard: updatePrivateBoard } = usePrivateBoardStore();
  const { userEmail } = useAuthStore();

  // Determine if we're working with a private board
  const currentBoard = privateBoard?.id === list.boardId ? privateBoard : sharedBoard;
  const updateBoard = privateBoard?.id === list.boardId ? updatePrivateBoard : updateSharedBoard;
  const isPrivateBoard = Boolean(privateBoard?.id === list.boardId);

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

  const handleRename = async (newTitle: string) => {
    if (!currentBoard || list.is_default) return;
    
    try {
      setIsUpdating(true);

      // Update list with proper user email for private lists
      const updatedList = await ListService.updateList({
        ...list,
        title: newTitle,
        is_private: isPrivateBoard,
        user_email: isPrivateBoard ? userEmail : undefined
      }, isPrivateBoard ? userEmail : undefined);

      // Update local state after successful database update
      const updatedLists = currentBoard.lists.map(l =>
        l.id === list.id ? { ...l, title: updatedList.title } : l
      );

      updateBoard({ ...currentBoard, lists: updatedLists });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating list:', error);
      alert('Failed to update list. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteList = async () => {
    if (!currentBoard || list.is_default) return;
    if (list.tasks.length > 0) {
      alert('Cannot delete list with tasks. Please remove all tasks first.');
      return;
    }

    if (confirm('Are you sure you want to delete this list?')) {
      try {
        setIsDeleting(true);

        // Delete list with proper user email for private lists
        await ListService.deleteList({
          ...list,
          is_private: isPrivateBoard,
          user_email: isPrivateBoard ? userEmail : undefined
        }, isPrivateBoard ? userEmail : undefined);

        // Update local state after successful database deletion
        const updatedLists = currentBoard.lists.filter(l => l.id !== list.id);
        updateBoard({
          ...currentBoard,
          lists: updatedLists,
        });

        setShowMenu(false);
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 group">
      <EditableText
        value={list.title}
        onSave={handleRename}
        className="text-lg font-semibold text-white"
        disabled={isUpdating || list.is_default}
        autoEdit={isEditing}
      />
      
      {!list.is_default && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                disabled={isUpdating}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isUpdating ? 'Updating...' : 'Rename List'}
              </button>
              <button
                onClick={handleDeleteList}
                disabled={isDeleting}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete List'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};