-- Add is_private and user_email columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_email text;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS tasks_is_private_idx ON tasks(is_private);
CREATE INDEX IF NOT EXISTS tasks_user_email_idx ON tasks(user_email);
CREATE INDEX IF NOT EXISTS tasks_is_private_user_email_idx ON tasks(is_private, user_email);

-- Add comments explaining the columns
COMMENT ON COLUMN tasks.is_private IS 'Indicates if task is private (stored locally only) or shared (synced with GHL)';
COMMENT ON COLUMN tasks.user_email IS 'Email of the user who owns the private task';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';