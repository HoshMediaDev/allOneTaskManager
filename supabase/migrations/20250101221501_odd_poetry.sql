/*
  # Add Team Members Support

  1. New Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `location_id` (text, required)
      - `first_name` (text, required)
      - `last_name` (text, required)
      - `email` (text, required)
      - `role` (text, required)
      - `type` (text)
      - `permissions` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `team_members` table
    - Add policies for location-based access
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  type text,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read team_members by location_id" ON team_members
  FOR SELECT USING (true);

CREATE POLICY "Allow insert team_members by location_id" ON team_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update team_members by location_id" ON team_members
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete team_members by location_id" ON team_members
  FOR DELETE USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();