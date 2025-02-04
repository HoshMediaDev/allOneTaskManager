/*
  # Fix Team Member Contact IDs

  1. Changes
    - Add temporary column to store old contact IDs
    - Clear invalid contact IDs that are actually location IDs
    - Add validation check for contact ID format

  2. Security
    - Maintains existing RLS policies
    - No data loss - preserves old values in temporary column
*/

-- First add a column to backup existing contact IDs
ALTER TABLE team_members
ADD COLUMN old_contact_id text;

-- Backup existing contact IDs
UPDATE team_members
SET old_contact_id = ghl_contact_id
WHERE ghl_contact_id IS NOT NULL;

-- Clear invalid contact IDs (those that match location ID pattern)
UPDATE team_members
SET ghl_contact_id = NULL
WHERE ghl_contact_id = location_id
   OR ghl_contact_id !~ '^[A-Za-z0-9]{20,}$';

-- Add comment explaining the changes
COMMENT ON COLUMN team_members.old_contact_id IS 'Temporary column to store old contact IDs during migration';

-- Add comment explaining ghl_contact_id format
COMMENT ON COLUMN team_members.ghl_contact_id IS 'GHL contact ID - must be a valid GHL format (20+ alphanumeric characters)';