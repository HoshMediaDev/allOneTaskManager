import { useEffect } from 'react';
import { useApiStore } from '../store/apiStore';
import { useTeamStore } from '../store/teamStore';
import { useContactStore } from '../store/contactStore';
import { TeamService } from '../services/team/team.service';
import { ContactService } from '../services/ghl/contact.service';

export const useApiConfiguration = () => {
  const { apiKey } = useApiStore();
  const { loadTeamMembers } = useTeamStore();
  const { loadContacts } = useContactStore();

  useEffect(() => {
    if (apiKey) {
      // Initialize services
      const teamService = TeamService.getInstance();
      const contactService = ContactService.getInstance();
      
      teamService.initialize(apiKey);
      contactService.initialize(apiKey);

      // Load data
      loadTeamMembers();
      loadContacts();
    }
  }, [apiKey, loadTeamMembers, loadContacts]);

  return { isConfigured: !!apiKey };
};