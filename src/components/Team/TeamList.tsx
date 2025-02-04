import React from 'react';
import { Users, Hash } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';
import { useTeamData } from '../../hooks/useTeamData';
import { useAuthStore } from '../../store/authStore';

export const TeamList: React.FC = () => {
  const { members, isLoading, error } = useTeamStore();
  const { userEmail } = useAuthStore();
  useTeamData();

  // Add current user to members list if not already present
  const allMembers = React.useMemo(() => {
    if (!userEmail) return members;

    const currentUserMember = members.find(m => m.email === userEmail);
    if (currentUserMember) return members;

    return [
      {
        id: 'current-user',
        firstName: 'You',
        lastName: '',
        email: userEmail,
        roles: { type: 'user', role: 'member' },
        permissions: {}
      },
      ...members
    ];
  }, [members, userEmail]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-medium text-white">Team Members</h3>
        <span className="text-sm text-gray-400">({allMembers.length})</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-400 mb-2">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allMembers.map(member => {
            const isCurrentUser = member.email === userEmail;
            return (
              <div key={member.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {isCurrentUser ? 'Y' : `${member.firstName[0]}${member.lastName[0] || ''}`}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {member.firstName} {member.lastName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </h4>
                    {member.roles && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.roles.role && (
                          <span className="text-xs px-2 py-1 bg-gray-600 rounded-full text-gray-300">
                            {member.roles.role}
                          </span>
                        )}
                        {member.roles.locationIds?.[0] && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">GHL ID: {member.roles.locationIds[0]}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {allMembers.length === 0 && !error && (
            <p className="text-center text-gray-400 py-4">No team members found</p>
          )}
        </div>
      )}
    </div>
  );
};