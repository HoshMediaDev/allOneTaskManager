/*
  # Task Details Enhancement

  1. New Tables
    - task_details: Stores additional task information
      - id (uuid, primary key)
      - task_id (uuid, references tasks)
      - content (text)
      - metadata (jsonb)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on task_details table
    - Add policies for task_details access
*/

-- Create task_details table
CREATE TABLE IF NOT EXISTS task_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  content text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE task_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all task_details access" ON task_details FOR ALL USING (true);

-- Create indexes
CREATE INDEX task_details_task_id_idx ON task_details(task_id);

-- Add trigger for updated_at
CREATE TRIGGER update_task_details_updated_at
  BEFORE UPDATE ON task_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();