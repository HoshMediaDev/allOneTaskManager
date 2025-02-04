/*
  # Update task status options

  1. Changes
    - Drop existing status check constraint
    - Update status column to allow new values
    - Add new check constraint for completed/incompleted
    - Update existing data to use new status values

  2. Data Migration
    - Convert all non-completed statuses to 'incompleted'
    - Keep 'completed' as is
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