/*
  # API Tasks Database Schema

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `created_at` (timestamp)
      
    - `tasks`
      - `id` (uuid, primary key) 
      - `api_key_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for API key-based access
*/

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'todo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read tasks by API key" ON tasks
  FOR SELECT USING (
    api_key_id IN (
      SELECT id FROM api_keys 
      WHERE key = current_setting('app.api_key', true)
    )
  );

CREATE POLICY "Allow insert tasks by API key" ON tasks
  FOR INSERT WITH CHECK (
    api_key_id IN (
      SELECT id FROM api_keys 
      WHERE key = current_setting('app.api_key', true)
    )
  );

CREATE POLICY "Allow update tasks by API key" ON tasks
  FOR UPDATE USING (
    api_key_id IN (
      SELECT id FROM api_keys 
      WHERE key = current_setting('app.api_key', true)
    )
  );

-- Create function to set updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();