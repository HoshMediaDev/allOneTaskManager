-- Create function to set user email
CREATE OR REPLACE FUNCTION set_user_email(email text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('user.email', email, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use the new function
DROP POLICY IF EXISTS "Users can access their own private boards" ON private_boards;
DROP POLICY IF EXISTS "Users can access their own private lists" ON private_lists;
DROP POLICY IF EXISTS "Users can access their own private tasks" ON private_tasks;

CREATE POLICY "Users can access their own private boards"
  ON private_boards
  FOR ALL
  USING (user_email = current_setting('user.email', true));

CREATE POLICY "Users can access their own private lists"
  ON private_lists
  FOR ALL
  USING (user_email = current_setting('user.email', true));

CREATE POLICY "Users can access their own private tasks"
  ON private_tasks
  FOR ALL
  USING (user_email = current_setting('user.email', true));

-- Add comments
COMMENT ON FUNCTION set_user_email IS 'Sets the user email for RLS policies';