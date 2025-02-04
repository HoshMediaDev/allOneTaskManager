import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { useBoardStore } from '../../store/boardStore';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { useAuthStore } from '../../store/authStore';
import { ListService } from '../../services/board/listService';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentBoard: sharedBoard, updateBoard: updateSharedBoard } = useBoardStore();
  const { currentBoard: privateBoard, updateBoard: updatePrivateBoard } = usePrivateBoardStore();
  const { userEmail } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if we're working with a private board
  const currentBoard = privateBoard?.id === boardId ? privateBoard : sharedBoard;
  const updateBoard = privateBoard?.id === boardId ? updatePrivateBoard : updateSharedBoard;
  const isPrivateBoard = Boolean(privateBoard?.id === boardId);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentBoard) return;

    try {
      setIsSubmitting(true);

      // Create new list with private flag if board is private
      const newList = await ListService.createList(
        boardId, 
        title.trim(), 
        isPrivateBoard, 
        isPrivateBoard ? userEmail : undefined
      );

      if (!newList) throw new Error('Failed to create list');

      // Update local state
      updateBoard({
        ...currentBoard,
        lists: [...currentBoard.lists, { 
          ...newList,
          tasks: []
        }]
      });

      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New List">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            List Title
          </label>
          <input
            ref={inputRef}
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter list title"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create List'}
          </button>
        </div>
      </form>
    </Modal>
  );
}