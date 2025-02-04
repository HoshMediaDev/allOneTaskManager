-- Drop the contact_id column from team_members table
ALTER TABLE team_members
DROP COLUMN IF EXISTS ghl_contact_id,
DROP COLUMN IF EXISTS old_contact_id;

-- Add comment explaining the change
COMMENT ON TABLE team_members IS 'Team members table - contact IDs removed as they are now managed through the contacts table';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';