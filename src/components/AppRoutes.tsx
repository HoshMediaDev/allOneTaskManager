import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sidebar } from './Sidebar';
import { BoardView } from './Board/BoardView';
import { SettingsPage } from './Settings/SettingsPage';
import { DashboardLayout } from './Dashboard/DashboardLayout';
import { TaskDetails } from './Task/TaskDetails';
import { PrivateTaskDetails } from './PrivateBoards/PrivateTaskDetails';
import { TeamMemberDetails } from './Team/TeamMemberDetails';
import { SharedTasksView } from './SharedTasks/SharedTasksView';
import { ContactsView } from './Contacts/ContactsView';
import { PrivateBoardsView } from './PrivateBoards/PrivateBoardsView';
import { PrivateBoardView } from './PrivateBoards/PrivateBoardView';
import { useBoardStore } from '../store/boardStore';

const TeamMemberRoute: React.FC = () => {
  const { memberId } = useParams();
  return <TeamMemberDetails memberId={memberId || ''} />;
};

export const AppRoutes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setLocationId, setUserEmail } = useAuthStore();
  const { loadBoards } = useBoardStore();

  // Extract params from URL
  const locationId = searchParams.get('locationid');
  const userEmail = searchParams.get('useremail');

  // Set auth context from URL params
  useEffect(() => {
    if (locationId) {
      setLocationId(locationId);
    }
    if (userEmail) {
      setUserEmail(userEmail.toLowerCase());
    }
  }, [locationId, userEmail, setLocationId, setUserEmail]);

  // Load boards when locationId changes
  useEffect(() => {
    if (locationId) {
      loadBoards();
    }
  }, [locationId, loadBoards]);

  if (!locationId || !userEmail) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Welcome to Task Manager</h1>
          <p className="text-gray-400 mb-2">Please provide a location ID and user email in the URL.</p>
          <p className="text-sm text-gray-500">Example: /tasks?locationid=YOUR_ID&useremail=YOUR_EMAIL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="/tasks" element={<BoardView />} />
          <Route path="/task/:taskId" element={<TaskDetails />} />
          <Route path="/private-boards" element={<PrivateBoardsView />} />
          <Route path="/private-boards/:boardId" element={<PrivateBoardView />} />
          <Route path="/private-boards/:boardId/task/:taskId" element={<PrivateTaskDetails />} />
          <Route path="/team/:memberId" element={<TeamMemberRoute />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/shared" element={<SharedTasksView />} />
          <Route path="/contacts" element={<ContactsView />} />
          <Route path="/" element={<Navigate to={`/dashboard?${searchParams.toString()}`} replace />} />
          <Route path="*" element={<Navigate to={`/dashboard?${searchParams.toString()}`} replace />} />
        </Routes>
      </div>
    </div>
  );
};