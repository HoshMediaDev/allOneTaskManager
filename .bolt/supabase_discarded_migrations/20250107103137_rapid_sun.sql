/*
  # Set up private boards

  1. Changes
    - Add private board support to boards table
    - Add proper indexes
    - Set up RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for private/public boards
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS boards CASCADE;

-- Create boards table with correct schema
CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location_id text NOT NULL,
  is_private boolean NOT NULL DEFAULT false,
  owner_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_boards_location ON boards(location_id);
CREATE INDEX idx_boards_owner_private ON boards(owner_email, is_private);

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Create policies for board access
CREATE POLICY "Allow read boards" ON boards
FOR SELECT USING (
  location_id = current_setting('app.location_id', true)::text
  AND (
    NOT is_private 
    OR (is_private AND owner_email = current_setting('app.user_email', true)::text)
  )
);

CREATE POLICY "Allow create boards" ON boards
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update own boards" ON boards
FOR UPDATE USING (
  owner_email = current_setting('app.user_email', true)::text
  OR NOT is_private
);

CREATE POLICY "Allow delete own boards" ON boards
FOR DELETE USING (
  owner_email = current_setting('app.user_email', true)::text
  OR NOT is_private
);

-- Create trigger for updated_at
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';