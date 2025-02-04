import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Search as SearchIcon } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import type { Task } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const { currentBoard } = useBoardStore();

  useEffect(() => {
    if (!query.trim() || !currentBoard) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const tasks = currentBoard.lists.flatMap(list => list.tasks);
    
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm) ||
      task.content.toLowerCase().includes(searchTerm) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    setResults(filtered);
  }, [query, currentBoard]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Tasks">
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            query ? (
              <p className="text-gray-400 text-center py-4">No results found</p>
            ) : (
              <p className="text-gray-400 text-center py-4">Start typing to search</p>
            )
          ) : (
            <div className="space-y-2">
              {results.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    onClose();
                  }}
                  className="w-full text-left bg-gray-700 p-4 rounded-lg hover:bg-gray-600"
                >
                  <h4 className="text-white font-medium">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};