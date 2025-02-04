import React, { useState, useRef, useEffect } from 'react';
import { Tag } from 'lucide-react';
import type { Label } from '../../types';

interface TaskLabelsSelectProps {
  selectedLabels: Label[];
  onChange: (labels: Label[]) => void;
}

export const TaskLabelsSelect: React.FC<TaskLabelsSelectProps> = ({ selectedLabels, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mock labels - in a real app, these would come from props or a store
  const availableLabels: Label[] = [
    { id: 'l1', name: 'Bug', color: '#ef4444' },
    { id: 'l2', name: 'Feature', color: '#3b82f6' },
    { id: 'l3', name: 'Documentation', color: '#10b981' },
    { id: 'l4', name: 'Design', color: '#8b5cf6' },
  ];

  const toggleLabel = (label: Label) => {
    const isSelected = selectedLabels.some(l => l.id === label.id);
    if (isSelected) {
      onChange(selectedLabels.filter(l => l.id !== label.id));
    } else {
      onChange([...selectedLabels, label]);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Labels
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 bg-gray-700 text-white rounded-lg px-3 py-2 hover:bg-gray-600"
      >
        <Tag className="w-4 h-4" />
        <span>{selectedLabels.length ? `${selectedLabels.length} selected` : 'Add labels'}</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-lg p-2 space-y-1">
          {availableLabels.map(label => (
            <button
              key={label.id}
              type="button"
              onClick={() => toggleLabel(label)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              <span className="text-white">{label.name}</span>
              {selectedLabels.some(l => l.id === label.id) && (
                <span className="ml-auto text-indigo-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};