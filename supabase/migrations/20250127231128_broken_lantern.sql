/*
  # Fix task status constraint

  1. Changes
    - Update status check constraint to allow 'incompleted' value
    - Migrate existing data safely
    - Set proper default value

  2. Safety
    - Temporarily drop constraint
    - Handle null values
    - Add constraint back after data migration
*/

-- First drop the existing check constraint
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Set status to null temporarily to avoid constraint violations
ALTER TABLE tasks
ALTER COLUMN status DROP NOT NULL;

-- Update existing tasks to new status values
UPDATE tasks
SET status = CASE 
  WHEN status = 'completed' THEN 'completed'
  ELSE 'incompleted'
END;

-- Add new check constraint
ALTER TABLE tasks
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('completed', 'incompleted'));

-- Make status NOT NULL and set default
ALTER TABLE tasks
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN status SET DEFAULT 'incompleted';

-- Add comment explaining status values
COMMENT ON COLUMN tasks.status IS 'Task status (completed/incompleted) matching GHL status values';