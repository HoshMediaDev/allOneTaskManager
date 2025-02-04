import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { PrivateBoardHeader } from './PrivateBoardHeader';
import { PrivateTaskList } from './PrivateTaskList';
import { CreateListModal } from '../Board/CreateListModal';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { useDragDrop } from '../../hooks/useDragDrop';
import { BackButton } from '../ui/BackButton';

export const PrivateBoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const { boards, currentBoard, setCurrentBoard, updateBoard } = usePrivateBoardStore();
  const { handleDragEnd } = useDragDrop(currentBoard, updateBoard);

  // Set current board when component mounts or boardId changes
  useEffect(() => {
    if (boardId) {
      setCurrentBoard(boardId);
    }
  }, [boardId, setCurrentBoard]);

  if (!currentBoard) {
    return (
      <div className="p-6">
        <BackButton fallbackPath="/private-boards" />
        <div className="text-center py-8">
          <p className="text-gray-400">Board not found</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <BackButton fallbackPath="/private-boards" />
        </div>

        <PrivateBoardHeader 
          title={currentBoard.title} 
          onCreateList={() => setIsCreateListModalOpen(true)}
        />
        
        <Droppable droppableId="lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex space-x-4 overflow-x-auto pb-4"
            >
              {currentBoard.lists.map((list, index) => (
                <PrivateTaskList 
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
    </DragDropContext>
  );
};