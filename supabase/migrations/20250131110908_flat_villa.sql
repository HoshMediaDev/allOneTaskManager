-- Add unique constraint on team_members email
ALTER TABLE team_members
ADD CONSTRAINT team_members_email_key UNIQUE (email);

-- Add api_key to contacts with default value
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS api_key text DEFAULT 'default' NOT NULL;