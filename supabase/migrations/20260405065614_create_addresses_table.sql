/*
  # Create Addresses Table

  1. New Tables
    - `addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `label` (text) - e.g., "Home", "Work", "Other"
      - `address_line1` (text)
      - `address_line2` (text)
      - `landmark` (text)
      - `city` (text)
      - `state` (text)
      - `pincode` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `addresses` table
    - Add policy for users to view their own addresses
    - Add policy for users to add addresses
    - Add policy for users to update their own addresses
    - Add policy for users to delete their own addresses
*/

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  address_line1 text NOT NULL,
  address_line2 text,
  landmark text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
