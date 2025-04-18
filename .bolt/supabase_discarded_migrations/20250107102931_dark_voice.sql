/*
  # Fix boards table and policies

  1. Changes
    - Recreate boards table with correct schema
    - Add proper indexes
    - Set up RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for all operations
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

-- Create policy for all operations
CREATE POLICY "Allow all board operations" ON boards
FOR ALL USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';