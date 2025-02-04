import React, { useState } from 'react';
import { Calendar, User } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';
import { useBoardStore } from '../../store/boardStore';
import type { Task } from '../../types';

export const QuickTaskForm: React.FC = () => {
  const { members } = useTeamStore();
  const { currentBoard, updateBoard } = useBoardStore();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBoard || !title.trim()) return;

    const todoList = currentBoard.lists.find(list => 
      list.title.toLowerCase() === 'todo' || 
      list.title.toLowerCase() === 'to do'
    );

    if (!todoList) return;

    const newTask: Omit<Task, 'id'> = {
      title: title.trim(),
      description: '',
      priority: 'medium',
      labels: [],
      dueDate: dueDate || undefined,
      assignees: assignee ? [assignee] : [],
      listId: todoList.id,
      tags: [],
      content: '',
      customFieldValues: [],
      attachments: [],
      checklist: [],
      comments: []
    };

    const updatedList = {
      ...todoList,
      tasks: [...todoList.tasks, { ...newTask, id: crypto.randomUUID() }]
    };

    const updatedBoard = {
      ...currentBoard,
      lists: currentBoard.lists.map(list =>
        list.id === todoList.id ? updatedList : list
      )
    };

    updateBoard(updatedBoard);
    setTitle('');
    setDueDate('');
    setAssignee('');
  };

  if (!currentBoard) return null;

  return (
    <div className="px-4 py-6 border-t border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Quick Add Task</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name"
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />
        
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Assign to...</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2"
        >
          Add Task
        </button>
      </form>
    </div>
  );
};