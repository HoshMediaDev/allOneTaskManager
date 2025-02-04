-- Drop existing private tables to ensure clean state
DROP TABLE IF EXISTS private_tasks CASCADE;
DROP TABLE IF EXISTS private_lists CASCADE;
DROP TABLE IF EXISTS private_boards CASCADE;

-- Create private_boards table
CREATE TABLE private_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create private_lists table
CREATE TABLE private_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES private_boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create private_tasks table
CREATE TABLE private_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES private_lists(id) ON DELETE CASCADE,
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
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE private_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX private_boards_user_email_idx ON private_boards(user_email);
CREATE INDEX private_lists_board_id_idx ON private_lists(board_id);
CREATE INDEX private_lists_user_email_idx ON private_lists(user_email);
CREATE INDEX private_tasks_list_id_idx ON private_tasks(list_id);
CREATE INDEX private_tasks_user_email_idx ON private_tasks(user_email);
CREATE INDEX private_lists_position_idx ON private_lists(position);
CREATE INDEX private_tasks_position_idx ON private_tasks(position);

-- Create function to set user email in a secure way
CREATE OR REPLACE FUNCTION set_user_email(email text)
RETURNS void AS $$
BEGIN
  -- Set the user email in the current session
  PERFORM set_config('app.current_user_email', email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies
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
COMMENT ON TABLE private_boards IS 'Private boards visible only to their owners';
COMMENT ON TABLE private_lists IS 'Lists within private boards';
COMMENT ON TABLE private_tasks IS 'Tasks within private lists';