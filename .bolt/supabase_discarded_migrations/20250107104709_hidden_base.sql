/*
  # Update schema for shared tasks

  1. Changes
    - Remove private-related columns from boards table
    - Add assignees column to tasks table for shared task tracking
    - Update RLS policies to reflect changes

  2. Security
    - Enable RLS on all tables
    - Add policies for shared task access
*/

-- Remove private-related columns from boards
ALTER TABLE boards 
DROP COLUMN IF EXISTS is_private,
DROP COLUMN IF EXISTS owner_email;

-- Ensure tasks table has assignees column
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assignees jsonb DEFAULT '[]'::jsonb;

-- Create index for assignee search
CREATE INDEX IF NOT EXISTS idx_tasks_assignees ON tasks USING gin(assignees);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow all board operations" ON boards;
CREATE POLICY "Allow all board operations" ON boards
FOR ALL USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all tasks access" ON tasks;
CREATE POLICY "Allow all tasks access" ON tasks
FOR ALL USING (true)
WITH CHECK (true);

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';