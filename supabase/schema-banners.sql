-- Banner Advertisements System
-- Run this in Supabase SQL Editor

-- Drop existing table if exists
DROP TABLE IF EXISTS banners CASCADE;

-- Create banners table
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  position VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'expired')),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  budget_total INTEGER DEFAULT 0,
  budget_spent INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by position
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_status ON banners(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_banners_updated_at 
    BEFORE UPDATE ON banners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default banners for all positions
INSERT INTO banners (title, image_url, target_url, position, status, budget_total) VALUES
-- Homepage
('Homepage Top - Landscape', 'https://picsum.photos/seed/home-top/800/150', '/marketplace', 'home-top', 'active', 1000000),
('Homepage Top - Sidebar', 'https://picsum.photos/seed/home-top-side/400/150', '/marketplace', 'home-top-sidebar', 'active', 500000),
('Homepage Inline - Landscape', 'https://picsum.photos/seed/home-inline/800/150', '/marketplace', 'home-inline', 'active', 1000000),
('Homepage Inline - Sidebar', 'https://picsum.photos/seed/home-inline-side/400/150', '/marketplace', 'home-inline-sidebar', 'active', 500000),

-- Marketplace
('Marketplace Top - Landscape', 'https://picsum.photos/seed/mp-top/800/150', '/marketplace', 'marketplace-top', 'active', 1000000),
('Marketplace Top - Sidebar', 'https://picsum.photos/seed/mp-top-side/400/150', '/marketplace', 'marketplace-top-sidebar', 'active', 500000),
('Marketplace Inline - Landscape', 'https://picsum.photos/seed/mp-inline/800/150', '/marketplace', 'marketplace-inline', 'active', 1000000),
('Marketplace Inline - Sidebar', 'https://picsum.photos/seed/mp-inline-side/400/150', '/marketplace', 'marketplace-inline-sidebar', 'active', 500000),

-- Listing Detail
('Listing Top - Landscape', 'https://picsum.photos/seed/listing-top/800/150', '/marketplace', 'listing-top', 'active', 1000000),
('Listing Top - Sidebar', 'https://picsum.photos/seed/listing-top-side/400/150', '/marketplace', 'listing-top-sidebar', 'active', 500000),
('Listing Bottom - Landscape', 'https://picsum.photos/seed/listing-bottom/800/150', '/marketplace', 'listing-bottom', 'active', 1000000),
('Listing Bottom - Sidebar', 'https://picsum.photos/seed/listing-bottom-side/400/150', '/marketplace', 'listing-bottom-sidebar', 'active', 500000),

-- Dashboard
('Dashboard Top - Landscape', 'https://picsum.photos/seed/dash-top/800/150', '/marketplace', 'dashboard-top', 'active', 1000000),
('Dashboard Top - Sidebar', 'https://picsum.photos/seed/dash-top-side/400/150', '/marketplace', 'dashboard-top-sidebar', 'active', 500000),

-- Dealer
('Dealer Top - Landscape', 'https://picsum.photos/seed/dealer-top/800/150', '/marketplace', 'dealer-top', 'active', 1000000),
('Dealer Top - Sidebar', 'https://picsum.photos/seed/dealer-top-side/400/150', '/marketplace', 'dealer-top-sidebar', 'active', 500000);

-- Grant access (adjust as needed)
GRANT ALL ON banners TO anon;
GRANT ALL ON banners TO authenticated;
GRANT ALL ON banners TO service_role;

-- Create function to get active banners by position
CREATE OR REPLACE FUNCTION get_active_banner(p_position VARCHAR)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  image_url TEXT,
  target_url TEXT,
  position VARCHAR,
  status VARCHAR,
  impressions INTEGER,
  clicks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    banners.id,
    banners.title,
    banners.image_url,
    banners.target_url,
    banners.position,
    banners.status,
    banners.impressions,
    banners.clicks
  FROM banners
  WHERE banners.position = p_position
    AND banners.status = 'active'
    AND (banners.ends_at IS NULL OR banners.ends_at > NOW())
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
