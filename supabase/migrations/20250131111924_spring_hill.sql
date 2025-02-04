-- Add unique constraint on ghl_user_id for team_members if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'team_members_ghl_user_id_key'
  ) THEN
    ALTER TABLE team_members
    ADD CONSTRAINT team_members_ghl_user_id_key UNIQUE (ghl_user_id);
  END IF;
END $$;

-- Add unique constraint on ghl_id for contacts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_ghl_id_key'
  ) THEN
    ALTER TABLE contacts
    ADD CONSTRAINT contacts_ghl_id_key UNIQUE (ghl_id);
  END IF;
END $$;

-- Drop existing indexes if they exist to avoid conflicts
DROP INDEX IF EXISTS team_members_ghl_user_id_idx;
DROP INDEX IF EXISTS contacts_ghl_id_idx;

-- Recreate indexes
CREATE INDEX team_members_ghl_user_id_idx ON team_members(ghl_user_id);
CREATE INDEX contacts_ghl_id_idx ON contacts(ghl_id);

-- Add comments
COMMENT ON CONSTRAINT team_members_ghl_user_id_key ON team_members IS 'Ensures unique GHL user IDs for team members';
COMMENT ON CONSTRAINT contacts_ghl_id_key ON contacts IS 'Ensures unique GHL IDs for contacts';