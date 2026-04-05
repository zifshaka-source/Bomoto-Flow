/*
  # Update Orders Table

  1. Changes
    - Add `user_id` column to link orders to users
    - Add `address_id` column to reference saved addresses
    - Add `offer_id` column to track applied offers
    - Add `discount_amount` column
    - Add `delivery_instructions` column
    - Add `estimated_delivery_time` column
    - Add `actual_delivery_time` column
    - Update order_status to include more states
  
  2. Security
    - Add policy for users to view their own orders
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'address_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN address_id uuid REFERENCES addresses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'offer_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN offer_id uuid REFERENCES offers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_instructions'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_instructions text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'estimated_delivery_time'
  ) THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery_time timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'actual_delivery_time'
  ) THEN
    ALTER TABLE orders ADD COLUMN actual_delivery_time timestamptz;
  END IF;
END $$;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
