-- Drop any existing columns to ensure clean state
ALTER TABLE boards 
DROP COLUMN IF EXISTS is_private CASCADE,
DROP COLUMN IF EXISTS owner_email CASCADE;

-- Add columns with proper constraints
ALTER TABLE boards 
ADD COLUMN is_private boolean NOT NULL DEFAULT false,
ADD COLUMN owner_email text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_boards_owner_private 
ON boards(owner_email, is_private);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read boards by location_id" ON boards;
DROP POLICY IF EXISTS "Allow all boards access" ON boards;

-- Create new policies
CREATE POLICY "Allow read boards" ON boards
FOR SELECT USING (
  location_id = current_setting('app.location_id', true)::text
  AND (
    NOT is_private 
    OR (
      is_private AND owner_email = current_setting('app.user_email', true)::text
    )
  )
);

CREATE POLICY "Allow create boards" ON boards
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update own boards" ON boards
FOR UPDATE USING (
  owner_email = current_setting('app.user_email', true)::text
  OR NOT is_private
);

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';