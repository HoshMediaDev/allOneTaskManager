import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { PrivateTaskForm } from './PrivateTaskForm';
import { ListService } from '../../services/board/listService';
import { useAuthStore } from '../../store/authStore';
import type { Task } from '../../types';

interface CreatePrivateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  onCreateTask: (task: Task) => void;
}

export const CreatePrivateTaskModal: React.FC<CreatePrivateTaskModalProps> = ({
  isOpen,
  onClose,
  listId,
  onCreateTask
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userEmail } = useAuthStore();

  const handleSubmit = async (taskData: Omit<Task, 'id' | 'listId'>) => {
    if (!userEmail) {
      setError('User email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const newTask = await ListService.createTask(
        listId,
        taskData,
        true, // isPrivate
        userEmail
      );

      if (!newTask) {
        throw new Error('Failed to create task');
      }

      onCreateTask(newTask);
      onClose();
    } catch (err) {
      console.error('Error creating private task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create Private Task"
      maxWidth="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}
        <PrivateTaskForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </Modal>
  );
};