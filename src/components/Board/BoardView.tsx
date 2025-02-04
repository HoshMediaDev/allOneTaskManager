import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { BoardHeader } from './BoardHeader';
import { TaskList } from '../List/TaskList';
import { CreateListModal } from './CreateListModal';
import { CreateBoardModal } from './CreateBoardModal';
import { useDragDrop } from '../../hooks/useDragDrop';
import { useBoardStore } from '../../store/boardStore';

export const BoardView: React.FC = () => {
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const { boards, currentBoard, updateBoard, createBoard } = useBoardStore();
  const { handleDragEnd } = useDragDrop(currentBoard, updateBoard);

  // Filter out private boards
  const sharedBoards = boards.filter(board => !board.is_private);

  if (!sharedBoards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] bg-gray-900/50">
        <div className="text-center mb-6 p-8 bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-white mb-3">No Boards Found</h2>
          <p className="text-gray-400 mb-6">Create a new board to get started with your tasks</p>
          <button
            onClick={() => setIsCreateBoardModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Board
          </button>
        </div>

        <CreateBoardModal
          isOpen={isCreateBoardModalOpen}
          onClose={() => setIsCreateBoardModalOpen(false)}
          onCreateBoard={async (board) => {
            await createBoard(board);
            setIsCreateBoardModalOpen(false);
          }}
        />
      </div>
    );
  }

  if (!currentBoard || currentBoard.is_private) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)] bg-gray-900/50">
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg">
          <p className="text-gray-400">Select a board from the sidebar to view tasks</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex-1 p-6 bg-gray-900/50 min-h-screen">
        <div className="max-w-[1920px] mx-auto">
          <BoardHeader 
            title={currentBoard.title} 
            onCreateList={() => setIsCreateListModalOpen(true)}
          />
          
          <Droppable droppableId="lists" direction="horizontal" type="list">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-6 overflow-x-auto pb-6 pt-2 px-2 -mx-2 ${
                  snapshot.isDraggingOver ? 'bg-gray-800/10' : ''
                }`}
                style={{
                  minHeight: '2rem'
                }}
              >
                {currentBoard.lists.map((list, index) => (
                  <TaskList 
                    key={list.id} 
                    list={list}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <CreateListModal
            isOpen={isCreateListModalOpen}
            onClose={() => setIsCreateListModalOpen(false)}
            boardId={currentBoard.id}
          />
        </div>
      </div>
    </DragDropContext>
  );
};