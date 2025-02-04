-- Create function to set user email in a secure way
CREATE OR REPLACE FUNCTION set_user_email(email text)
RETURNS void AS $$
BEGIN
  -- Set the user email in the current session
  PERFORM set_config('app.user_email', email, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can access their own private boards" ON private_boards;
DROP POLICY IF EXISTS "Users can access their own private lists" ON private_lists;
DROP POLICY IF EXISTS "Users can access their own private tasks" ON private_tasks;

-- Create new RLS policies using app.user_email setting
CREATE POLICY "Users can access their own private boards"
  ON private_boards
  FOR ALL
  USING (user_email = current_setting('app.user_email', true));

CREATE POLICY "Users can access their own private lists"
  ON private_lists
  FOR ALL
  USING (user_email = current_setting('app.user_email', true));

CREATE POLICY "Users can access their own private tasks"
  ON private_tasks
  FOR ALL
  USING (user_email = current_setting('app.user_email', true));

-- Add comments
COMMENT ON FUNCTION set_user_email IS 'Sets the user email for RLS policies';
COMMENT ON TABLE private_boards IS 'Private boards visible only to their owners';
COMMENT ON TABLE private_lists IS 'Lists within private boards';
COMMENT ON TABLE private_tasks IS 'Tasks within private lists';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';