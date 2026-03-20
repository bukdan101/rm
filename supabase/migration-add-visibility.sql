-- Migration: Add visibility column to car_listings table
-- This allows listings to be visible in multiple marketplaces

-- Add visibility column if it doesn't exist
ALTER TABLE car_listings 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' 
CHECK (visibility IN ('public', 'dealer_marketplace', 'both'));

-- Update existing records to set visibility based on marketplace_type
UPDATE car_listings 
SET visibility = CASE 
  WHEN marketplace_type = 'dealer_marketplace' THEN 'dealer_marketplace'
  WHEN marketplace_type = 'marketplace_umum' THEN 'public'
  ELSE 'public'
END
WHERE visibility IS NULL OR visibility = 'public';

-- Create index for faster visibility queries
CREATE INDEX IF NOT EXISTS idx_car_listings_visibility ON car_listings(visibility);

-- Comment
COMMENT ON COLUMN car_listings.visibility IS 'Visibility settings: public, dealer_marketplace, or both';
