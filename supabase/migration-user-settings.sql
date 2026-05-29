-- ==============================================================
-- MIGRATION: Add missing columns to user_settings table
-- Run this in Supabase SQL Editor
-- ==============================================================

-- Add promo_notifications column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'promo_notifications'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN promo_notifications BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add chat_notifications column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'chat_notifications'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN chat_notifications BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add price_drop_notifications column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'price_drop_notifications'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN price_drop_notifications BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;
