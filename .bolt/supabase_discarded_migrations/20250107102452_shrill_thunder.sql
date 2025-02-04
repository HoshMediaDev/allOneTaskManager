-- Drop existing policies
DROP POLICY IF EXISTS "Allow all board operations" ON boards;
DROP POLICY IF EXISTS "Allow read boards by location_id" ON boards;

-- Ensure columns exist with proper types
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_email text;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_boards_owner_private 
ON boards(owner_email, is_private);

-- Create new policy for all operations
CREATE POLICY "Allow all board operations" ON boards
FOR ALL USING (true)
WITH CHECK (true);

-- Refresh schema cache
ALTER TABLE boards REPLICA IDENTITY FULL;
NOTIFY pgrst, 'reload schema';