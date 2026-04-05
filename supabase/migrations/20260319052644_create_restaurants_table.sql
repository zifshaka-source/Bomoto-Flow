/*
  # Create Restaurants Table

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text) - Restaurant name
      - `image_url` (text) - Restaurant exterior/interior image URL
      - `rating` (numeric) - Rating out of 5
      - `price_level` (integer) - Price level 1-4 ($ to $$$$)
      - `cuisine_tags` (text[]) - Array of cuisine type tags
      - `description` (text) - Brief description
      - `delivery_time` (text) - Estimated delivery time
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `restaurants` table
    - Add policy for public read access (anyone can view restaurants)
    - Add policy for authenticated users to insert/update (for future admin features)
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  price_level integer DEFAULT 2 CHECK (price_level >= 1 AND price_level <= 4),
  cuisine_tags text[] DEFAULT '{}',
  description text DEFAULT '',
  delivery_time text DEFAULT '30-45 min',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurants"
  ON restaurants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);