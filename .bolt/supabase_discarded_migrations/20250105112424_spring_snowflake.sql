/*
  # Fix Task Content Storage - Final Migration

  1. Changes
    - Ensure content_text column exists
    - Clean up any duplicate/old columns
    - Add proper indexes
    
  2. Security
    - Maintain RLS policies
*/

-- Ensure content_text column exists and migrate data
DO $$ 
BEGIN
  -- First ensure we have the content_text column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'content_text'
  ) THEN
    ALTER TABLE tasks ADD COLUMN content_text text;
  END IF;

  -- Migrate any existing content data
  UPDATE tasks 
  SET content_text = content 
  WHERE content IS NOT NULL AND content_text IS NULL;
END $$;

-- Drop old columns if they exist
ALTER TABLE tasks 
  DROP COLUMN IF EXISTS content CASCADE,
  DROP COLUMN IF EXISTS content_details CASCADE;

-- Recreate index for content search
DROP INDEX IF EXISTS tasks_content_text_idx;
CREATE INDEX tasks_content_text_idx ON tasks USING gin(to_tsvector('english', content_text));