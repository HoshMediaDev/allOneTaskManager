-- Add owner_email and is_private columns to boards table
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS owner_email text,
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_boards_owner_private 
ON boards(owner_email, is_private);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow read boards by location_id" ON boards;
CREATE POLICY "Allow read boards by location_id" ON boards
  FOR SELECT USING (true);

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';