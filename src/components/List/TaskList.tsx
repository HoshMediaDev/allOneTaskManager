import React, { useState, useEffect, useRef } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Plus, Calendar, Users, Tag, ChevronDown } from 'lucide-react';
import { ListHeader } from './ListHeader';
import { TaskCard } from '../Task/TaskCard';
import { useTaskActions } from '../../hooks/useTaskActions';
import { useContactStore } from '../../store/contactStore';
import { ListService } from '../../services/board/listService';
import { useBoardStore } from '../../store/boardStore';
import { usePrivateBoardStore } from '../../store/privateBoardStore';
import type { List, Task } from '../../types';

interface TaskListProps {
  list: List;
  index: number;
}

export const TaskList: React.FC<TaskListProps> = ({ list, index }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    assignees: [] as any[],
    dueDate: '',
    priority: 'medium' as Task['priority'],
    tags: [] as string[],
    newTag: ''
  });
  const { contacts } = useContactStore();
  const { currentBoard: sharedBoard, updateBoard: updateSharedBoard } = useBoardStore();
  const { currentBoard: privateBoard, updateBoard: updatePrivateBoard } = usePrivateBoardStore();

  // Determine if we're working with a private board
  const currentBoard = privateBoard?.id === list.boardId ? privateBoard : sharedBoard;
  const updateBoard = privateBoard?.id === list.boardId ? updatePrivateBoard : updateSharedBoard;

  useEffect(() => {
    if (showInlineForm && formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [showInlineForm]);

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || isCreating || !currentBoard) return;

    try {
      setIsCreating(true);
      
      const taskData: Omit<Task, 'id' | 'listId'> = {
        title: formData.title.trim(),
        description: '',
        content: '',
        priority: formData.priority,
        labels: [],
        assignees: formData.assignees,
        tags: formData.tags,
        customFieldValues: [],
        attachments: [],
        checklist: [],
        dueDate: formData.dueDate || undefined,
        startDate: undefined,
        estimatedTime: undefined,
        actualTime: undefined,
        status: 'incompleted'
      };

      // Create task using ListService
      const newTask = await ListService.createTask(
        list.id,
        taskData,
        list.is_private || false,
        list.user_email
      );

      if (!newTask) {
        throw new Error('Failed to create task');
      }

      // Update local state
      const updatedLists = currentBoard.lists.map(l => {
        if (l.id === list.id) {
          return {
            ...l,
            tasks: [...l.tasks, newTask]
          };
        }
        return l;
      });

      // Update board state
      updateBoard({
        ...currentBoard,
        lists: updatedLists
      });

      // Reset form
      setFormData({
        title: '',
        assignees: [],
        dueDate: '',
        priority: 'medium',
        tags: [],
        newTag: ''
      });
      setShowInlineForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const addTag = () => {
    if (formData.newTag && !formData.tags.includes(formData.newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag],
        newTag: ''
      }));
    }
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 min-w-[320px] max-w-[320px] flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 ${
            list.tasks.length === 0 && !showInlineForm ? 'h-auto' : ''
          }`}
        >
          <div 
            {...provided.dragHandleProps}
            className="pb-2 border-b border-gray-700/50"
          >
            <ListHeader list={list} />
          </div>
          
          <Droppable droppableId={list.id} type="task">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 space-y-2 py-2 px-0.5 overflow-y-auto ${
                  list.tasks.length === 0 && !showInlineForm ? 'min-h-0' : 'min-h-[2rem]'
                }`}
                style={{
                  height: list.tasks.length === 0 && !showInlineForm ? 'auto' : undefined,
                  maxHeight: 'calc(100vh - 16rem)'
                }}
              >
                {list.tasks.map((task, taskIndex) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    index={taskIndex}
                  />
                ))}
                {provided.placeholder}

                {showInlineForm && (
                  <div 
                    ref={formRef}
                    className="group bg-gray-900/95 border border-gray-800 p-3 rounded-lg shadow-sm"
                  >
                    <form onSubmit={handleInlineSubmit} className="space-y-3">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter task title"
                        className="w-full bg-gray-950/50 text-white rounded-lg px-4 py-2.5 border border-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none placeholder-gray-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm whitespace-nowrap">Priority:</span>
                        <div className="relative flex-1 max-w-[140px]">
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                            className="w-full bg-gray-950/50 text-white rounded-lg px-3 py-2.5 border border-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none appearance-none pr-8"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div 
                        className="relative cursor-pointer group"
                        onClick={(e) => {
                          const input = e.currentTarget.querySelector('input[type="date"]');
                          if (input) {
                            input.showPicker();
                          }
                        }}
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full bg-gray-950/50 text-white rounded-lg pl-12 pr-4 py-2.5 border border-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none cursor-pointer"
                          placeholder="Due date"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Users className="w-5 h-5" />
                        </div>
                        <select
                          value={formData.assignees[0]?.id || ''}
                          onChange={(e) => {
                            const contact = contacts.find(c => c.id === e.target.value);
                            if (contact) {
                              setFormData(prev => ({
                                ...prev,
                                assignees: [{
                                  id: contact.id,
                                  name: contact.firstName + ' ' + contact.lastName,
                                  email: contact.email || '',
                                  ghl_id: contact.ghl_id
                                }]
                              }));
                            }
                          }}
                          className="w-full bg-gray-950/50 text-white rounded-lg pl-12 pr-10 py-2.5 border border-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none appearance-none"
                        >
                          <option value="">Assignee</option>
                          {contacts.map(contact => (
                            <option key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowInlineForm(false);
                            setFormData({
                              title: '',
                              assignees: [],
                              dueDate: '',
                              priority: 'medium',
                              tags: [],
                              newTag: ''
                            });
                          }}
                          className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={!formData.title.trim() || isCreating}
                        >
                          {isCreating ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </Droppable>
          
          <button
            onClick={() => setShowInlineForm(true)}
            className={`mt-1 py-2 px-3 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 group`}
            disabled={isCreating || showInlineForm}
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>{isCreating ? 'Adding Task...' : 'Add'}</span>
          </button>
        </div>
      )}
    </Draggable>
  );
};