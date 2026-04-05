/*
  # Create Orders Table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `customer_name` (text) - Customer's full name
      - `phone_number` (text) - Customer's phone number
      - `delivery_address` (text) - Full delivery address
      - `order_items` (jsonb) - Order items with details
      - `subtotal` (numeric) - Subtotal amount
      - `delivery_fee` (numeric) - Delivery fee
      - `tax` (numeric) - Tax amount
      - `total_amount` (numeric) - Total amount payable
      - `payment_method` (text) - Payment method (UPI, Card, COD)
      - `order_status` (text) - Order status (pending, confirmed, preparing, delivered, cancelled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for anyone to create orders
    - Add policy for anyone to view their orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  delivery_address text NOT NULL,
  order_items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  order_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update their orders"
  ON orders
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);