/*
  # Team Members and Contacts Schema Update

  1. Changes
    - Simplify team_members table to only store essential GHL IDs
    - Simplify contacts table to only store name and GHL contact ID
  
  2. Security
    - Maintain existing RLS policies
    - Keep existing indexes for performance
*/

-- First clean up team_members table
ALTER TABLE team_members
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS permissions,
ADD COLUMN IF NOT EXISTS ghl_contact_id text,
ADD COLUMN IF NOT EXISTS ghl_user_id text;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS team_members_ghl_contact_id_idx ON team_members(ghl_contact_id);
CREATE INDEX IF NOT EXISTS team_members_ghl_user_id_idx ON team_members(ghl_user_id);

-- Add comments
COMMENT ON COLUMN team_members.ghl_contact_id IS 'GHL contact ID for the team member';
COMMENT ON COLUMN team_members.ghl_user_id IS 'GHL user ID for the team member';

-- Simplify contacts table by dropping unnecessary columns
ALTER TABLE contacts
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS custom_fields,
DROP COLUMN IF EXISTS metadata;

-- Rename first_name and last_name to name
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS name text;

-- Update name column with concatenated first and last names
UPDATE contacts 
SET name = CONCAT_WS(' ', first_name, last_name)
WHERE name IS NULL;

-- Make name required and drop old columns
ALTER TABLE contacts
ALTER COLUMN name SET NOT NULL,
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name;

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';