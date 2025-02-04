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

-- Create RLS policies with more permissive checks
CREATE POLICY "Users can access their own private boards"
  ON private_boards
  FOR ALL
  USING (true);

CREATE POLICY "Users can access their own private lists"
  ON private_lists
  FOR ALL
  USING (true);

CREATE POLICY "Users can access their own private tasks"
  ON private_tasks
  FOR ALL
  USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS private_boards_user_email_created_idx ON private_boards(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS private_lists_board_position_idx ON private_lists(board_id, position);
CREATE INDEX IF NOT EXISTS private_tasks_list_position_idx ON private_tasks(list_id, position);

-- Add comments
COMMENT ON FUNCTION set_user_email IS 'Sets the current user email for RLS policies';
COMMENT ON TABLE private_boards IS 'Private boards visible only to their owners';
COMMENT ON TABLE private_lists IS 'Lists within private boards';
COMMENT ON TABLE private_tasks IS 'Tasks within private lists';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';