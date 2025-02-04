-- First, identify contacts with default location_id
CREATE OR REPLACE FUNCTION get_correct_location_id(contact_ghl_id text)
RETURNS text AS $$
DECLARE
  correct_location_id text;
BEGIN
  -- Try to get location ID from tasks table first
  SELECT DISTINCT location_id INTO correct_location_id
  FROM tasks
  WHERE contact_id = contact_ghl_id
  LIMIT 1;

  -- If not found in tasks, try to get from boards table
  IF correct_location_id IS NULL THEN
    -- Use subquery to get the earliest created board's location_id
    SELECT location_id INTO correct_location_id
    FROM (
      SELECT DISTINCT ON (location_id) location_id, created_at
      FROM boards
      ORDER BY location_id, created_at ASC
    ) earliest_boards
    LIMIT 1;
  END IF;

  RETURN correct_location_id;
END;
$$ LANGUAGE plpgsql;

-- Update contacts with correct location IDs
DO $$ 
BEGIN
  -- Update contacts that have 'default' as location_id
  UPDATE contacts c
  SET location_id = get_correct_location_id(c.ghl_id)
  WHERE c.location_id = 'default'
  AND get_correct_location_id(c.ghl_id) IS NOT NULL;

  -- Log any remaining contacts with default location_id
  CREATE TEMP TABLE contacts_to_check AS
  SELECT ghl_id, name, location_id
  FROM contacts
  WHERE location_id = 'default';

  -- Output results to logs
  RAISE NOTICE 'Contacts still with default location_id: %', 
    (SELECT COUNT(*) FROM contacts_to_check);
END $$;

-- Clean up
DROP FUNCTION get_correct_location_id;
DROP TABLE IF EXISTS contacts_to_check;

-- Add constraint to prevent 'default' location_id
ALTER TABLE contacts
ADD CONSTRAINT contacts_location_id_not_default 
CHECK (location_id != 'default');

-- Add comment explaining the changes
COMMENT ON CONSTRAINT contacts_location_id_not_default ON contacts 
IS 'Ensures location_id is never set to default value';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';