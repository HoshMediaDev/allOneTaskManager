-- Ensure proper board schema with required columns
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS owner_email text,
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_boards_owner_private 
ON boards(owner_email, is_private);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow read boards by location_id" ON boards;
CREATE POLICY "Allow read boards by location_id" ON boards
  FOR SELECT USING (true);

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';