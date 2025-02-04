-- Create private_comments table
CREATE TABLE private_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES private_tasks(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE private_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their own private comments"
  ON private_comments
  FOR ALL
  USING (
    task_id IN (
      SELECT t.id FROM private_tasks t
      JOIN private_lists l ON t.list_id = l.id
      JOIN private_boards b ON l.board_id = b.id
      WHERE b.user_email = current_setting('app.current_user_email', true)
    )
  );

-- Create indexes
CREATE INDEX private_comments_task_id_idx ON private_comments(task_id);
CREATE INDEX private_comments_user_id_idx ON private_comments(user_id);
CREATE INDEX private_comments_created_at_idx ON private_comments(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_private_comments_updated_at
  BEFORE UPDATE ON private_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE private_comments IS 'Comments for private tasks';