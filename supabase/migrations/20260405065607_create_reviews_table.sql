/*
  # Create Reviews Table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `restaurant_id` (uuid, references restaurants)
      - `order_id` (uuid, references orders)
      - `rating` (integer, 1-5)
      - `review_text` (text)
      - `food_rating` (integer, 1-5)
      - `delivery_rating` (integer, 1-5)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `reviews` table
    - Add policy for anyone to view reviews
    - Add policy for authenticated users to add reviews
    - Add policy for users to update their own reviews
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  food_rating integer CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating integer CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, order_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can add reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
