import React from 'react';
import { AppRoutes } from './components/AppRoutes';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useContactSync } from './hooks/useContactSync';
import { useTaskSync } from './hooks/useTaskSync';

export default function App() {
  useSupabaseData();
  useContactSync();
  useTaskSync(); // Add task sync hook

  return <AppRoutes />;
}