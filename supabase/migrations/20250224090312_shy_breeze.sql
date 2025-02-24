/*
  # Fresh Start - Widget Settings Schema

  1. New Tables
    - `widget_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `primary_color` (text)
      - `business_name` (text)
      - `business_info` (text)
      - `sales_rep_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `widget_settings` table
    - Add policies for authenticated users to:
      - Read their own settings
      - Create their own settings
      - Update their own settings
    
  3. Features
    - Automatic updated_at timestamp
    - Unique constraint on user_id
    - Default values for all columns
*/

-- Drop existing table and related objects
DROP TABLE IF EXISTS widget_settings CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_widget_settings_updated_at
  BEFORE UPDATE ON widget_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
DO $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'widget_settings'
  ) THEN
    RAISE EXCEPTION 'Table widget_settings was not created properly';
  END IF;

  -- Check if RLS is enabled
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'widget_settings'
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on widget_settings';
  END IF;
END $$;