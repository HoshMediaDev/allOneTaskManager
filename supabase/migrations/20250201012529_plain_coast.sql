-- Add is_private and user_email columns if they don't exist
DO $$ 
BEGIN
  -- Add is_private column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'is_private'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_private boolean DEFAULT false;
  END IF;

  -- Add user_email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE tasks ADD COLUMN user_email text;
  END IF;
END $$;

-- Create or replace indexes
DROP INDEX IF EXISTS tasks_is_private_idx;
DROP INDEX IF EXISTS tasks_user_email_idx;
DROP INDEX IF EXISTS tasks_is_private_user_email_idx;

CREATE INDEX tasks_is_private_idx ON tasks(is_private);
CREATE INDEX tasks_user_email_idx ON tasks(user_email);
CREATE INDEX tasks_is_private_user_email_idx ON tasks(is_private, user_email);

-- Add comments explaining the columns
COMMENT ON COLUMN tasks.is_private IS 'Indicates if task is private (stored locally only) or shared (synced with GHL)';
COMMENT ON COLUMN tasks.user_email IS 'Email of the user who owns the private task';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';