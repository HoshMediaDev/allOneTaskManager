-- Drop and recreate tasks table with correct schema
DROP TABLE IF EXISTS tasks CASCADE;

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text NOT NULL DEFAULT '', -- Changed from content_text to content
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  labels jsonb DEFAULT '[]'::jsonb,
  assignees jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  custom_field_values jsonb DEFAULT '[]'::jsonb,
  checklist jsonb DEFAULT '[]'::jsonb,
  due_date timestamptz,
  start_date timestamptz,
  estimated_time integer,
  actual_time integer,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_list FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX tasks_list_id_idx ON tasks(list_id);
CREATE INDEX tasks_position_idx ON tasks(position);
CREATE INDEX tasks_content_idx ON tasks USING gin(to_tsvector('english', content));

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create basic policies
DROP POLICY IF EXISTS "Allow all tasks access" ON tasks;
CREATE POLICY "Allow all tasks access" ON tasks FOR ALL USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';