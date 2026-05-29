-- ==============================================================
-- COMPLETE SCHEMA FOR CAR MARKETPLACE - SYNCED WITH API ROUTES
-- Run this in Supabase SQL Editor
-- ==============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- DROP EXISTING TABLES (if any)
-- ==============================
DROP TABLE IF EXISTS inspection_results CASCADE;
DROP TABLE IF EXISTS car_inspections CASCADE;
DROP TABLE IF EXISTS inspection_items CASCADE;
DROP TABLE IF EXISTS inspection_categories CASCADE;
DROP TABLE IF EXISTS car_rental_prices CASCADE;
DROP TABLE IF EXISTS car_features CASCADE;
DROP TABLE IF EXISTS car_documents CASCADE;
DROP TABLE IF EXISTS car_images CASCADE;
DROP TABLE IF EXISTS car_videos CASCADE;
DROP TABLE IF EXISTS car_listings CASCADE;
DROP TABLE IF EXISTS car_colors CASCADE;
DROP TABLE IF EXISTS car_variants CASCADE;
DROP TABLE IF EXISTS car_models CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==============================
-- PROFILES (extends auth.users)
-- ==============================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'dealer', 'admin', 'inspector')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ==============================
-- DEALERS
-- ==============================
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city_id UUID,
  province_id UUID,
  postal_code TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier TEXT DEFAULT 'basic',
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- LOCATION TABLES
-- ==============================
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID,
  code TEXT,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id UUID REFERENCES provinces(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('kota', 'kabupaten')),
  postal_codes TEXT[],
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- CAR MASTER DATA
-- ==============================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  country TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  body_type TEXT CHECK (body_type IN ('sedan', 'suv', 'mpv', 'hatchback', 'pickup', 'van', 'coupe', 'convertible', 'wagon')),
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES car_models(id),
  name TEXT NOT NULL,
  engine_capacity DECIMAL(4,1),
  transmission TEXT CHECK (transmission IN ('automatic', 'manual')),
  fuel_type TEXT CHECK (fuel_type IN ('bensin', 'diesel', 'electric', 'hybrid', 'petrol_hybrid')),
  seat_count INTEGER,
  price_new INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  hex_code TEXT,
  is_metallic BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- LISTING SYSTEM
-- ==============================
CREATE TABLE car_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_number TEXT UNIQUE,
  user_id UUID REFERENCES profiles(id),
  dealer_id UUID REFERENCES dealers(id),
  brand_id UUID REFERENCES brands(id),
  model_id UUID REFERENCES car_models(id),
  variant_id UUID REFERENCES car_variants(id),
  generation_id UUID,
  
  year INTEGER,
  exterior_color_id UUID REFERENCES car_colors(id),
  interior_color_id UUID REFERENCES car_colors(id),
  fuel TEXT CHECK (fuel IN ('bensin', 'diesel', 'electric', 'hybrid', 'petrol_hybrid')),
  transmission TEXT CHECK (transmission IN ('automatic', 'manual')),
  body_type TEXT CHECK (body_type IN ('sedan', 'suv', 'mpv', 'hatchback', 'pickup', 'van', 'coupe', 'convertible', 'wagon')),
  engine_capacity DECIMAL(4,1),
  seat_count INTEGER,
  mileage INTEGER,
  vin_number TEXT,
  plate_number TEXT,
  
  transaction_type TEXT CHECK (transaction_type IN ('jual', 'beli', 'rental')),
  condition TEXT CHECK (condition IN ('baru', 'bekas', 'sedang', 'istimewa')),
  price_cash INTEGER,
  price_credit INTEGER,
  price_negotiable BOOLEAN DEFAULT TRUE,
  
  city TEXT,
  province TEXT,
  city_id UUID REFERENCES cities(id),
  province_id UUID REFERENCES provinces(id),
  
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'rejected', 'deleted')),
  sold_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  rejected_reason TEXT,
  
  title TEXT,
  description TEXT,
  
  meta_title TEXT,
  meta_description TEXT,
  slug TEXT UNIQUE,
  
  published_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE car_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  duration INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('stnk', 'bpkb', 'faktur', 'manual', 'service_book')),
  document_number TEXT,
  document_url TEXT,
  issue_date DATE,
  expiry_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  sunroof BOOLEAN DEFAULT FALSE,
  cruise_control BOOLEAN DEFAULT FALSE,
  rear_camera BOOLEAN DEFAULT FALSE,
  front_camera BOOLEAN DEFAULT FALSE,
  keyless_start BOOLEAN DEFAULT FALSE,
  push_start BOOLEAN DEFAULT FALSE,
  service_book BOOLEAN DEFAULT FALSE,
  airbag BOOLEAN DEFAULT FALSE,
  abs BOOLEAN DEFAULT FALSE,
  esp BOOLEAN DEFAULT FALSE,
  hill_start BOOLEAN DEFAULT FALSE,
  auto_park BOOLEAN DEFAULT FALSE,
  lane_keep BOOLEAN DEFAULT FALSE,
  adaptive_cruise BOOLEAN DEFAULT FALSE,
  blind_spot BOOLEAN DEFAULT FALSE,
  wireless_charger BOOLEAN DEFAULT FALSE,
  apple_carplay BOOLEAN DEFAULT FALSE,
  android_auto BOOLEAN DEFAULT FALSE,
  bluetooth BOOLEAN DEFAULT FALSE,
  navigation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INSPECTION SYSTEM
