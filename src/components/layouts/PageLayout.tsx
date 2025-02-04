import React from 'react';
import { useLocation } from 'react-router-dom';
import { BackButton } from '../ui/BackButton';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const location = useLocation();
  const showBackButton = !location.pathname.endsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gray-900">
      {showBackButton && (
        <div className="fixed top-6 left-6 z-50">
          <BackButton />
        </div>
      )}
      <div className="ml-16 pt-6">
        {children}
      </div>
    </div>
  );
};