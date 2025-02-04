-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can access their own private boards" ON private_boards;
DROP POLICY IF EXISTS "Users can access their own private lists" ON private_lists;
DROP POLICY IF EXISTS "Users can access their own private tasks" ON private_tasks;

-- Create function to set user email in a secure way
CREATE OR REPLACE FUNCTION set_user_email(email text)
RETURNS void AS $$
BEGIN
  -- Set the user email in the current session
  PERFORM set_config('app.current_user_email', email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new RLS policies using app.current_user_email setting
CREATE POLICY "Users can access their own private boards"
  ON private_boards
  FOR ALL
  USING (
    user_email = COALESCE(current_setting('app.current_user_email', true), user_email)
  );

CREATE POLICY "Users can access their own private lists"
  ON private_lists
  FOR ALL
  USING (
    user_email = COALESCE(current_setting('app.current_user_email', true), user_email)
  );

CREATE POLICY "Users can access their own private tasks"
  ON private_tasks
  FOR ALL
  USING (
    user_email = COALESCE(current_setting('app.current_user_email', true), user_email)
  );

-- Add comments
COMMENT ON FUNCTION set_user_email IS 'Sets the current user email for RLS policies';