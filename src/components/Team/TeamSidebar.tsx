import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';
import { useTeamData } from '../../hooks/useTeamData';

export const TeamSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { members, isLoading, error } = useTeamStore();
  const { userEmail } = useAuthStore();
  useTeamData();

  const handleMemberClick = (memberId: string) => {
    navigate(`/team/${memberId}?${searchParams.toString()}`);
  };

  // Get the current active member ID from the URL
  const activeMemberId = location.pathname.match(/\/team\/([^/]+)/)?.[1];

  if (isLoading) {
    return (
      <div className="text-center py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-400 px-4 py-2">
        {error === 'Authentication required' ? 'Please configure API settings' : error}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {members.map(member => {
        const isCurrentUser = member.email?.toLowerCase() === userEmail?.toLowerCase();
        const initials = `${member.firstName[0]}${member.lastName[0] || ''}`.toUpperCase();
        const isActive = member.id === activeMemberId;
        
        return (
          <button
            key={member.id}
            onClick={() => handleMemberClick(member.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors ${
              isActive 
                ? 'bg-gray-800 text-white'
                : 'text-gray-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium">{initials}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {member.firstName} {member.lastName}
              </span>
              {isCurrentUser && (
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                  You
                </span>
              )}
              {member.ghl_contact_id && (
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Active
                </span>
              )}
            </div>
          </button>
        );
      })}

      {!isLoading && members.length === 0 && (
        <p className="text-sm text-gray-400 px-4 py-2">
          {error ? error : 'No team members found'}
        </p>
      )}
    </div>
  );
};