/*
  # Add API Key and Location ID to Contacts Table

  1. Changes
    - Add api_key column to contacts table
    - Add location_id column to contacts table
    - Create indexes for faster lookups
    - Add NOT NULL constraints after setting defaults

  2. Security
    - No changes to RLS policies needed
*/

-- Add api_key column initially as nullable
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS api_key text;

-- Add location_id column initially as nullable
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS location_id text;

-- Update existing rows with default values
UPDATE contacts
SET 
  api_key = COALESCE(api_key, 'default'),
  location_id = COALESCE(location_id, 'default')
WHERE api_key IS NULL OR location_id IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE contacts
ALTER COLUMN api_key SET NOT NULL,
ALTER COLUMN location_id SET NOT NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS contacts_api_key_idx ON contacts(api_key);
CREATE INDEX IF NOT EXISTS contacts_location_id_idx ON contacts(location_id);
CREATE INDEX IF NOT EXISTS contacts_api_key_location_id_idx ON contacts(api_key, location_id);

-- Add comments explaining the columns
COMMENT ON COLUMN contacts.api_key IS 'API key for data isolation';
COMMENT ON COLUMN contacts.location_id IS 'GHL location ID for data isolation';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';