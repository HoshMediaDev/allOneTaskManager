import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { ListHeader } from '../List/ListHeader';
import { TaskCard } from '../Task/TaskCard';
import { CreatePrivateTaskModal } from './CreatePrivateTaskModal';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import type { List, Task } from '../../types';

interface PrivateTaskListProps {
  list: List;
  index: number;
}

export const PrivateTaskList: React.FC<PrivateTaskListProps> = ({ list, index }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { currentBoard, updateBoard } = usePrivateBoardStore();

  const handleCreateTask = (newTask: Task) => {
    if (!currentBoard) return;

    // Update local state with new task
    const updatedLists = currentBoard.lists.map(l => {
      if (l.id === list.id) {
        return {
          ...l,
          tasks: [...l.tasks, newTask]
        };
      }
      return l;
    });

    updateBoard({
      ...currentBoard,
      lists: updatedLists
    });

    setIsCreating(false);
    setIsCreateModalOpen(false);
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-800 rounded-lg p-4 min-w-[300px] max-w-[300px]"
        >
          <div {...provided.dragHandleProps}>
            <ListHeader list={list} />
          </div>
          
          <Droppable droppableId={list.id} type="task">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-3 min-h-[2rem]"
              >
                {list.tasks.map((task, taskIndex) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    index={taskIndex}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full mt-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            disabled={isCreating}
          >
            <Plus className="w-5 h-5" />
            <span>{isCreating ? 'Adding Task...' : 'Add Private Task'}</span>
          </button>

          <CreatePrivateTaskModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            listId={list.id}
            onCreateTask={handleCreateTask}
          />
        </div>
      )}
    </Draggable>
  );
};