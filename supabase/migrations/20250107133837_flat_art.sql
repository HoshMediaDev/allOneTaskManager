-- Add status column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'todo'
CHECK (status IN ('todo', 'in_progress', 'completed'));

-- Create index for status column
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);

-- Add comment explaining status column
COMMENT ON COLUMN tasks.status IS 'Current status of the task (todo, in_progress, completed)';

-- Update existing tasks based on their list
UPDATE tasks t
SET status = CASE 
  WHEN l.title ILIKE 'done' THEN 'completed'
  WHEN l.title ILIKE 'in progress' THEN 'in_progress'
  ELSE 'todo'
END
FROM lists l
WHERE t.list_id = l.id;