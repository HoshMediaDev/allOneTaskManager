-- Drop is_private and user_email columns from boards and lists
ALTER TABLE boards
DROP COLUMN IF EXISTS is_private,
DROP COLUMN IF EXISTS user_email;

ALTER TABLE lists
DROP COLUMN IF EXISTS is_private,
DROP COLUMN IF EXISTS user_email;

-- Drop related indexes
DROP INDEX IF EXISTS boards_is_private_idx;
DROP INDEX IF EXISTS boards_user_email_idx;
DROP INDEX IF EXISTS boards_is_private_user_email_idx;
DROP INDEX IF EXISTS lists_is_private_idx;
DROP INDEX IF EXISTS lists_user_email_idx;
DROP INDEX IF EXISTS lists_is_private_user_email_idx;

-- Drop the constraint if it exists
ALTER TABLE boards
DROP CONSTRAINT IF EXISTS boards_private_or_location_check;

-- Make location_id required again
ALTER TABLE boards
ALTER COLUMN location_id SET NOT NULL;

-- Add comments
COMMENT ON TABLE boards IS 'Shared boards visible to all users in a location';
COMMENT ON TABLE lists IS 'Lists within shared boards';