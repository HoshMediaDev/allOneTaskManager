-- Ensure content_text column exists and handle data migration
DO $$ 
BEGIN
  -- First check if content_text column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'content_text'
  ) THEN
    -- Add content_text column
    ALTER TABLE tasks ADD COLUMN content_text text;

    -- Migrate data from content column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'content'
    ) THEN
      UPDATE tasks SET content_text = content WHERE content IS NOT NULL;
      ALTER TABLE tasks DROP COLUMN IF EXISTS content;
    END IF;
  END IF;

  -- Drop other unused columns if they exist
  ALTER TABLE tasks DROP COLUMN IF EXISTS content_details;
  ALTER TABLE tasks DROP COLUMN IF EXISTS content_type;

  -- Recreate index for content search
  DROP INDEX IF EXISTS tasks_content_text_idx;
  CREATE INDEX tasks_content_text_idx ON tasks USING gin(to_tsvector('english', coalesce(content_text, '')));

  -- Refresh the schema cache
  NOTIFY pgrst, 'reload schema';
END $$;