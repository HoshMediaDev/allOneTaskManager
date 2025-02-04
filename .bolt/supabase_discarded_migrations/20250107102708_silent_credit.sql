-- Drop existing policies
DROP POLICY IF EXISTS "Allow all board operations" ON boards;
DROP POLICY IF EXISTS "Allow read boards by location_id" ON boards;

-- Recreate boards table with correct schema
CREATE TABLE IF NOT EXISTS boards_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location_id text NOT NULL,
  is_private boolean NOT NULL DEFAULT false,
  owner_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data if old table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'boards') THEN
    INSERT INTO boards_new (id, title, location_id, created_at, updated_at)
    SELECT id, title, location_id, created_at, updated_at
    FROM boards;
    
    DROP TABLE boards CASCADE;
  END IF;
END $$;

-- Rename new table to boards
ALTER TABLE boards_new RENAME TO boards;

-- Create indexes
CREATE INDEX idx_boards_location ON boards(location_id);
CREATE INDEX idx_boards_owner_private ON boards(owner_email, is_private);

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all board operations" ON boards
FOR ALL USING (true)
WITH CHECK (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';