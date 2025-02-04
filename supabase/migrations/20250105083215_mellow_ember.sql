/*
  # Separate Lists and Tasks Schema
  
  1. Changes
    - Remove lists from boards table
    - Create separate tables for lists and tasks
    - Add relationships between boards, lists, and tasks
  
  2. Security
    - Enable RLS
    - Add basic security policies
  
  3. Performance
    - Add indexes for common queries
*/

-- Drop existing tasks table if it exists
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS lists;

-- Remove lists column from boards
ALTER TABLE boards DROP COLUMN IF EXISTS lists;

-- Create lists table
CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
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
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Allow all lists access" ON lists FOR ALL USING (true);
CREATE POLICY "Allow all tasks access" ON tasks FOR ALL USING (true);

-- Create indexes
CREATE INDEX lists_board_id_idx ON lists(board_id);
CREATE INDEX tasks_list_id_idx ON tasks(list_id);
CREATE INDEX lists_position_idx ON lists(position);
CREATE INDEX tasks_position_idx ON tasks(position);

-- Add triggers for updated_at
CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();