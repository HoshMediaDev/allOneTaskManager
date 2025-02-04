import React, { useState, useEffect } from 'react';
import { Layout, Settings, Plus, Home, Share2, EyeOff, Lock, Users, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { BoardList } from './Board/BoardList';
import { CreateBoardModal } from './Board/CreateBoardModal';
import { useBoardStore } from '../store/boardStore';
import { usePrivateBoardStore } from '../store/privateBoardStore';
import { useContactStore } from '../store/contactStore';
import { TeamSidebar } from './Team/TeamSidebar';

export const Sidebar: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePrivateModalOpen, setIsCreatePrivateModalOpen] = useState(false);
  const { createBoard } = useBoardStore();
  const { boards: privateBoards, createBoard: createPrivateBoard, loadBoards: loadPrivateBoards } = usePrivateBoardStore();
  const { contacts } = useContactStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Load private boards when sidebar mounts
  useEffect(() => {
    loadPrivateBoards();
  }, [loadPrivateBoards]);

  const handleCreateBoard = async (board: { title: string }) => {
    try {
      await createBoard(board);
      setIsCreateModalOpen(false);
      navigate(`/tasks?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleCreatePrivateBoard = async (board: { title: string }) => {
    try {
      const newBoard = await createPrivateBoard(board);
      setIsCreatePrivateModalOpen(false);
      navigate(`/private-boards/${newBoard.id}?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error creating private board:', error);
    }
  };

  const handlePrivateBoardClick = (boardId: string) => {
    navigate(`/private-boards/${boardId}?${searchParams.toString()}`);
  };

  const navigateTo = (path: string) => {
    navigate(`${path}?${searchParams.toString()}`);
  };

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center space-x-2 mb-8">
          <Layout className="w-8 h-8 text-indigo-500" />
          <h1 className="text-xl font-bold text-white">AO-Tasks</h1>
        </div>
        
        <nav className="space-y-6">
          <button
            onClick={() => navigateTo('/dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname.endsWith('/dashboard')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-400 uppercase">Boards</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <BoardList onNavigate={() => navigateTo('/tasks')} />
          </div>

          {/* Private Boards Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-violet-400 uppercase">Private Boards</h2>
              </div>
              <button
                onClick={() => setIsCreatePrivateModalOpen(true)}
                className="text-violet-400 hover:text-violet-300"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {privateBoards.map(board => (
                <button
                  key={board.id}
                  onClick={() => handlePrivateBoardClick(board.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors private-board-button ${
                    location.pathname === `/private-boards/${board.id}` ? 'active' : ''
                  }`}
                >
                  <EyeOff className="w-4 h-4 text-violet-400" />
                  <span className="truncate">{board.title}</span>
                </button>
              ))}
              {privateBoards.length === 0 && (
                <p className="text-sm text-violet-400/60 px-4 py-2">No private boards</p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigateTo('/shared')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname.endsWith('/shared')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Share2 className="w-5 h-5" />
            <span>Shared Tasks</span>
          </button>

          <button
            onClick={() => navigateTo('/contacts')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname.endsWith('/contacts')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Contacts ({contacts.length})</span>
          </button>

          {/* Team Members Section */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 px-4 mb-2">
              <Users className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-400 uppercase">Team</h2>
            </div>
            <TeamSidebar />
          </div>

          <button
            onClick={() => navigateTo('/settings')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname.endsWith('/settings')
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBoard={handleCreateBoard}
      />

      <CreateBoardModal
        isOpen={isCreatePrivateModalOpen}
        onClose={() => setIsCreatePrivateModalOpen(false)}
        onCreateBoard={handleCreatePrivateBoard}
        isPrivate
      />
    </div>
  );
};