-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can access comments on their private tasks" ON private_comments;

-- Create new RLS policy that properly checks task ownership
CREATE POLICY "Users can access private comments"
  ON private_comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM private_tasks t
      JOIN private_lists l ON t.list_id = l.id
      JOIN private_boards b ON l.board_id = b.id
      WHERE t.id = private_comments.task_id
      AND b.user_email = COALESCE(current_setting('app.current_user_email', true), b.user_email)
    )
  );

-- Add comments
COMMENT ON POLICY "Users can access private comments" ON private_comments 
IS 'Allows users to access comments on tasks in their private boards';

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';