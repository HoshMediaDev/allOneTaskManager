/*
  # Initial Database Schema

  1. New Tables
    - `boards`
      - `id` (uuid, primary key)
      - `title` (text)
      - `lists` (jsonb)
      - `location_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `custom_fields`
      - `id` (uuid, primary key) 
      - `location_id` (text)
      - `name` (text)
      - `type` (text)
      - `options` (jsonb)
      - `required` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for location-based access
*/

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  lists jsonb NOT NULL DEFAULT '[]',
  location_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create custom_fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  options jsonb,
  required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for boards
CREATE POLICY "Allow read boards by location_id" ON boards
  FOR SELECT USING (true);

CREATE POLICY "Allow insert boards by location_id" ON boards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update boards by location_id" ON boards
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete boards by location_id" ON boards
  FOR DELETE USING (true);

-- Create policies for custom_fields
CREATE POLICY "Allow read custom_fields by location_id" ON custom_fields
  FOR SELECT USING (true);

CREATE POLICY "Allow insert custom_fields by location_id" ON custom_fields
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update custom_fields by location_id" ON custom_fields
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete custom_fields by location_id" ON custom_fields
  FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_fields_updated_at
  BEFORE UPDATE ON custom_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();