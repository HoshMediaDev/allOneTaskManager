-- Add is_default column to lists table if not exists
ALTER TABLE lists 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Create index for is_default column
CREATE INDEX IF NOT EXISTS lists_is_default_idx ON lists(is_default);

-- Add comment explaining is_default column
COMMENT ON COLUMN lists.is_default IS 'Indicates if this is a default list (In Progress, Done, List1) that cannot be modified';