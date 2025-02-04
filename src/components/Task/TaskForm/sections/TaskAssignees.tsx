import React from 'react';
import { Users } from 'lucide-react';
import { useTeamStore } from '../../../../store/teamStore';

interface TaskAssigneesProps {
  assignees: string[];
  onChange: (assignees: string[]) => void;
}

export const TaskAssignees: React.FC<TaskAssigneesProps> = ({
  assignees,
  onChange
}) => {
  const { members } = useTeamStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-white">Assign Team Members</h3>
      </div>
      
      <div className="grid gap-2 max-h-48 overflow-y-auto">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => {
              const isSelected = assignees.includes(member.id);
              onChange(isSelected 
                ? assignees.filter(id => id !== member.id)
                : [...assignees, member.id]
              );
            }}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              assignees.includes(member.id)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {member.firstName[0]}{member.lastName[0]}
                </span>
              </div>
              <div className="text-left">
                <div className="font-medium">
                  {member.firstName} {member.lastName}
                </div>
                <div className="text-sm opacity-75">
                  {member.email}
                </div>
              </div>
            </div>
            {assignees.includes(member.id) && (
              <span className="text-white text-lg">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};