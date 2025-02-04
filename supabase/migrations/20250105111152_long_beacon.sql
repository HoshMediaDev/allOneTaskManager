/*
  # Fix Task Content Storage

  1. Changes
    - Remove content_details column
    - Rename content column to content_text
    - Add content_type column for future extensibility
    
  2. Data Migration
    - Preserve existing content data
    - Set default content type
*/

-- Rename content to content_text and add content_type
ALTER TABLE tasks 
  RENAME COLUMN content TO content_text;

ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'text';

-- Drop unused columns if they exist
ALTER TABLE tasks 
  DROP COLUMN IF EXISTS content_details;

-- Create index for content search
CREATE INDEX IF NOT EXISTS tasks_content_text_idx ON tasks USING gin(to_tsvector('english', content_text));