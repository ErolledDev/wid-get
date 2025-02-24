/*
  # Fix Widget Settings Table

  1. Changes
    - Drop and recreate widget_settings table to match application code
    - Add proper constraints and defaults
    - Enable RLS with correct policies
    - Add updated_at trigger

  2. Structure
    - Basic settings columns (primary_color, business_name, etc.)
    - Proper constraints and defaults
    - RLS policies for user data protection
    - Automatic updated_at timestamp updates

  3. Security
    - Enable RLS
    - Policies for authenticated users
    - User can only access their own data
*/

-- Start fresh with a new table
DROP TABLE IF EXISTS widget_settings;

-- Create the widget_settings table
CREATE TABLE widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  primary_color text DEFAULT '#2563eb',
  business_name text DEFAULT '',
  business_info text DEFAULT '',
  sales_rep_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT widget_settings_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own settings"
  ON widget_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON widget_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON widget_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_widget_settings_updated_at ON widget_settings;
CREATE TRIGGER update_widget_settings_updated_at
  BEFORE UPDATE ON widget_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();