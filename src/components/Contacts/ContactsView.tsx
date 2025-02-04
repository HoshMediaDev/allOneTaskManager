import React, { useState } from 'react';
import { Search, Mail, Phone, Tag, Calendar, User, Hash } from 'lucide-react';
import { useContactStore } from '../../store/contactStore';
import { BackButton } from '../ui/BackButton';

export const ContactsView: React.FC = () => {
  const { contacts, isLoading, error } = useContactStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      contact.firstName?.toLowerCase().includes(searchTerm) ||
      contact.lastName?.toLowerCase().includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchTerm) ||
      contact.phone?.toLowerCase().includes(searchTerm) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton fallbackPath="/dashboard" />
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <span className="text-sm bg-gray-700 text-indigo-300 px-3 py-1 rounded-full">
            {contacts.length} total
          </span>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name, email, phone, or tags..."
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-700 hover:border-gray-600 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="space-y-4">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        {contact.firstName} {contact.lastName}
                        {contact.ghl_id && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                            All One Contact
                          </span>
                        )}
                      </h3>
                      <div className="mt-2 space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="w-4 h-4 text-indigo-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone className="w-4 h-4 text-indigo-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span>Added {formatDate(contact.dateAdded)}</span>
                        </div>
                        {contact.ghl_id && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <Hash className="w-4 h-4 text-indigo-400" />
                            <span className="font-mono text-sm">All One ID: {contact.ghl_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {contact.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded-full text-sm text-indigo-300"
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {contact.customFields?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {contact.customFields.map(field => (
                        <div key={field.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                          <span className="text-sm text-indigo-300">{field.name}:</span>
                          <span className="ml-2 text-white">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {searchQuery ? 'No contacts found matching your search' : 'No contacts available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};