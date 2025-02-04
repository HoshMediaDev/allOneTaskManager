import React from 'react';
import { Users } from 'lucide-react';
import { useTeamStore } from '../../../store/teamStore';
import { useAuthStore } from '../../../store/authStore';
import type { Assignee } from '../../../types';

interface TaskTeamAssigneeProps {
  assignees: Assignee[];
  onChange: (assignees: Assignee[]) => void;
}

export const TaskTeamAssignee: React.FC<TaskTeamAssigneeProps> = ({
  assignees,
  onChange
}) => {
  const { members } = useTeamStore();
  const { userEmail } = useAuthStore();

  // Create a virtual member for the current user if not in team members
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

  const handleMemberToggle = (e: React.MouseEvent, member: any) => {
    // Prevent event propagation
    e.preventDefault();
    e.stopPropagation();

    const assignee: Assignee = {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`.trim(),
      email: member.email,
      ghl_id: ''
    };

    // Update assignees list
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
        <h3 className="text-lg font-medium text-white">Assign to Team Member</h3>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-2">
          {allMembers.map(member => {
            const isCurrentUser = member.email === userEmail;
            const isSelected = assignees.some(a => a.id === member.id);
            
            return (
              <button
                key={member.id}
                type="button" // Explicitly set type to prevent form submission
                onClick={(e) => handleMemberToggle(e, member)}
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
                    <div className="font-medium flex items-center gap-2">
                      {member.firstName} {member.lastName}
                      {isCurrentUser && (
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">
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
      </div>

      {assignees.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Selected Team Members</h4>
          <div className="flex flex-wrap gap-2">
            {assignees.filter(a => !a.ghl_id).map(assignee => (
              <div
                key={assignee.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg text-sm"
              >
                <span className="text-white">{assignee.name}</span>
                <button
                  type="button"
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