/*
  # Add Private Boards Support

  1. New Columns
    - Add is_private and user_email columns to boards and lists tables
    - Create indexes for efficient querying
  
  2. Security
    - Add comments for documentation
*/

-- Add columns to boards table
ALTER TABLE boards
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_email text;

-- Add columns to lists table
ALTER TABLE lists
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_email text;

-- Create indexes for boards
CREATE INDEX IF NOT EXISTS boards_is_private_idx ON boards(is_private);
CREATE INDEX IF NOT EXISTS boards_user_email_idx ON boards(user_email);
CREATE INDEX IF NOT EXISTS boards_is_private_user_email_idx ON boards(is_private, user_email);

-- Create indexes for lists
CREATE INDEX IF NOT EXISTS lists_is_private_idx ON lists(is_private);
CREATE INDEX IF NOT EXISTS lists_user_email_idx ON lists(user_email);
CREATE INDEX IF NOT EXISTS lists_is_private_user_email_idx ON lists(is_private, user_email);

-- Add comments
COMMENT ON COLUMN boards.is_private IS 'Indicates if board is private (visible only to owner)';
COMMENT ON COLUMN boards.user_email IS 'Email of the user who owns the private board';
COMMENT ON COLUMN lists.is_private IS 'Indicates if list is private (visible only to owner)';
COMMENT ON COLUMN lists.user_email IS 'Email of the user who owns the private list';