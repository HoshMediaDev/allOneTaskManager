-- Add attachments column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Create index for attachments
CREATE INDEX IF NOT EXISTS tasks_attachments_gin_idx ON tasks USING gin(attachments);

-- Add comment explaining the column
COMMENT ON COLUMN tasks.attachments IS 'List of file and link attachments for the task';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';