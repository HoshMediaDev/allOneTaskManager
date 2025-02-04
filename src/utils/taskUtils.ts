import type { Board, Task } from '../types';

export const updateTaskInBoard = (board: Board, updatedTask: Task): Board => {
  const updatedLists = board.lists.map(list => ({
    ...list,
    tasks: list.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    )
  }));

  return {
    ...board,
    lists: updatedLists
  };
};