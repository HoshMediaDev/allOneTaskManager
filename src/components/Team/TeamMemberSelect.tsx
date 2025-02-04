import React from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';

interface TeamMemberSelectProps {
  selectedMembers: string[];
  onChange: (memberIds: string[]) => void;
  multiple?: boolean;
}

export const TeamMemberSelect: React.FC<TeamMemberSelectProps> = ({
  selectedMembers,
  onChange,
  multiple = false
}) => {
  const { members } = useTeamStore();
  const { userEmail } = useAuthStore();

  // Create a virtual member for the current user if not in team members
  const allMembers = React.useMemo(() => {
    if (!userEmail) return members;

    const currentUserMember = members.find(m => m.email === userEmail);
    if (currentUserMember) return members;

    // Add current user as a virtual member
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

  const handleMemberToggle = (memberId: string) => {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    const isSelected = selectedMembers.includes(member.email);
    if (isSelected) {
      onChange(selectedMembers.filter(email => email !== member.email));
    } else {
      onChange([...selectedMembers, member.email]);
    }
  };

  return (
    <div className="grid gap-2 max-h-48 overflow-y-auto pr-2">
      {allMembers.map((member) => {
        const isCurrentUser = member.email === userEmail;
        const isSelected = selectedMembers.includes(member.email);
        
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => handleMemberToggle(member.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {isCurrentUser ? 'Y' : `${member.firstName[0]}${member.lastName[0] || ''}`}
                </span>
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {member.firstName} {member.lastName}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="text-sm opacity-75">
                  {member.email}
                </div>
              </div>
            </div>
            {isSelected && (
              <span className="text-white text-lg">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
};