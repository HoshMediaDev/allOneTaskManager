-- Drop existing private board columns if they exist
ALTER TABLE boards 
DROP COLUMN IF EXISTS is_private,
DROP COLUMN IF EXISTS owner_email;

-- Add owner_email column
ALTER TABLE boards
ADD COLUMN owner_email text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_boards_owner 
ON boards(owner_email);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow read boards by location_id" ON boards;
CREATE POLICY "Allow read boards by location_id" ON boards
  FOR SELECT USING (true);

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';