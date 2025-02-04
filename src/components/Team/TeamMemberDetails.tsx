import React from 'react';
import { Mail, Calendar, User, Shield, Hash, Users, Building } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';
import { BackButton } from '../ui/BackButton';

interface TeamMemberDetailsProps {
  memberId: string;
}

export const TeamMemberDetails: React.FC<TeamMemberDetailsProps> = ({ memberId }) => {
  const { members } = useTeamStore();
  const { userEmail } = useAuthStore();

  const member = members.find(m => m.id === memberId);
  const isCurrentUser = member?.email?.toLowerCase() === userEmail?.toLowerCase();

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <BackButton fallbackPath="/dashboard" />
        <div className="text-center text-red-400 mt-6">
          Team member not found
        </div>
      </div>
    );
  }

  const initials = `${member.firstName[0]}${member.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <BackButton fallbackPath="/dashboard" />
        </div>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700/50">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <span className="text-2xl font-bold text-indigo-300">{initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">
                    {member.firstName} {member.lastName}
                  </h1>
                  {isCurrentUser && (
                    <span className="text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-indigo-400">{member.roles?.role || 'Team Member'}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{member.roles?.type || 'User'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <Building className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p className="text-white font-medium">{member.roles?.type || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="text-white font-medium">{member.roles?.role || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <Hash className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm text-gray-400">User ID</p>
                    <p className="text-white font-mono text-sm">{member.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          {member.permissions && Object.keys(member.permissions).length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Permissions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(member.permissions).map(([key, value]) => (
                  <div key={key} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">{key}</p>
                    <div className={`text-sm font-medium ${value ? 'text-green-400' : 'text-red-400'}`}>
                      {value ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Access */}
          {member.roles?.locationIds && member.roles.locationIds.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Team Access
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {member.roles.locationIds.map((locationId) => (
                  <div key={locationId} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Location ID</p>
                    <p className="text-white font-mono text-sm">{locationId}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};