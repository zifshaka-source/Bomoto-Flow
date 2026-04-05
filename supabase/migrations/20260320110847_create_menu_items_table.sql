/*
  # Create Menu Items Table

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `name` (text) - Food item name
      - `description` (text) - Item description
      - `price` (numeric) - Item price
      - `category` (text) - Category (Appetizers, Main Course, Desserts, Beverages)
      - `image_url` (text) - Food item image URL
      - `is_vegetarian` (boolean) - Whether item is vegetarian
      - `is_spicy` (boolean) - Whether item is spicy
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `menu_items` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(8,2) NOT NULL CHECK (price > 0),
  category text NOT NULL,
  image_url text DEFAULT '',
  is_vegetarian boolean DEFAULT false,
  is_spicy boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert menu items"
  ON menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu items"
  ON menu_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);