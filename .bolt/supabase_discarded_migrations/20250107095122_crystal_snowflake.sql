-- Add private board support
ALTER TABLE boards
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_email text;

-- Create index for faster private board queries
CREATE INDEX IF NOT EXISTS idx_boards_private_owner 
ON boards(is_private, owner_email);

-- Update RLS policies to handle private boards
DROP POLICY IF EXISTS "Allow read boards by location_id" ON boards;
CREATE POLICY "Allow read boards by location_id" ON boards
  FOR SELECT USING (
    location_id = current_setting('app.location_id', true)::text
    AND (
      NOT is_private 
      OR (is_private AND owner_email = current_setting('app.user_email', true)::text)
    )
  );

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';