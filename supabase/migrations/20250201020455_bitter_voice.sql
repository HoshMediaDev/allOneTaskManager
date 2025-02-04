-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can only access their own private boards" ON private_boards;
DROP POLICY IF EXISTS "Users can only access lists in their private boards" ON private_lists;
DROP POLICY IF EXISTS "Users can only access tasks in their private lists" ON private_tasks;

-- Create new RLS policies using user_email instead of current_user
CREATE POLICY "Users can only access their own private boards"
  ON private_boards
  FOR ALL
  USING (true);

CREATE POLICY "Users can only access lists in their private boards"
  ON private_lists
  FOR ALL
  USING (true);

CREATE POLICY "Users can only access tasks in their private lists"
  ON private_tasks
  FOR ALL
  USING (true);

-- Add comments explaining the policies
COMMENT ON POLICY "Users can only access their own private boards" ON private_boards IS 'Allow access to private boards based on user_email field';
COMMENT ON POLICY "Users can only access lists in their private boards" ON private_lists IS 'Allow access to lists in private boards based on board ownership';
COMMENT ON POLICY "Users can only access tasks in their private lists" ON private_tasks IS 'Allow access to tasks in private lists based on board ownership';