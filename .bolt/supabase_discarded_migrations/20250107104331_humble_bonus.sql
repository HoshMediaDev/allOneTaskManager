-- Drop old content-related columns if they exist
ALTER TABLE tasks 
DROP COLUMN IF EXISTS content_text,
DROP COLUMN IF EXISTS content_type,
DROP COLUMN IF EXISTS content_details,
DROP COLUMN IF EXISTS metadata;

-- Add content column with proper default
ALTER TABLE tasks
ADD COLUMN content text NOT NULL DEFAULT '';

-- Create index for content search
CREATE INDEX IF NOT EXISTS tasks_content_idx ON tasks USING gin(to_tsvector('english', content));

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';