import React, { useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { RecentTasks } from './RecentTasks';
import { TaskDistribution } from './TaskDistribution';
import { ApiSettingsCard } from './ApiSettingsCard';
import { SharedWithMe } from './SharedWithMe';
import { PrivateTasks } from './PrivateTasks';
import { useApiConfiguration } from '../../hooks/useApiConfiguration';
import { useAuthStore } from '../../store/authStore';
import { useContactStore } from '../../store/contactStore';

export const DashboardLayout: React.FC = () => {
  const { isConfigured } = useApiConfiguration();
  const { isOfflineMode, userEmail } = useAuthStore();
  const { contacts, isLoading: isLoadingContacts, error: contactsError } = useContactStore();

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />
      {userEmail && (
        <div className="bg-indigo-500/10 text-indigo-300 p-4 rounded-lg">
          <p className="font-medium">Viewing dashboard for: {userEmail}</p>
        </div>
      )}

      {!isConfigured && !isOfflineMode && <ApiSettingsCard />}
      
      {isOfflineMode && (
        <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-lg">
          <p className="font-medium">Offline Mode</p>
          <p className="text-sm mt-1">Some features may be limited while working offline.</p>
        </div>
      )}

      {isLoadingContacts && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        </div>
      )}

      {contactsError && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">{contactsError}</p>
        </div>
      )}

      <DashboardStats />

      {/* Recent Tasks and Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentTasks />
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Recent Contacts</h3>
          {contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.slice(0, 5).map(contact => (
                <div key={contact.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {contact.firstName} {contact.lastName}
                    </p>
                    {contact.email && (
                      <p className="text-sm text-gray-400">{contact.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoadingContacts && !contactsError ? (
            <p className="text-gray-400 text-center">No contacts found</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskDistribution />
      </div>

      <div className="space-y-6">
        <PrivateTasks />
        <SharedWithMe />
      </div>
    </div>
  );
};