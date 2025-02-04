/*
  # Add location_id to tasks

  1. Changes
    - Add location_id column to tasks table
    - Populate location_id from parent board
    - Make column required after population
    - Add index for performance

  2. Safety Measures
    - Handle null values before making column required
    - Use default value for any orphaned tasks
*/

-- First add the column as nullable
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS location_id text;

-- Create a function to get default location ID
CREATE OR REPLACE FUNCTION get_default_location_id()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT location_id 
    FROM boards 
    ORDER BY created_at ASC 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Update tasks with location_id from their parent board
DO $$ 
BEGIN
  -- First update tasks that have a valid board relationship
  UPDATE tasks t
  SET location_id = b.location_id
  FROM lists l
  JOIN boards b ON l.board_id = b.id
  WHERE t.list_id = l.id
  AND t.location_id IS NULL;

  -- Then handle any orphaned tasks with the default location_id
  UPDATE tasks
  SET location_id = get_default_location_id()
  WHERE location_id IS NULL;
END $$;

-- Now make the column required
ALTER TABLE tasks
ALTER COLUMN location_id SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS tasks_location_id_idx ON tasks(location_id);

-- Add comment explaining the column
COMMENT ON COLUMN tasks.location_id IS 'GHL location ID for data isolation';

-- Clean up the temporary function
DROP FUNCTION get_default_location_id();