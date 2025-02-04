import type { TeamResponse } from '../../types/team';
import { TeamApi } from '../api/teamApi';
import { ApiError } from '../errors/ApiError';
import { supabase } from '../../lib/supabase';

export class TeamService {
  private static instance: TeamService;
  private api: TeamApi | null = null;

  private constructor() {}

  static getInstance(): TeamService {
    if (!this.instance) {
      this.instance = new TeamService();
    }
    return this.instance;
  }

  initialize(apiKey: string) {
    this.api = new TeamApi(apiKey);
  }

  async getTeamMembers(): Promise<TeamResponse> {
    if (!this.api) {
      throw new ApiError('Authentication required', 401);
    }

    try {
      // Get team members from API
      const response = await this.api.getTeamMembers();

      // Store minimal data in background without affecting the main flow
      const membersToUpsert = response.users.map(user => ({
        first_name: user.firstName,
        last_name: user.lastName,
        ghl_user_id: user.id,
        location_id: user.roles?.locationIds?.[0] || 'default'
      }));

      // Background storage - don't await or handle errors in main flow
      supabase
        .from('team_members')
        .upsert(membersToUpsert, {
          onConflict: 'ghl_user_id'
        })
        .then(() => {
          console.log('Team members data stored successfully');
        })
        .catch(error => {
          console.warn('Failed to store team members data:', error);
        });

      // Return data directly from API response
      return response;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }
}