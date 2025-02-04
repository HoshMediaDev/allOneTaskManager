-- Create function to set user email in a secure way
CREATE OR REPLACE FUNCTION set_user_email(email text)
RETURNS void AS $$
BEGIN
  -- Set the user email in the current session
  PERFORM set_config('app.current_user_email', email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies with more permissive checks for comments
CREATE POLICY "Allow all comment access"
  ON comments
  FOR ALL
  USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS comments_task_id_created_idx ON comments(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);

-- Add comments
COMMENT ON FUNCTION set_user_email IS 'Sets the current user email for RLS policies';
COMMENT ON TABLE comments IS 'Task comments with unrestricted access';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';