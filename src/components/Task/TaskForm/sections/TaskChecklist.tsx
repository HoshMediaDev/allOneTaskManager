import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import type { ChecklistItem } from '../../../types';

interface TaskChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({ items, onChange }) => {
  const [newItemText, setNewItemText] = useState('');

  const addItem = () => {
    if (newItemText) {
      onChange([
        ...items,
        { id: crypto.randomUUID(), text: newItemText, completed: false },
      ]);
      setNewItemText('');
    }
  };

  const toggleItem = (id: string) => {
    onChange(
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-white">Checklist</h3>
      </div>

      <div className="space-y-2 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
              className="rounded border-gray-500 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-white">{item.text}</span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="ml-auto text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={newItemText}
          onChange={e => setNewItemText(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Add checklist item"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
        >
          Add
        </button>
      </div>
    </div>
  );
};