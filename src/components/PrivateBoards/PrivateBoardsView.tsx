import React, { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { usePrivateBoards } from '../../hooks/usePrivateBoards';
import { useAuthStore } from '../../store/authStore';
import { CreateBoardModal } from '../Board/CreateBoardModal';
import { BackButton } from '../ui/BackButton';

export const PrivateBoardsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createBoard } = usePrivateBoardStore();
  const { boards } = usePrivateBoards(); // Use the hook to get filtered boards
  const { userEmail } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateBoard = async (board: { title: string }) => {
    try {
      if (!userEmail) {
        throw new Error('User email is required');
      }

      const newBoard = await createBoard({ title: board.title });
      setIsCreateModalOpen(false);
      navigate(`/private-boards/${newBoard.id}?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error creating private board:', error);
    }
  };

  const handleBoardClick = (boardId: string) => {
    navigate(`/private-boards/${boardId}?${searchParams.toString()}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton fallbackPath="/dashboard" />
          <h1 className="text-2xl font-bold text-white">Private Boards</h1>
          <span className="text-sm bg-gray-700 text-indigo-300 px-3 py-1 rounded-full">
            {boards.length} boards
          </span>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 border border-gray-600"
        >
          <Plus className="w-5 h-5" />
          Create Private Board
        </button>
      </div>

      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => handleBoardClick(board.id)}
              className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 border border-gray-700 transition-all hover:border-indigo-500/30"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-white">{board.title}</h3>
                <Lock className="w-4 h-4 text-indigo-400" />
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>{board.lists.length} lists</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {board.lists.reduce((sum, list) => sum + list.tasks.length, 0)} tasks
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <Lock className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Private Boards</h2>
          <p className="text-gray-400 mb-6">Create your first private board to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Private Board
          </button>
        </div>
      )}

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBoard={handleCreateBoard}
        isPrivate
      />
    </div>
  );
};