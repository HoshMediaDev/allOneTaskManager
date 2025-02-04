import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useContactStore } from '../../../store/contactStore';
import type { Assignee } from '../../../types';

interface TaskContactAssigneeProps {
  assignees: Assignee[];
  onChange: (assignees: Assignee[]) => void;
}

export const TaskContactAssignee: React.FC<TaskContactAssigneeProps> = ({
  assignees,
  onChange
}) => {
  const { contacts } = useContactStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter contacts based on search query
  const filteredContacts = React.useMemo(() => {
    if (!searchQuery) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.firstName?.toLowerCase().includes(query) ||
      contact.lastName?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const handleAssigneeToggle = (e: React.MouseEvent, contact: any) => {
    e.preventDefault();
    e.stopPropagation();

    const assignee: Assignee = {
      id: contact.id,
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email || 'Unnamed Contact',
      email: contact.email || '',
      ghl_id: contact.ghl_id
    };

    const isSelected = assignees.some(a => a.id === assignee.id);
    if (isSelected) {
      onChange(assignees.filter(a => a.id !== assignee.id));
    } else {
      onChange([...assignees, assignee]);
    }
  };

  return (
    <div className="space-y-4" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-white">Assign to Contact</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          onClick={e => e.stopPropagation()}
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => {
              const isSelected = assignees.some(a => a.id === contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={(e) => handleAssigneeToggle(e, contact)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.email && (
                        <div className="text-sm opacity-75 truncate max-w-[150px]">
                          {contact.email}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-white text-lg">✓</span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-center text-gray-400 py-2">
              {searchQuery ? 'No contacts found' : 'No contacts available'}
            </p>
          )}
        </div>
      </div>

      {assignees.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Selected Contacts</h4>
          <div className="flex flex-wrap gap-2">
            {assignees.map(assignee => (
              <div
                key={assignee.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg text-sm"
              >
                <span className="text-white">{assignee.name}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(assignees.filter(a => a.id !== assignee.id));
                  }}
                  className="text-gray-400 hover:text-red-400 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};