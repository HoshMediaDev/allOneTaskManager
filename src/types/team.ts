export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: {
    type: string;
    role: string;
    locationIds: string[];
  };
  permissions: Record<string, boolean>;
}

export interface TeamResponse {
  users: TeamMember[];
}