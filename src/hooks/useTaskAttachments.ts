import { useBoardStore } from '../store/boardStore';
import type { Attachment } from '../types';

export const useTaskAttachments = (taskId: string) => {
  const { currentBoard, updateBoard } = useBoardStore();

  const task = currentBoard?.lists
    .flatMap(list => list.tasks)
    .find(task => task.id === taskId);

  const attachments = task?.attachments || [];

  const addAttachment = (attachment: Omit<Attachment, 'id'>) => {
    if (!currentBoard || !task) return;

    const newAttachment = {
      ...attachment,
      id: crypto.randomUUID(),
    };

    const updatedBoard = {
      ...currentBoard,
      lists: currentBoard.lists.map(list => ({
        ...list,
        tasks: list.tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              attachments: [...t.attachments, newAttachment],
            };
          }
          return t;
        }),
      })),
    };

    updateBoard(updatedBoard);
  };

  const deleteAttachment = (attachmentId: string) => {
    if (!currentBoard || !task) return;

    const updatedBoard = {
      ...currentBoard,
      lists: currentBoard.lists.map(list => ({
        ...list,
        tasks: list.tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              attachments: t.attachments.filter(a => a.id !== attachmentId),
            };
          }
          return t;
        }),
      })),
    };

    updateBoard(updatedBoard);
  };

  return {
    attachments,
    addAttachment,
    deleteAttachment,
  };
};