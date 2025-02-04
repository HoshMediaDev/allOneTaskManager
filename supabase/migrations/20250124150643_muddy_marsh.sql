/*
  # Add contacts table and sync functionality

  1. New Tables
    - contacts: Store GHL contacts locally
      - id (uuid, primary key)
      - ghl_id (text, unique) - GHL contact ID
      - first_name (text)
      - last_name (text)
      - email (text)
      - phone (text)
      - tags (jsonb)
      - custom_fields (jsonb)
      - metadata (jsonb)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for access control
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_id text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  tags jsonb DEFAULT '[]'::jsonb,
  custom_fields jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all contacts access" ON contacts FOR ALL USING (true);

-- Create indexes
CREATE INDEX contacts_ghl_id_idx ON contacts(ghl_id);
CREATE INDEX contacts_email_idx ON contacts(email);
CREATE INDEX contacts_tags_gin_idx ON contacts USING gin(tags);

-- Add trigger for updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();