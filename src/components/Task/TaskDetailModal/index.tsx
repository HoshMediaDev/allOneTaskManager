import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { TaskForm } from '../TaskForm';
import { TaskDetailContent } from './TaskDetailContent';
import { useTaskActions } from '../../../hooks/useTaskActions';
import { useBoardStore } from '../../../store/boardStore';
import type { Task } from '../../../types';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateTask } = useTaskActions();
  const { currentBoard } = useBoardStore();

  const handleUpdateTask = (updatedTaskData: Task | Omit<Task, 'id'>) => {
    const updatedTask = {
      ...updatedTaskData,
      id: task.id,
      listId: task.listId,
    } as Task;

    updateTask(updatedTask);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Task" maxWidth="xl">
        <TaskForm
          task={task}
          customFields={currentBoard?.customFields || []}
          onSubmit={handleUpdateTask}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} maxWidth="xl">
      <TaskDetailContent task={task} onEdit={() => setIsEditing(true)} />
    </Modal>
  );
};