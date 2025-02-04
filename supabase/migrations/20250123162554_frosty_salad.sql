/*
  # Add GHL Task Integration

  1. Changes
    - Add ghl_task_id column to tasks table
    - Add index for faster lookups
    - Add comment explaining the column purpose

  2. Security
    - No changes to RLS policies needed
*/

-- Add GHL task ID column
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS ghl_task_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS tasks_ghl_task_id_idx ON tasks(ghl_task_id);

-- Add comment explaining the column
COMMENT ON COLUMN tasks.ghl_task_id IS 'ID of the corresponding task in GoHighLevel';