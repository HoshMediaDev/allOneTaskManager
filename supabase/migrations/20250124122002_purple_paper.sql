/*
  # Add Time Tracking Columns

  1. Changes
    - Add actual_time column for tracking time spent on tasks
    - Add estimated_time column for planned time
    - Add time_tracking_metadata for additional tracking data
  
  2. Indexes
    - Add indexes for efficient querying of time-related columns
*/

-- Add time tracking columns if they don't exist
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS actual_time integer,
ADD COLUMN IF NOT EXISTS estimated_time integer,
ADD COLUMN IF NOT EXISTS time_tracking_metadata jsonb DEFAULT '{}'::jsonb;

-- Create indexes for time tracking columns
CREATE INDEX IF NOT EXISTS tasks_actual_time_idx ON tasks(actual_time);
CREATE INDEX IF NOT EXISTS tasks_estimated_time_idx ON tasks(estimated_time);

-- Add comments for documentation
COMMENT ON COLUMN tasks.actual_time IS 'Actual time spent on task in minutes';
COMMENT ON COLUMN tasks.estimated_time IS 'Estimated time for task in minutes';
COMMENT ON COLUMN tasks.time_tracking_metadata IS 'Additional time tracking metadata like start/pause timestamps';