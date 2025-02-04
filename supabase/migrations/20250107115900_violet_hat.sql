-- Rename content_text to content
ALTER TABLE tasks 
RENAME COLUMN content_text TO content;

-- Ensure content has proper default
ALTER TABLE tasks 
ALTER COLUMN content SET DEFAULT '';

-- Recreate index for content search
DROP INDEX IF EXISTS tasks_content_text_idx;
CREATE INDEX tasks_content_idx ON tasks USING gin(to_tsvector('english', content));

-- Notify pgREST to reload schema
NOTIFY pgrst, 'reload schema';