import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types';

interface TaskTemplate extends Omit<Task, 'id' | 'listId'> {
  id: string;
  name: string;
}

interface TaskTemplateStore {
  templates: TaskTemplate[];
  addTemplate: (template: Omit<TaskTemplate, 'id'>) => void;
  updateTemplate: (template: TaskTemplate) => void;
  deleteTemplate: (id: string) => void;
}

export const useTaskTemplates = create<TaskTemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, { ...template, id: crypto.randomUUID() }],
      })),
      updateTemplate: (template) => set((state) => ({
        templates: state.templates.map((t) => 
          t.id === template.id ? template : t
        ),
      })),
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      })),
    }),
    {
      name: 'task-templates',
    }
  )
);