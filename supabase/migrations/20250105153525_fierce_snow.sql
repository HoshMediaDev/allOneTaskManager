/*
  # Add content_text column to tasks table

  1. Changes
    - Add content_text column to tasks table
    - Migrate existing content data to content_text
    - Drop old content column
  
  2. Notes
    - Uses safe migration pattern with IF EXISTS checks
    - Preserves existing data
*/

-- Add content_text column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'content_text'
  ) THEN
    ALTER TABLE tasks ADD COLUMN content_text text;

    -- Migrate existing content data if content column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'content'
    ) THEN
      UPDATE tasks SET content_text = content WHERE content IS NOT NULL;
      ALTER TABLE tasks DROP COLUMN content;
    END IF;
  END IF;
END $$;