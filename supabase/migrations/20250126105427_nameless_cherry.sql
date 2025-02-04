/*
  # Add Location ID to Contacts Table

  1. Changes
    - Add location_id column to contacts table
    - Add default value for existing rows
    - Create index for faster lookups
    - Add NOT NULL constraint after setting defaults

  2. Security
    - No changes to RLS policies needed
*/

-- Add location_id column initially as nullable
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS location_id text;

-- Create temporary function to get location ID from metadata
CREATE OR REPLACE FUNCTION get_location_id_from_metadata(metadata jsonb)
RETURNS text AS $$
BEGIN
  -- Try to extract location_id from metadata if it exists
  RETURN metadata->'ghl_sync'->>'locationId';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update existing rows with location ID from metadata or set a default
UPDATE contacts
SET location_id = COALESCE(
  get_location_id_from_metadata(metadata),
  'default'  -- Fallback value for existing rows
)
WHERE location_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE contacts
ALTER COLUMN location_id SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS contacts_location_id_idx ON contacts(location_id);

-- Add comment explaining the column
COMMENT ON COLUMN contacts.location_id IS 'GHL location ID for data isolation';

-- Clean up temporary function
DROP FUNCTION get_location_id_from_metadata;

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';