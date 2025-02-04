/*
  # Add contact_id and GHL integration columns

  1. Changes
    - Add contact_id column to tasks table
    - Add ghl_task_id column if not exists
    - Add metadata column for sync status
    - Create indexes for new columns

  2. Purpose
    - Enable GHL task integration
    - Store contact association
    - Track sync status with GHL
*/

-- Add new columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS contact_id text,
ADD COLUMN IF NOT EXISTS ghl_task_id text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS tasks_contact_id_idx ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS tasks_ghl_task_id_idx ON tasks(ghl_task_id);
CREATE INDEX IF NOT EXISTS tasks_metadata_gin_idx ON tasks USING gin(metadata);

-- Add comments
COMMENT ON COLUMN tasks.contact_id IS 'GHL contact ID associated with this task';
COMMENT ON COLUMN tasks.ghl_task_id IS 'GHL task ID for sync purposes';
COMMENT ON COLUMN tasks.metadata IS 'Additional metadata including GHL sync status';