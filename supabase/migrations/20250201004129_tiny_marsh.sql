/*
  # Add is_private column to tasks table

  1. Changes
    - Add is_private column to tasks table with default false
    - Add index for faster filtering
    - Add comment explaining the column purpose

  2. Impact
    - All existing tasks will be marked as non-private by default
    - New tasks can be marked as private or public
*/

-- Add is_private column with default value
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS tasks_is_private_idx ON tasks(is_private);

-- Add comment explaining the column
COMMENT ON COLUMN tasks.is_private IS 'Indicates if task is private (stored locally only) or shared (synced with GHL)';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';