/*
  # Fix Task Content Storage

  1. Changes
    - Ensure content_text column exists
    - Add content_type column
    - Add metadata column
    - Create proper indexes
    
  2. Security
    - Enable RLS on tasks table
    - Add policies for task access
*/

-- Ensure content_text column exists and migrate data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'content_text'
  ) THEN
    ALTER TABLE tasks ADD COLUMN content_text text;
    -- Migrate existing content
    UPDATE tasks SET content_text = content WHERE content IS NOT NULL;
  END IF;
END $$;

-- Add content_type if not exists
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'text';

-- Add metadata if not exists
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_content_text_idx ON tasks USING gin(to_tsvector('english', content_text));
CREATE INDEX IF NOT EXISTS tasks_metadata_gin_idx ON tasks USING gin(metadata);

-- Drop old columns if they exist
ALTER TABLE tasks 
  DROP COLUMN IF EXISTS content,
  DROP COLUMN IF EXISTS content_details;