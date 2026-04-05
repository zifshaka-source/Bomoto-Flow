/*
  # Create Offers Table

  1. New Tables
    - `offers`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `code` (text, unique)
      - `discount_type` (text) - "percentage" or "fixed"
      - `discount_value` (numeric)
      - `min_order_value` (numeric)
      - `max_discount` (numeric)
      - `valid_from` (timestamptz)
      - `valid_until` (timestamptz)
      - `is_active` (boolean)
      - `usage_limit` (integer)
      - `usage_count` (integer)
      - `restaurant_id` (uuid, references restaurants) - null means applicable to all
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `offers` table
    - Add policy for anyone to view active offers
*/

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_value numeric DEFAULT 0,
  max_discount numeric,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offers"
  ON offers FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_until > now());

CREATE INDEX IF NOT EXISTS idx_offers_code ON offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_restaurant_id ON offers(restaurant_id);
