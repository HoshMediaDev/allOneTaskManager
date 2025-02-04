-- Create private_boards table
CREATE TABLE IF NOT EXISTS private_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create private_lists table
CREATE TABLE IF NOT EXISTS private_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES private_boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create private_tasks table
CREATE TABLE IF NOT EXISTS private_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES private_lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text DEFAULT '',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  labels jsonb DEFAULT '[]'::jsonb,
  assignees jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  custom_field_values jsonb DEFAULT '[]'::jsonb,
  checklist jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  due_date timestamptz,
  start_date timestamptz,
  estimated_time integer,
  actual_time integer,
  position integer NOT NULL DEFAULT 0,
  status text DEFAULT 'incompleted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE private_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own private boards"
  ON private_boards
  FOR ALL
  USING (user_email = current_user);

CREATE POLICY "Users can only access lists in their private boards"
  ON private_lists
  FOR ALL
  USING (
    board_id IN (
      SELECT id FROM private_boards 
      WHERE user_email = current_user
    )
  );

CREATE POLICY "Users can only access tasks in their private lists"
  ON private_tasks
  FOR ALL
  USING (
    list_id IN (
      SELECT l.id FROM private_lists l
      JOIN private_boards b ON l.board_id = b.id
      WHERE b.user_email = current_user
    )
  );

-- Create indexes
CREATE INDEX private_boards_user_email_idx ON private_boards(user_email);
CREATE INDEX private_lists_board_id_idx ON private_lists(board_id);
CREATE INDEX private_tasks_list_id_idx ON private_tasks(list_id);
CREATE INDEX private_lists_position_idx ON private_lists(position);
CREATE INDEX private_tasks_position_idx ON private_tasks(position);

-- Add updated_at triggers
CREATE TRIGGER update_private_boards_updated_at
  BEFORE UPDATE ON private_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_lists_updated_at
  BEFORE UPDATE ON private_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_tasks_updated_at
  BEFORE UPDATE ON private_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE private_boards IS 'Private boards visible only to their owners';
COMMENT ON TABLE private_lists IS 'Lists within private boards';
COMMENT ON TABLE private_tasks IS 'Tasks within private lists';