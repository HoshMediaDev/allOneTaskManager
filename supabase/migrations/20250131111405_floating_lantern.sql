-- Remove email column and its unique constraint from team_members
ALTER TABLE team_members 
DROP CONSTRAINT IF EXISTS team_members_email_key,
DROP COLUMN IF EXISTS email;