import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { TaskService } from '../../services/task/taskService';
import { useBoardStore } from '../../store/boardStore';
import type { Task } from '../../types';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentBoard, updateBoard } = useBoardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateTask = async (updatedTaskData: Task | Omit<Task, 'id'>) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Starting task update:', {
        taskId: task.id,
        hasGhlId: Boolean(task.ghlTaskId),
        hasContactId: Boolean(task.contactId)
      });

      // Create complete task object with all required fields
      const completeTaskData: Task = {
        ...task, // Keep existing task data as base
        ...updatedTaskData, // Overlay with updates
        id: task.id, // Ensure ID is preserved
        listId: task.listId, // Ensure listId is preserved
        ghlTaskId: task.ghlTaskId, // Preserve GHL IDs
        contactId: task.contactId
      };

      // Update task using TaskService
      const result = await TaskService.updateTask(task.id, completeTaskData);
      console.log('Task update successful:', result);

      // Update local board state
      if (currentBoard) {
        const updatedLists = currentBoard.lists.map(list => ({
          ...list,
          tasks: list.tasks.map(t => t.id === result.id ? result : t)
        }));

        updateBoard({
          ...currentBoard,
          lists: updatedLists
        });
      }

      // Close modal and navigate back
      onClose();
      navigate(-1);
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Set user-friendly error message
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update task. Please try again.'
      );
      
      // Don't close modal or navigate on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Task" 
      maxWidth="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto px-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}
        <TaskForm
          task={task}
          customFields={currentBoard?.customFields || []}
          onSubmit={handleUpdateTask}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </div>
    </Modal>
  );
};