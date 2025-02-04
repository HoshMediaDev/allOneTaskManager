import { DropResult } from '@hello-pangea/dnd';
import { Board } from '../types';
import { supabase } from '../lib/supabase';

export const useDragDrop = (board: Board | null, setBoard: (board: Board) => void) => {
  const handleDragEnd = async (result: DropResult) => {
    if (!board) return;
    
    const { destination, source, type, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Handle list reordering
      if (type === 'list') {
        const newLists = Array.from(board.lists);
        const [removed] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, removed);

        // Update list positions in database
        await Promise.all(newLists.map((list, index) => 
          supabase
            .from('lists')
            .update({ position: index })
            .eq('id', list.id)
        ));

        setBoard({
          ...board,
          lists: newLists,
        });
        return;
      }

      // Handle task reordering
      const sourceList = board.lists.find(list => list.id === source.droppableId);
      const destList = board.lists.find(list => list.id === destination.droppableId);

      if (!sourceList || !destList) return;

      // Moving within the same list
      if (source.droppableId === destination.droppableId) {
        const newTasks = Array.from(sourceList.tasks);
        const [removed] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removed);

        const newLists = board.lists.map(list =>
          list.id === sourceList.id ? { ...list, tasks: newTasks } : list
        );

        // Update local state first
        setBoard({
          ...board,
          lists: newLists,
        });

        // Then update database
        await Promise.all(newTasks.map((task, index) => 
          supabase
            .from('tasks')
            .update({ position: index })
            .eq('id', task.id)
        ));
      } else {
        // Moving to a different list
        const sourceTasks = Array.from(sourceList.tasks);
        const [movedTask] = sourceTasks.splice(source.index, 1);
        const destTasks = Array.from(destList.tasks);

        // Update task with new list ID and status
        const updatedTask = { 
          ...movedTask, 
          listId: destList.id,
          status: destList.title.toLowerCase() === 'done' ? 'completed' : 'incompleted'
        };
        destTasks.splice(destination.index, 0, updatedTask);

        // Update local state first
        const newLists = board.lists.map(list => {
          if (list.id === sourceList.id) return { ...list, tasks: sourceTasks };
          if (list.id === destList.id) return { ...list, tasks: destTasks };
          return list;
        });

        setBoard({
          ...board,
          lists: newLists,
        });

        // Then update database
        await supabase
          .from('tasks')
          .update({ 
            list_id: destList.id,
            position: destination.index,
            status: destList.title.toLowerCase() === 'done' ? 'completed' : 'incompleted'
          })
          .eq('id', draggableId);

        // Update positions for remaining tasks
        await Promise.all([
          ...sourceTasks.map((task, index) => 
            supabase
              .from('tasks')
              .update({ position: index })
              .eq('id', task.id)
          ),
          ...destTasks.map((task, index) => 
            supabase
              .from('tasks')
              .update({ position: index })
              .eq('id', task.id)
          )
        ]);
      }
    } catch (error) {
      console.error('Error updating task positions:', error);
      // Revert to server state if update fails
      const { data: updatedBoard } = await supabase
        .from('boards')
        .select(`
          *,
          lists (
            *,
            tasks (*)
          )
        `)
        .eq('id', board.id)
        .single();

      if (updatedBoard) {
        setBoard(updatedBoard);
      }
    }
  };

  return { handleDragEnd };
};