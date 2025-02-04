/*
  # Task Details Schema Update

  1. Changes
    - Add content and metadata columns directly to tasks table
    - Remove task_details table as it's redundant
    - Add indexes for better query performance

  2. Data Migration
    - Migrate any existing task_details data to tasks table
    - Clean up old table
*/

-- Add new columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS content_details text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Migrate data if task_details table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_details') THEN
    -- Migrate content and metadata
    UPDATE tasks t
    SET 
      content_details = td.content,
      metadata = td.metadata
    FROM task_details td
    WHERE t.id = td.task_id;

    -- Drop the old table
    DROP TABLE task_details;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_metadata_gin_idx ON tasks USING gin(metadata);