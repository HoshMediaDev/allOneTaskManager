import React from 'react';
import { Minus } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

interface BoardListProps {
  onNavigate: () => void;
}

export const BoardList: React.FC<BoardListProps> = ({ onNavigate }) => {
  const { boards, currentBoard, setCurrentBoard } = useBoardStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Filter out private boards
  const sharedBoards = boards.filter(board => !board.is_private);

  const handleBoardClick = (boardId: string) => {
    setCurrentBoard(boardId);
    navigate(`/tasks?${searchParams.toString()}`);
    onNavigate();
  };

  if (!sharedBoards || sharedBoards.length === 0) {
    return (
      <div className="text-gray-400 text-sm px-4 py-2">
        No boards available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sharedBoards.map((board) => {
        const isActive = currentBoard?.id === board.id && location.pathname.includes('/tasks');
        
        return (
          <button
            key={board.id}
            onClick={() => handleBoardClick(board.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors ${
              isActive 
                ? 'bg-gray-800 text-white'
                : 'text-gray-300'
            }`}
          >
            <Minus className="w-5 h-5" />
            <span className="truncate">{board.title}</span>
          </button>
        );
      })}
    </div>
  );
};