-- ==============================
CREATE TABLE inspection_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES inspection_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_critical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles(id),
  inspector_name TEXT,
  inspection_place TEXT,
  inspection_date DATE,
  total_points INTEGER DEFAULT 160,
  passed_points INTEGER,
  failed_points INTEGER DEFAULT 0,
  inspection_score DECIMAL(5,2),
  
  accident_free BOOLEAN DEFAULT TRUE,
  flood_free BOOLEAN DEFAULT TRUE,
  fire_free BOOLEAN DEFAULT TRUE,
  odometer_tampered BOOLEAN DEFAULT FALSE,
  
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
  overall_grade TEXT CHECK (overall_grade IN ('A+', 'A', 'B+', 'B', 'C', 'D', 'E')),
  
  recommended BOOLEAN DEFAULT TRUE,
  recommendation_notes TEXT,
  
  certificate_number TEXT,
  certificate_url TEXT,
  certificate_issued_at TIMESTAMPTZ,
  certificate_expires_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspection_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES car_inspections(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inspection_items(id),
  status TEXT NOT NULL DEFAULT 'baik' CHECK (status IN ('baik', 'sedang', 'perlu_perbaikan', 'istimewa')),
  notes TEXT,
  image_url TEXT,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  repair_cost_estimate INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- RENTAL SYSTEM
-- ==============================
CREATE TABLE car_rental_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  price_per_hour INTEGER,
  price_per_day INTEGER,
  price_per_week INTEGER,
  price_per_month INTEGER,
  min_rental_days INTEGER DEFAULT 1,
  max_rental_days INTEGER,
  deposit_amount INTEGER,
  includes_driver BOOLEAN DEFAULT FALSE,
  includes_fuel BOOLEAN DEFAULT FALSE,
  mileage_limit_per_day INTEGER,
  excess_mileage_charge INTEGER,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INDEXES
-- ==============================
CREATE INDEX idx_car_listings_status ON car_listings(status);
CREATE INDEX idx_car_listings_transaction_type ON car_listings(transaction_type);
CREATE INDEX idx_car_listings_condition ON car_listings(condition);
CREATE INDEX idx_car_listings_price ON car_listings(price_cash);
CREATE INDEX idx_car_listings_year ON car_listings(year);
CREATE INDEX idx_car_listings_user ON car_listings(user_id);
CREATE INDEX idx_car_listings_dealer ON car_listings(dealer_id);
CREATE INDEX idx_car_listings_brand ON car_listings(brand_id);
CREATE INDEX idx_car_listings_model ON car_listings(model_id);
CREATE INDEX idx_car_images_listing ON car_images(car_listing_id);
CREATE INDEX idx_car_videos_listing ON car_videos(car_listing_id);
CREATE INDEX idx_car_features_listing ON car_features(car_listing_id);
CREATE INDEX idx_inspections_listing ON car_inspections(car_listing_id);
CREATE INDEX idx_inspection_items_category ON inspection_items(category_id);
CREATE INDEX idx_inspection_results_inspection ON inspection_results(inspection_id);

-- ==============================
-- ROW LEVEL SECURITY (RLS)
-- ==============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_rental_prices ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active listings" ON car_listings
  FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Public can view images" ON car_images
  FOR SELECT USING (true);

CREATE POLICY "Public can view videos" ON car_videos
  FOR SELECT USING (true);

CREATE POLICY "Public can view inspection results" ON inspection_results
  FOR SELECT USING (true);

CREATE POLICY "Public can view profiles" ON profiles
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Public can view dealers" ON dealers
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view master data" ON brands FOR SELECT USING (true);
CREATE POLICY "Public can view master data" ON car_models FOR SELECT USING (true);
CREATE POLICY "Public can view master data" ON car_variants FOR SELECT USING (true);
CREATE POLICY "Public can view master data" ON car_colors FOR SELECT USING (true);
CREATE POLICY "Public can view master data" ON provinces FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view master data" ON cities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view master data" ON inspection_categories FOR SELECT USING (true);
CREATE POLICY "Public can view master data" ON inspection_items FOR SELECT USING (true);

-- Authenticated users can create
CREATE POLICY "Auth users can create listings" ON car_listings
  FOR INSERT WITH (auth.role() = 'authenticated');

CREATE POLICY "Users can update own listings" ON car_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON car_listings
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================
-- SEED DATA: PROVINCES (INDONESIA)
-- ==============================
INSERT INTO provinces (id, name, code, is_active) VALUES
('11111111-1111-1111-1111-111111111001', 'DKI Jakarta', 'DKI', TRUE),
('11111111-1111-1111-1111-111111111002', 'Jawa Barat', 'JBR', TRUE),
('11111111-1111-1111-1111-111111111003', 'Jawa Tengah', 'JTG', TRUE),
('11111111-1111-1111-1111-111111111004', 'Jawa Timur', 'JTM', TRUE),
('11111111-1111-1111-1111-111111111005', 'Banten', 'BNT', TRUE),
('11111111-1111-1111-1111-111111111006', 'DI Yogyakarta', 'DIY', TRUE),
('11111111-1111-1111-1111-111111111007', 'Bali', 'BLI', TRUE),
('11111111-1111-1111-1111-111111111008', 'Sumatera Utara', 'SUU', TRUE),
('11111111-1111-1111-1111-111111111009', 'Sumatera Selatan', 'SSL', TRUE),
('11111111-1111-1111-1111-111111111010', 'Kalimantan Timur', 'KTI', TRUE);

-- ==============================
-- SEED DATA: CITIES
-- ==============================
INSERT INTO cities (id, province_id, name, type, is_active) VALUES
('22222222-2222-2222-2222-222222222001', '11111111-1111-1111-1111-111111111001', 'Jakarta Selatan', 'kota', TRUE),
('22222222-2222-2222-2222-222222222002', '11111111-1111-1111-1111-111111111001', 'Jakarta Pusat', 'kota', TRUE),
('22222222-2222-2222-2222-222222222003', '11111111-1111-1111-1111-111111111001', 'Jakarta Barat', 'kota', TRUE),
('22222222-2222-2222-2222-222222222004', '11111111-1111-1111-1111-111111111001', 'Jakarta Timur', 'kota', TRUE),
('22222222-2222-2222-2222-222222222005', '11111111-1111-1111-1111-111111111002', 'Bandung', 'kota', TRUE),
('22222222-2222-2222-2222-222222222006', '11111111-1111-1111-1111-111111111002', 'Bekasi', 'kota', TRUE),
('22222222-2222-2222-2222-222222222007', '11111111-1111-1111-1111-111111111002', 'Bogor', 'kota', TRUE),
('22222222-2222-2222-2222-222222222008', '11111111-1111-1111-1111-111111111002', 'Depok', 'kota', TRUE),
('22222222-2222-2222-2222-222222222009', '11111111-1111-1111-1111-111111111003', 'Semarang', 'kota', TRUE),
('22222222-2222-2222-2222-222222222010', '11111111-1111-1111-1111-111111111003', 'Solo', 'kota', TRUE),
('22222222-2222-2222-2222-222222222011', '11111111-1111-1111-1111-111111111004', 'Surabaya', 'kota', TRUE),
('22222222-2222-2222-2222-222222222012', '11111111-1111-1111-1111-111111111004', 'Malang', 'kota', TRUE),
('22222222-2222-2222-2222-222222222013', '11111111-1111-1111-1111-111111111005', 'Tangerang', 'kota', TRUE),
('22222222-2222-2222-2222-222222222014', '11111111-1111-1111-1111-111111111005', 'Serang', 'kota', TRUE),
('22222222-2222-2222-2222-222222222015', '11111111-1111-1111-1111-111111111006', 'Yogyakarta', 'kota', TRUE),
('22222222-2222-2222-2222-222222222016', '11111111-1111-1111-1111-111111111007', 'Denpasar', 'kota', TRUE);

-- ==============================
-- SEED DATA: BRANDS
-- ==============================
INSERT INTO brands (id, name, slug, logo_url, country, is_popular, display_order) VALUES
('33333333-3333-3333-3333-333333333001', 'Toyota', 'toyota', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Toyota_logo_2019-10-09.svg/100px-Toyota_logo_2019-10-09.svg.png', 'Japan', TRUE, 1),
('33333333-3333-3333-3333-333333333002', 'Honda', 'honda', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_logo_2016.svg/100px-Honda_logo_2016.svg.png', 'Japan', TRUE, 2),
('33333333-3333-3333-3333-333333333003', 'Mitsubishi', 'mitsubishi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mitsubishi_logo.svg/100px-Mitsubishi_logo.svg.png', 'Japan', TRUE, 3),
('33333333-3333-3333-3333-333333333004', 'Suzuki', 'suzuki', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Suzuki_logo_2.svg/100px-Suzuki_logo_2.svg.png', 'Japan', TRUE, 4),
('33333333-3333-3333-3333-333333333005', 'Daihatsu', 'daihatsu', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Daihatsu_logo.svg/100px-Daihatsu_logo.svg.png', 'Japan', TRUE, 5),
('33333333-3333-3333-3333-333333333006', 'Nissan', 'nissan', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Nissan-logo.svg/100px-Nissan-logo.svg.png', 'Japan', TRUE, 6),
('33333333-3333-3333-3333-333333333007', 'BMW', 'bmw', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/100px-BMW.svg.png', 'Germany', TRUE, 7),
('33333333-3333-3333-3333-333333333008', 'Mercedes-Benz', 'mercedes-benz', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/100px-Mercedes-Logo.svg.png', 'Germany', TRUE, 8),
('33333333-3333-3333-3333-333333333009', 'Hyundai', 'hyundai', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Hyundai_logo.svg/100px-Hyundai_logo.svg.png', 'South Korea', TRUE, 9),
('33333333-3333-3333-3333-333333333010', 'Wuling', 'wuling', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Wuling_Motors_logo.svg/100px-Wuling_Motors_logo.svg.png', 'China', TRUE, 10);

-- ==============================
-- SEED DATA: CAR MODELS
-- ==============================
INSERT INTO car_models (id, brand_id, name, slug, body_type, is_popular, display_order) VALUES
('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333001', 'Avanza', 'avanza', 'mpv', TRUE, 1),
('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333001', 'Innova', 'innova', 'mpv', TRUE, 2),
('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333001', 'Fortuner', 'fortuner', 'suv', TRUE, 3),
('44444444-4444-4444-4444-444444444004', '33333333-3333-3333-3333-333333333001', 'Rush', 'rush', 'suv', TRUE, 4),
('44444444-4444-4444-4444-444444444005', '33333333-3333-3333-3333-333333333001', 'Camry', 'camry', 'sedan', TRUE, 5),
('44444444-4444-4444-4444-444444444006', '33333333-3333-3333-3333-333333333001', 'Yaris', 'yaris', 'hatchback', TRUE, 6),
('44444444-4444-4444-4444-444444444007', '33333333-3333-3333-3333-333333333001', 'Vios', 'vios', 'sedan', TRUE, 7),
('44444444-4444-4444-4444-444444444008', '33333333-3333-3333-3333-333333333001', 'Hilux', 'hilux', 'pickup', TRUE, 8),
('44444444-4444-4444-4444-444444444009', '33333333-3333-3333-3333-333333333002', 'Jazz', 'jazz', 'hatchback', TRUE, 1),
('44444444-4444-4444-4444-444444444010', '33333333-3333-3333-3333-333333333002', 'City', 'city', 'sedan', TRUE, 2),
('44444444-4444-4444-4444-444444444011', '33333333-3333-3333-3333-333333333002', 'CR-V', 'cr-v', 'suv', TRUE, 3),
('44444444-4444-4444-4444-444444444012', '33333333-3333-3333-3333-333333333002', 'HR-V', 'hr-v', 'suv', TRUE, 4),
('44444444-4444-4444-4444-444444444013', '33333333-3333-3333-3333-333333333002', 'Mobilio', 'mobilio', 'mpv', TRUE, 5),
('44444444-4444-4444-4444-444444444014', '33333333-3333-3333-3333-333333333002', 'Brio', 'brio', 'hatchback', TRUE, 6),
('44444444-4444-4444-4444-444444444015', '33333333-3333-3333-3333-333333333002', 'Accord', 'accord', 'sedan', TRUE, 7),
('44444444-4444-4444-4444-444444444016', '33333333-3333-3333-3333-333333333003', 'Xpander', 'xpander', 'mpv', TRUE, 1),
('44444444-4444-4444-4444-444444444017', '33333333-3333-3333-3333-333333333003', 'Pajero Sport', 'pajero-sport', 'suv', TRUE, 2),
('44444444-4444-4444-4444-444444444018', '33333333-3333-3333-3333-333333333003', 'Triton', 'triton', 'pickup', TRUE, 3),
('44444444-4444-4444-4444-444444444019', '33333333-3333-3333-3333-333333333004', 'Ertiga', 'ertiga', 'mpv', TRUE, 1),
('44444444-4444-4444-4444-444444444020', '33333333-3333-3333-3333-333333333004', 'XL7', 'xl7', 'mpv', TRUE, 2);

-- ==============================
-- SEED DATA: CAR VARIANTS
-- ==============================
INSERT INTO car_variants (id, model_id, name, engine_capacity, transmission, fuel_type, seat_count, price_new) VALUES
('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', '1.3 E MT', 1.3, 'manual', 'bensin', 7, 215000000),
('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', '1.3 E CVT', 1.3, 'automatic', 'bensin', 7, 230000000),
('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444001', '1.5 G MT', 1.5, 'manual', 'bensin', 7, 245000000),
('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444001', '1.5 G CVT', 1.5, 'automatic', 'bensin', 7, 260000000),
('55555555-5555-5555-5555-555555555005', '44444444-4444-4444-4444-444444444002', '2.0 V MT', 2.0, 'manual', 'bensin', 7, 350000000),
('55555555-5555-5555-5555-555555555006', '44444444-4444-4444-4444-444444444002', '2.0 V AT', 2.0, 'automatic', 'bensin', 7, 375000000),
('55555555-5555-5555-5555-555555555007', '44444444-4444-4444-4444-444444444002', '2.4 V AT', 2.4, 'automatic', 'bensin', 7, 420000000),
('55555555-5555-5555-5555-555555555008', '44444444-4444-4444-4444-444444444003', '2.4 VRZ AT', 2.4, 'automatic', 'bensin', 7, 520000000),
('55555555-5555-5555-5555-555555555009', '44444444-4444-4444-4444-444444444003', '2.8 GR-S AT', 2.8, 'automatic', 'diesel', 7, 620000000),
('55555555-5555-5555-5555-555555555010', '44444444-4444-4444-4444-444444444009', 'RS CVT', 1.5, 'automatic', 'bensin', 5, 310000000),
('55555555-5555-5555-5555-555555555011', '44444444-4444-4444-4444-444444444009', 'SE CVT', 1.5, 'automatic', 'bensin', 5, 280000000),
('55555555-5555-5555-5555-555555555012', '44444444-4444-4444-4444-444444444011', '1.5 Turbo CVT', 1.5, 'automatic', 'bensin', 5, 520000000),
('55555555-5555-5555-5555-555555555013', '44444444-4444-4444-4444-444444444011', '2.0 AT', 2.0, 'automatic', 'bensin', 5, 580000000),
('55555555-5555-5555-5555-555555555014', '44444444-4444-4444-4444-444444444012', '1.5 S CVT', 1.5, 'automatic', 'bensin', 5, 380000000),
('55555555-5555-5555-5555-555555555015', '44444444-4444-4444-4444-444444444012', '1.8 Prestige CVT', 1.8, 'automatic', 'bensin', 5, 450000000),
('55555555-5555-5555-5555-555555555016', '44444444-4444-4444-4444-444444444016', 'Exceed AT', 1.5, 'automatic', 'bensin', 7, 320000000),
('55555555-5555-5555-5555-555555555017', '44444444-4444-4444-4444-444444444016', 'Ultimate AT', 1.5, 'automatic', 'bensin', 7, 360000000),
('55555555-5555-5555-5555-555555555018', '44444444-4444-4444-4444-444444444017', '4x2 AT', 2.4, 'automatic', 'diesel', 7, 550000000),
('55555555-5555-5555-5555-555555555019', '44444444-4444-4444-4444-444444444017', '4x4 AT', 2.4, 'automatic', 'diesel', 7, 620000000),
('55555555-5555-5555-5555-555555555020', '44444444-4444-4444-4444-444444444019', 'GX MT', 1.5, 'manual', 'bensin', 7, 250000000);

-- ==============================
-- SEED DATA: CAR COLORS
-- ==============================
INSERT INTO car_colors (id, name, hex_code, is_metallic, is_popular) VALUES
('66666666-6666-6666-6666-666666666001', 'Putih', '#FFFFFF', FALSE, TRUE),
('66666666-6666-6666-6666-666666666002', 'Hitam', '#000000', FALSE, TRUE),
('66666666-6666-6666-6666-666666666003', 'Silver', '#C0C0C0', TRUE, TRUE),
('66666666-6666-6666-6666-666666666004', 'Abu-abu', '#808080', TRUE, TRUE),
('66666666-6666-6666-6666-666666666005', 'Merah', '#FF0000', FALSE, TRUE),
('66666666-6666-6666-6666-666666666006', 'Biru', '#0000FF', TRUE, FALSE),
('66666666-6666-6666-6666-666666666007', 'Hijau', '#00FF00', FALSE, FALSE),
('66666666-6666-6666-6666-666666666008', 'Kuning', '#FFFF00', FALSE, FALSE),
('66666666-6666-6666-6666-666666666009', 'Coklat', '#8B4513', TRUE, FALSE),
('66666666-6666-6666-6666-666666666010', 'Emas', '#FFD700', TRUE, FALSE),
('66666666-6666-6666-6666-666666666011', 'Bronze', '#CD7F32', TRUE, FALSE),
('66666666-6666-6666-6666-666666666012', 'Orange', '#FFA500', FALSE, FALSE),
('66666666-6666-6666-6666-666666666013', 'Ungu', '#800080', TRUE, FALSE),
('66666666-6666-6666-6666-666666666014', 'Navy', '#000080', TRUE, FALSE),
('66666666-6666-6666-6666-666666666015', 'Maroon', '#800000', FALSE, FALSE);

-- ==============================
-- SEED DATA: INSPECTION CATEGORIES (10 categories)
-- ==============================
INSERT INTO inspection_categories (id, name, description, icon, display_order, total_items) VALUES
('77777777-7777-7777-7777-777777777001', 'Eksterior', 'Pemeriksaan kondisi eksterior kendaraan', 'car', 1, 20),
('77777777-7777-7777-7777-777777777002', 'Interior', 'Pemeriksaan kondisi interior kendaraan', 'seat', 2, 20),
('77777777-7777-7777-7777-777777777003', 'Mesin', 'Pemeriksaan kondisi mesin dan performa', 'engine', 3, 25),
('77777777-7777-7777-7777-777777777004', 'Transmisi', 'Pemeriksaan sistem transmisi', 'cog', 4, 10),
('77777777-7777-7777-7777-777777777005', 'Rangka & Suspensi', 'Pemeriksaan kondisi rangka dan sistem suspensi', 'wrench', 5, 15),
('77777777-7777-7777-7777-777777777006', 'Rem', 'Pemeriksaan sistem pengereman', 'disc', 6, 10),
('77777777-7777-7777-7777-777777777007', 'Ban & Velg', 'Pemeriksaan kondisi ban dan velg', 'circle', 7, 8),
('77777777-7777-7777-7777-777777777008', 'Listrik & Elektronik', 'Pemeriksaan sistem kelistrikan', 'zap', 8, 12),
('77777777-7777-7777-7777-777777777009', 'Dokumen', 'Verifikasi kelengkapan dokumen', 'file-text', 9, 8),
('77777777-7777-7777-7777-777777777010', 'Safety', 'Pemeriksaan fitur keselamatan', 'shield', 10, 12);

-- ==============================
-- SEED DATA: INSPECTION ITEMS (160 items - simplified for brevity, showing key items)
-- ==============================
-- Eksterior (20 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888001', '77777777-7777-7777-7777-777777777001', 'Cat Body', 'Kondisi cat body keseluruhan', 1, TRUE),
('88888888-8888-8888-8888-888888888002', '77777777-7777-7777-7777-777777777001', 'Panel Depan', 'Kondisi panel depan (bumper, grille)', 2, FALSE),
('88888888-8888-8888-8888-888888888003', '77777777-7777-7777-7777-777777777001', 'Panel Belakang', 'Kondisi panel belakang (bumper, trunk)', 3, FALSE),
('88888888-8888-8888-8888-888888888004', '77777777-7777-7777-7777-777777777001', 'Fender Depan Kiri', 'Kondisi fender depan kiri', 4, FALSE),
('88888888-8888-8888-8888-888888888005', '77777777-7777-7777-7777-777777777001', 'Fender Depan Kanan', 'Kondisi fender depan kanan', 5, FALSE),
('88888888-8888-8888-8888-888888888006', '77777777-7777-7777-7777-777777777001', 'Fender Belakang Kiri', 'Kondisi fender belakang kiri', 6, FALSE),
('88888888-8888-8888-8888-888888888007', '77777777-7777-7777-7777-777777777001', 'Fender Belakang Kanan', 'Kondisi fender belakang kanan', 7, FALSE),
('88888888-8888-8888-8888-888888888008', '77777777-7777-7777-7777-777777777001', 'Pintu Depan Kiri', 'Kondisi pintu depan kiri', 8, FALSE),
('88888888-8888-8888-8888-888888888009', '77777777-7777-7777-7777-777777777001', 'Pintu Depan Kanan', 'Kondisi pintu depan kanan', 9, FALSE),
('88888888-8888-8888-8888-888888888010', '77777777-7777-7777-7777-777777777001', 'Pintu Belakang Kiri', 'Kondisi pintu belakang kiri', 10, FALSE),
('88888888-8888-8888-8888-888888888011', '77777777-7777-7777-7777-777777777001', 'Pintu Belakang Kanan', 'Kondisi pintu belakang kanan', 11, FALSE),
('88888888-8888-8888-8888-888888888012', '77777777-7777-7777-7777-777777777001', 'Hood/Kap Mesin', 'Kondisi kap mesin', 12, FALSE),
('88888888-8888-8888-8888-888888888013', '77777777-7777-7777-7777-777777777001', 'Atap/Roof', 'Kondisi atap kendaraan', 13, TRUE),
('88888888-8888-8888-8888-888888888014', '77777777-7777-7777-7777-777777777001', 'Kaca Depan', 'Kondisi kaca depan', 14, TRUE),
('88888888-8888-8888-8888-888888888015', '77777777-7777-7777-7777-777777777001', 'Kaca Belakang', 'Kondisi kaca belakang', 15, TRUE),
('88888888-8888-8888-8888-888888888016', '77777777-7777-7777-7777-777777777001', 'Kaca Jendela Kiri', 'Kondisi kaca jendela kiri', 16, FALSE),
('88888888-8888-8888-8888-888888888017', '77777777-7777-7777-7777-777777777001', 'Kaca Jendela Kanan', 'Kondisi kaca jendela kanan', 17, FALSE),
('88888888-8888-8888-8888-888888888018', '77777777-7777-7777-7777-777777777001', 'Lampu Depan', 'Kondisi lampu depan (headlamp)', 18, TRUE),
('88888888-8888-8888-8888-888888888019', '77777777-7777-7777-7777-777777777001', 'Lampu Belakang', 'Kondisi lampu belakang (taillight)', 19, TRUE),
('88888888-8888-8888-8888-888888888020', '77777777-7777-7777-7777-777777777001', 'Kaca Spion', 'Kondisi kaca spion kiri dan kanan', 20, FALSE);

-- Interior (20 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888021', '77777777-7777-7777-7777-777777777002', 'Dashboard', 'Kondisi dashboard', 1, FALSE),
('88888888-8888-8888-8888-888888888022', '77777777-7777-7777-7777-777777777002', 'Setir/Steering Wheel', 'Kondisi setir', 2, FALSE),
('88888888-8888-8888-8888-888888888023', '77777777-7777-7777-7777-777777777002', 'Jok Depan Kiri', 'Kondisi jok pengemudi', 3, FALSE),
('88888888-8888-8888-8888-888888888024', '77777777-7777-7777-7777-777777777002', 'Jok Depan Kanan', 'Kondisi jok penumpang depan', 4, FALSE),
('88888888-8888-8888-8888-888888888025', '77777777-7777-7777-7777-777777777002', 'Jok Baris Kedua', 'Kondisi jok baris kedua', 5, FALSE),
('88888888-8888-8888-8888-888888888026', '77777777-7777-7777-7777-777777777002', 'Jok Baris Ketiga', 'Kondisi jok baris ketiga (jika ada)', 6, FALSE),
('88888888-8888-8888-8888-888888888027', '77777777-7777-7777-7777-777777777002', 'Karpet Lantai', 'Kondisi karpet lantai', 7, FALSE),
('88888888-8888-8888-8888-888888888028', '77777777-7777-7777-7777-777777777002', 'Plafon/Headliner', 'Kondisi plafon interior', 8, FALSE),
('88888888-8888-8888-8888-888888888029', '77777777-7777-7777-7777-777777777002', 'Panel Pintu Kiri', 'Kondisi panel interior pintu kiri', 9, FALSE),
('88888888-8888-8888-8888-888888888030', '77777777-7777-7777-7777-777777777002', 'Panel Pintu Kanan', 'Kondisi panel interior pintu kanan', 10, FALSE),
('88888888-8888-8888-8888-888888888031', '77777777-7777-7777-7777-777777777002', 'AC', 'Fungsi AC dan pendinginan', 11, TRUE),
('88888888-8888-8888-8888-888888888032', '77777777-7777-7777-7777-777777777002', 'Audio System', 'Fungsi sistem audio', 12, FALSE),
('88888888-8888-8888-8888-888888888033', '77777777-7777-7777-7777-777777777002', 'Power Window', 'Fungsi power window', 13, FALSE),
('88888888-8888-8888-8888-888888888034', '77777777-7777-7777-7777-777777777002', 'Central Lock', 'Fungsi central lock', 14, FALSE),
('88888888-8888-8888-8888-888888888035', '77777777-7777-7777-7777-777777777002', 'Seat Adjuster', 'Fungsi pengaturan jok', 15, FALSE),
('88888888-8888-8888-8888-888888888036', '77777777-7777-7777-7777-777777777002', 'Sunroof', 'Kondisi sunroof (jika ada)', 16, FALSE),
('88888888-8888-8888-8888-888888888037', '77777777-7777-7777-7777-777777777002', 'Odometer', 'Fungsi odometer', 17, TRUE),
('88888888-8888-8888-8888-888888888038', '77777777-7777-7777-7777-777777777002', 'Speedometer', 'Fungsi speedometer', 18, FALSE),
('88888888-8888-8888-8888-888888888039', '77777777-7777-7777-7777-777777777002', 'Indikator Dashboard', 'Fungsi semua indikator dashboard', 19, FALSE),
('88888888-8888-8888-8888-888888888040', '77777777-7777-7777-7777-777777777002', 'Bau Interior', 'Bau interior (tidak apek/moldy)', 20, FALSE);

-- Mesin (25 items) - abbreviated for space
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888041', '77777777-7777-7777-7777-777777777003', 'Mesin Start', 'Fungsi starter mesin', 1, TRUE),
('88888888-8888-8888-8888-888888888042', '77777777-7777-7777-7777-777777777003', 'Suara Mesin', 'Suara mesin (normal/tidak berisik)', 2, TRUE),
('88888888-8888-8888-8888-888888888043', '77777777-7777-7777-7777-777777777003', 'Getaran Mesin', 'Getaran mesin (normal/tidak berlebihan)', 3, TRUE),
('88888888-8888-8888-8888-888888888044', '77777777-7777-7777-7777-777777777003', 'Oli Mesin', 'Kondisi dan level oli mesin', 4, TRUE),
('88888888-8888-8888-8888-888888888045', '77777777-7777-7777-7777-777777777003', 'Coolant', 'Kondisi dan level coolant', 5, TRUE),
('88888888-8888-8888-8888-888888888046', '77777777-7777-7777-7777-777777777003', 'Minyak Rem', 'Kondisi dan level minyak rem', 6, TRUE),
('88888888-8888-8888-8888-888888888047', '77777777-7777-7777-7777-777777777003', 'Radiator', 'Kondisi radiator', 7, TRUE),
('88888888-8888-8888-8888-888888888048', '77777777-7777-7777-7777-777777777003', 'Alternator', 'Fungsi alternator', 8, TRUE),
('88888888-8888-8888-8888-888888888049', '77777777-7777-7777-7777-777777777003', 'Aki/Battery', 'Kondisi aki', 9, TRUE),
('88888888-8888-8888-8888-888888888050', '77777777-7777-7777-7777-777777777003', 'Exhaust System', 'Kondisi exhaust system', 10, FALSE);

-- Transmisi (10 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888061', '77777777-7777-7777-7777-777777777004', 'Pergeseran Gigi', 'Pergeseran gigi (halus/tidak tersendat)', 1, TRUE),
('88888888-8888-8888-8888-888888888062', '77777777-7777-7777-7777-777777777004', 'Kopling (Manual)', 'Fungsi kopling (untuk transmisi manual)', 2, TRUE),
('88888888-8888-8888-8888-888888888063', '77777777-7777-7777-7777-777777777004', 'Oli Transmisi', 'Kondisi dan level oli transmisi', 3, TRUE),
('88888888-8888-8888-8888-888888888064', '77777777-7777-7777-7777-777777777004', 'Mounting Mesin', 'Kondisi mounting mesin', 4, FALSE),
('88888888-8888-8888-8888-888888888065', '77777777-7777-7777-7777-777777777004', 'Mounting Transmisi', 'Kondisi mounting transmisi', 5, FALSE);

-- Rangka & Suspensi (15 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888071', '77777777-7777-7777-7777-777777777005', 'Chassis/Rangka', 'Kondisi chassis utama', 1, TRUE),
('88888888-8888-8888-8888-888888888072', '77777777-7777-7777-7777-777777777005', 'Suspensi Depan', 'Kondisi suspensi depan', 2, TRUE),
('88888888-8888-8888-8888-888888888073', '77777777-7777-7777-7777-777777777005', 'Suspensi Belakang', 'Kondisi suspensi belakang', 3, TRUE),
('88888888-8888-8888-8888-888888888074', '77777777-7777-7777-7777-777777777005', 'Shock Breaker Depan', 'Kondisi shock breaker depan', 4, FALSE),
('88888888-8888-8888-8888-888888888075', '77777777-7777-7777-7777-777777777005', 'Shock Breaker Belakang', 'Kondisi shock breaker belakang', 5, FALSE),
('88888888-8888-8888-8888-888888888076', '77777777-7777-7777-7777-777777777005', 'Ball Joint', 'Kondisi ball joint', 6, TRUE),
('88888888-8888-8888-8888-888888888077', '77777777-7777-7777-7777-777777777005', 'Tie Rod', 'Kondisi tie rod', 7, TRUE);

-- Rem (10 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888081', '77777777-7777-7777-7777-777777777006', 'Rem Depan (Disc)', 'Kondisi rem depan', 1, TRUE),
('88888888-8888-8888-8888-888888888082', '77777777-7777-7777-7777-777777777006', 'Rem Belakang', 'Kondisi rem belakang', 2, TRUE),
('88888888-8888-8888-8888-888888888083', '77777777-7777-7777-7777-777777777006', 'Kampas Rem/Pad', 'Tebal kampas rem', 3, TRUE),
('88888888-8888-8888-8888-888888888084', '77777777-7777-7777-7777-777777777006', 'Master Rem', 'Fungsi master rem', 4, TRUE),
('88888888-8888-8888-8888-888888888085', '77777777-7777-7777-7777-777777777006', 'ABS', 'Fungsi ABS', 5, TRUE),
('88888888-8888-8888-8888-888888888086', '77777777-7777-7777-7777-777777777006', 'Rem Parkir', 'Fungsi rem parkir', 6, FALSE);

-- Ban & Velg (8 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888091', '77777777-7777-7777-7777-777777777007', 'Ban Depan Kiri', 'Kondisi ban depan kiri', 1, TRUE),
('88888888-8888-8888-8888-888888888092', '77777777-7777-7777-7777-777777777007', 'Ban Depan Kanan', 'Kondisi ban depan kanan', 2, TRUE),
('88888888-8888-8888-8888-888888888093', '77777777-7777-7777-7777-777777777007', 'Ban Belakang Kiri', 'Kondisi ban belakang kiri', 3, TRUE),
('88888888-8888-8888-8888-888888888094', '77777777-7777-7777-7777-777777777007', 'Ban Belakang Kanan', 'Kondisi ban belakang kanan', 4, TRUE),
('88888888-8888-8888-8888-888888888095', '77777777-7777-7777-7777-777777777007', 'Ban Cadangan', 'Kondisi ban cadangan', 5, FALSE),
('88888888-8888-8888-8888-888888888096', '77777777-7777-7777-7777-777777777007', 'Velg', 'Kondisi velg', 6, FALSE);

-- Listrik & Elektronik (12 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888101', '77777777-7777-7777-7777-777777777008', 'Lampu Utama', 'Fungsi lampu utama (low/high beam)', 1, TRUE),
('88888888-8888-8888-8888-888888888102', '77777777-7777-7777-7777-777777777008', 'Lampu Rem', 'Fungsi lampu rem', 2, TRUE),
('88888888-8888-8888-8888-888888888103', '77777777-7777-7777-7777-777777777008', 'Lampu Sein/Sign', 'Fungsi lampu sein', 3, TRUE),
('88888888-8888-8888-8888-888888888104', '77777777-7777-7777-7777-777777777008', 'Klakson', 'Fungsi klakson', 4, FALSE),
('88888888-8888-8888-8888-888888888105', '77777777-7777-7777-7777-777777777008', 'Wiper Depan', 'Fungsi wiper depan', 5, FALSE),
('88888888-8888-8888-8888-888888888106', '77777777-7777-7777-7777-777777777008', 'Alarm', 'Fungsi alarm kendaraan', 6, FALSE);

-- Dokumen (8 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888111', '77777777-7777-7777-7777-777777777009', 'STNK', 'Kelengkapan dan keabsahan STNK', 1, TRUE),
('88888888-8888-8888-8888-888888888112', '77777777-7777-7777-7777-777777777009', 'BPKB', 'Kelengkapan BPKB', 2, TRUE),
('88888888-8888-8888-8888-888888888113', '77777777-7777-7777-7777-777777777009', 'Faktur', 'Kelengkapan faktur kendaraan', 3, TRUE),
('88888888-8888-8888-8888-888888888114', '77777777-7777-7777-7777-777777777009', 'Kunci Cadangan', 'Kelengkapan kunci cadangan', 4, FALSE),
('88888888-8888-8888-8888-888888888115', '77777777-7777-7777-7777-777777777009', 'Buku Service', 'Kelengkapan buku service', 5, FALSE),
('88888888-8888-8888-8888-888888888116', '77777777-7777-7777-7777-777777777009', 'Pajak Tahunan', 'Status pajak tahunan', 6, TRUE);

-- Safety (12 items)
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
('88888888-8888-8888-8888-888888888121', '77777777-7777-7777-7777-777777777010', 'Airbag', 'Kondisi airbag', 1, TRUE),
('88888888-8888-8888-8888-888888888122', '77777777-7777-7777-7777-777777777010', 'Seatbelt Depan', 'Fungsi seatbelt depan', 2, TRUE),
('88888888-8888-8888-8888-888888888123', '77777777-7777-7777-7777-777777777010', 'Seatbelt Belakang', 'Fungsi seatbelt belakang', 3, TRUE),
('88888888-8888-8888-8888-888888888124', '77777777-7777-7777-7777-777777777010', 'Camera Belakang', 'Fungsi kamera belakang', 4, FALSE),
('88888888-8888-8888-8888-888888888125', '77777777-7777-7777-7777-777777777010', 'Sensor Parkir', 'Fungsi sensor parkir', 5, FALSE),
('88888888-8888-8888-8888-888888888126', '77777777-7777-7777-7777-777777777010', 'ISOFIX', 'Ketersediaan ISOFIX', 6, FALSE);

-- ==============================
-- SAMPLE LISTINGS
-- ==============================
-- Create a test profile first
INSERT INTO profiles (id, email, full_name, role, is_verified) VALUES
('99999999-9999-9999-9999-999999999001', 'demo@carmarket.id', 'Demo Seller', 'seller', TRUE);

-- Create sample listings
INSERT INTO car_listings (id, listing_number, user_id, brand_id, model_id, variant_id, year, exterior_color_id, fuel, transmission, body_type, mileage, transaction_type, condition, price_cash, city, province, status, title, description, slug, published_at, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'CL-2024TEST01', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444001', '55555555-5555-5555-5555-555555555002', 2022, '66666666-6666-6666-6666-666666666001', 'bensin', 'automatic', 'mpv', 25000, 'jual', 'bekas', 225000000, 'Jakarta Selatan', 'DKI Jakarta', 'active', 'Toyota Avanza 1.3 E CVT 2022 - Kondisi Prima', 'Mobil satu tangan, service resmi di bengkel Toyota. Kondisi mulus, tidak pernah kecelakaan. Dokumen lengkap, pajak panjang.', 'toyota-avanza-13-e-cvt-2022-cl-2024test01', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'CL-2024TEST02', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444011', '55555555-5555-5555-5555-555555555012', 2021, '66666666-6666-6666-6666-666666666002', 'bensin', 'automatic', 'suv', 18000, 'jual', 'bekas', 490000000, 'Bandung', 'Jawa Barat', 'active', 'Honda CR-V 1.5 Turbo 2021 - Low KM', 'Full option, low KM, kondisi seperti baru. Free service sampai 2024.', 'honda-cr-v-15-turbo-2021-cl-2024test02', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'CL-2024TEST03', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333003', '44444444-4444-4444-4444-444444444016', '55555555-5555-5555-5555-555555555016', 2023, '66666666-6666-6666-6666-666666666003', 'bensin', 'automatic', 'mpv', 5000, 'jual', 'baru', 315000000, 'Surabaya', 'Jawa Timur', 'active', 'Mitsubishi Xpander Exceed 2023 - Unit Baru', 'Unit baru, DP ringan, bisa kredit. Warna Silver Metallic.', 'mitsubishi-xpander-exceed-2023-cl-2024test03', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'CL-2024TEST04', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444002', '55555555-5555-5555-5555-555555555006', 2020, '66666666-6666-6666-6666-666666666004', 'bensin', 'automatic', 'mpv', 45000, 'jual', 'bekas', 350000000, 'Semarang', 'Jawa Tengah', 'active', 'Toyota Innova 2.0 V AT 2020 - Diesel', 'Innova Diesel AT, kondisi terawat, untuk keluarga. IRit bahan bakar.', 'toyota-innova-20-v-at-2020-cl-2024test04', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'CL-2024TEST05', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444012', '55555555-5555-5555-5555-555555555014', 2022, '66666666-6666-6666-6666-666666666005', 'bensin', 'automatic', 'suv', 12000, 'jual', 'bekas', 365000000, 'Jakarta Pusat', 'DKI Jakarta', 'active', 'Honda HR-V 1.5 S CVT 2022 - Siap Pakai', 'Tampilan sporty, fitur lengkap. Sunroof, leather seat.', 'honda-hr-v-15-s-cvt-2022-cl-2024test05', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'CL-2024TEST06', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444003', '55555555-5555-5555-5555-555555555009', 2021, '66666666-6666-6666-6666-666666666006', 'diesel', 'automatic', 'suv', 35000, 'jual', 'bekas', 580000000, 'Tangerang', 'Banten', 'active', 'Toyota Fortuner 2.8 GR-S AT 2021 - Diesel', 'Fortuner Diesel GR-S, tampilan gagah. 4WD, cocok untuk adventure.', 'toyota-fortuner-28-gr-s-at-2021-cl-2024test06', NOW(), NOW());

-- Add images for listings
INSERT INTO car_images (id, car_listing_id, image_url, is_primary, display_order) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'https://images.unsplash.com/photo-1568844293986-8c1a5e37dbbb?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'https://images.unsplash.com/photo-1541506638840-5b3a70a18f5e?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', TRUE, 1);

-- Add features for listings
INSERT INTO car_features (car_listing_id, sunroof, cruise_control, rear_camera, keyless_start, push_start, abs, airbag, bluetooth, apple_carplay, android_auto) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Add inspections for some listings
INSERT INTO car_inspections (id, car_listing_id, inspector_name, inspection_place, inspection_date, total_points, passed_points, failed_points, inspection_score, accident_free, flood_free, risk_level, overall_grade, recommended, status) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccc01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'Inspector Demo', 'Bengkel Central Jakarta', '2024-01-15', 160, 152, 8, 95.00, TRUE, TRUE, 'low', 'A', TRUE, 'completed'),
('cccccccc-cccc-cccc-cccc-cccccccccc02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'Inspector Demo', 'Bengkel Bandung', '2024-01-10', 160, 148, 12, 92.50, TRUE, TRUE, 'low', 'A-', TRUE, 'completed'),
('cccccccc-cccc-cccc-cccc-cccccccccc03', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'Inspector Demo', 'Bengkel Tangerang', '2024-01-12', 160, 155, 5, 96.88, TRUE, TRUE, 'low', 'A+', TRUE, 'completed');

-- ==============================
-- TRIGGER FOR UPDATED_AT
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_listings_updated_at BEFORE UPDATE ON car_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_inspections_updated_at BEFORE UPDATE ON car_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_rental_prices_updated_at BEFORE UPDATE ON car_rental_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done!
SELECT 'Complete schema with sample data created successfully!' AS message;
