import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { PrivateTaskForm } from '../PrivateBoards/PrivateTaskForm';
import { TaskService } from '../../services/task/taskService';
import { useBoardStore } from '../../store/boardStore';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import { useAuthStore } from '../../store/authStore';
import type { Task } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  onCreateTask: (task: Task | Omit<Task, 'id' | 'listId'>, assignees: Task['assignees']) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  listId,
  onCreateTask,
}) => {
  const { customFields, currentBoard: sharedBoard } = useBoardStore();
  const { currentBoard: privateBoard } = usePrivateBoardStore();
  const { userEmail } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're working with a private board
  const currentBoard = privateBoard?.id === listId ? privateBoard : sharedBoard;
  const isPrivateBoard = Boolean(privateBoard?.id === listId);

  // Get the list to determine initial status
  const list = currentBoard?.lists.find(l => l.id === listId);
  const initialStatus = list ? 
    list.title.toLowerCase() === 'done' ? 'completed' :
    list.title.toLowerCase() === 'in progress' ? 'in_progress' :
    'todo' : 'todo';

  const initialTask: Omit<Task, 'id' | 'listId'> = {
    title: '',
    description: '',
    priority: 'medium',
    labels: [],
    assignees: [],
    tags: [],
    content: '',
    customFieldValues: [],
    attachments: [],
    checklist: [],
    comments: [],
    status: initialStatus,
    is_private: isPrivateBoard,
    user_email: isPrivateBoard ? userEmail : undefined
  };

  const handleSubmit = async (taskData: Omit<Task, 'id' | 'listId'>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // For private boards, we don't need GHL validation
      if (!isPrivateBoard) {
        if (!taskData.assignees.some(a => a.ghl_id)) {
          setError('Task must be assigned to at least one contact');
          return;
        }
      }

      await onCreateTask(taskData, taskData.assignees);
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Create ${isPrivateBoard ? 'Private ' : ''}Task`}
      maxWidth="xl"
      className="overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}
        {isPrivateBoard ? (
          <PrivateTaskForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        ) : (
          <TaskForm
            task={initialTask}
            customFields={customFields || []}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            mode="create"
          />
        )}
      </div>
    </Modal>
  );
};