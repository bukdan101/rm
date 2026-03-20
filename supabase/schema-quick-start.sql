-- ==============================================================
-- QUICK START SCHEMA FOR CAR MARKETPLACE
-- Run this in Supabase SQL Editor to set up basic tables
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
DROP TABLE IF EXISTS car_listings CASCADE;
DROP TABLE IF EXISTS car_colors CASCADE;
DROP TABLE IF EXISTS car_variants CASCADE;
DROP TABLE IF EXISTS car_models CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
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
-- LOCATION TABLES
-- ==============================
CREATE TABLE provinces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  province_id INTEGER REFERENCES provinces(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- CAR MASTER DATA
-- ==============================
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_models (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  body_type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_variants (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES car_models(id),
  name TEXT NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER,
  transmission_type TEXT NOT NULL CHECK (transmission_type IN ('automatic', 'manual')),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('bensin', 'diesel', 'electric', 'hybrid', 'petrol_hybrid')),
  engine_cc INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_colors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- LISTING SYSTEM
-- ==============================
CREATE TABLE car_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id),
  variant_id INTEGER REFERENCES car_variants(id),
  color_id INTEGER REFERENCES car_colors(id),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  vehicle_condition TEXT NOT NULL CHECK (vehicle_condition IN ('baru', 'bekas', 'sedang', 'istimewa')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('jual', 'beli', 'rental')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'rejected', 'deleted')),
  location_city TEXT,
  location_province TEXT,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE car_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('stnk', 'bpkb', 'faktur', 'manual', 'service_book')),
  document_url TEXT,
  expiry_date DATE,
  is_valid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_category TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INSPECTION SYSTEM
-- ==============================
CREATE TABLE inspection_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspection_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES inspection_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE car_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
  overall_score DECIMAL(5,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
  notes TEXT,
  inspected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspection_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES car_inspections(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES inspection_items(id),
  status TEXT NOT NULL DEFAULT 'baik' CHECK (status IN ('baik', 'sedang', 'perlu_perbaikan', 'istimewa')),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- RENTAL SYSTEM
-- ==============================
CREATE TABLE car_rental_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  daily_price INTEGER NOT NULL,
  weekly_price INTEGER,
  monthly_price INTEGER,
  deposit_amount INTEGER,
  min_rent_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INDEXES
-- ==============================
CREATE INDEX idx_car_listings_status ON car_listings(status);
CREATE INDEX idx_car_listings_transaction_type ON car_listings(transaction_type);
CREATE INDEX idx_car_listings_vehicle_condition ON car_listings(vehicle_condition);
CREATE INDEX idx_car_listings_price ON car_listings(price);
CREATE INDEX idx_car_listings_year ON car_listings(year);
CREATE INDEX idx_car_listings_seller ON car_listings(seller_id);
CREATE INDEX idx_car_images_listing ON car_images(listing_id);
CREATE INDEX idx_inspection_items_category ON inspection_items(category_id);
CREATE INDEX idx_inspection_results_inspection ON inspection_results(inspection_id);

-- ==============================
-- ROW LEVEL SECURITY (RLS)
-- ==============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Public can view inspection results" ON inspection_results
  FOR SELECT USING (true);

CREATE POLICY "Public can view profiles" ON profiles
  FOR SELECT USING (deleted_at IS NULL);

-- Seller policies
CREATE POLICY "Sellers can create listings" ON car_listings
  FOR INSERT WITH AUTHENTICATED (true);

CREATE POLICY "Sellers can update own listings" ON car_listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own listings" ON car_listings
  FOR DELETE USING (auth.uid() = seller_id);

-- ==============================
-- SEED DATA: PROVINCES (INDONESIA)
-- ==============================
INSERT INTO provinces (name, slug) VALUES
('DKI Jakarta', 'dki-jakarta'),
('Jawa Barat', 'jawa-barat'),
('Jawa Tengah', 'jawa-tengah'),
('Jawa Timur', 'jawa-timur'),
('Banten', 'banten'),
('DI Yogyakarta', 'di-yogyakarta'),
('Bali', 'bali'),
('Sumatera Utara', 'sumatera-utara'),
('Sumatera Selatan', 'sumatera-selatan'),
('Kalimantan Timur', 'kalimantan-timur');

-- ==============================
-- SEED DATA: CITIES
-- ==============================
INSERT INTO cities (province_id, name, slug) VALUES
(1, 'Jakarta Selatan', 'jakarta-selatan'),
(1, 'Jakarta Pusat', 'jakarta-pusat'),
(1, 'Jakarta Barat', 'jakarta-barat'),
(1, 'Jakarta Timur', 'jakarta-timur'),
(2, 'Bandung', 'bandung'),
(2, 'Bekasi', 'bekasi'),
(2, 'Bogor', 'bogor'),
(2, 'Depok', 'depok'),
(3, 'Semarang', 'semarang'),
(3, 'Solo', 'solo'),
(4, 'Surabaya', 'surabaya'),
(4, 'Malang', 'malang'),
(5, 'Tangerang', 'tangerang'),
(5, 'Serang', 'serang'),
(6, 'Yogyakarta', 'yogyakarta'),
(7, 'Denpasar', 'denpasar');

-- ==============================
-- SEED DATA: BRANDS
-- ==============================
INSERT INTO brands (name, slug, logo_url, is_active) VALUES
('Toyota', 'toyota', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Toyota_logo_2019-10-09.svg/100px-Toyota_logo_2019-10-09.svg.png', TRUE),
('Honda', 'honda', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_logo_2016.svg/100px-Honda_logo_2016.svg.png', TRUE),
('Mitsubishi', 'mitsubishi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mitsubishi_logo.svg/100px-Mitsubishi_logo.svg.png', TRUE),
('Suzuki', 'suzuki', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Suzuki_logo_2.svg/100px-Suzuki_logo_2.svg.png', TRUE),
('Daihatsu', 'daihatsu', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Daihatsu_logo.svg/100px-Daihatsu_logo.svg.png', TRUE),
('Nissan', 'nissan', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Nissan-logo.svg/100px-Nissan-logo.svg.png', TRUE),
('BMW', 'bmw', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/100px-BMW.svg.png', TRUE),
('Mercedes-Benz', 'mercedes-benz', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/100px-Mercedes-Logo.svg.png', TRUE),
('Hyundai', 'hyundai', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Hyundai_logo.svg/100px-Hyundai_logo.svg.png', TRUE),
('Wuling', 'wuling', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Wuling_Motors_logo.svg/100px-Wuling_Motors_logo.svg.png', TRUE);

-- ==============================
-- SEED DATA: CAR MODELS
-- ==============================
INSERT INTO car_models (brand_id, name, slug, body_type, is_active) VALUES
(1, 'Avanza', 'avanza', 'mpv', TRUE),
(1, 'Innova', 'innova', 'mpv', TRUE),
(1, 'Fortuner', 'fortuner', 'suv', TRUE),
(1, 'Rush', 'rush', 'suv', TRUE),
(1, 'Camry', 'camry', 'sedan', TRUE),
(1, 'Yaris', 'yaris', 'hatchback', TRUE),
(1, 'Vios', 'vios', 'sedan', TRUE),
(1, 'Hilux', 'hilux', 'pickup', TRUE),
(2, 'Jazz', 'jazz', 'hatchback', TRUE),
(2, 'City', 'city', 'sedan', TRUE),
(2, 'CR-V', 'cr-v', 'suv', TRUE),
(2, 'HR-V', 'hr-v', 'suv', TRUE),
(2, 'Mobilio', 'mobilio', 'mpv', TRUE),
(2, 'Brio', 'brio', 'hatchback', TRUE),
(2, 'Accord', 'accord', 'sedan', TRUE),
(3, 'Xpander', 'xpander', 'mpv', TRUE),
(3, 'Pajero Sport', 'pajero-sport', 'suv', TRUE),
(3, 'Triton', 'triton', 'pickup', TRUE),
(4, 'Ertiga', 'ertiga', 'mpv', TRUE),
(4, 'XL7', 'xl7', 'mpv', TRUE),
(5, 'Xenia', 'xenia', 'mpv', TRUE),
(5, 'Terios', 'terios', 'suv', TRUE),
(6, 'X-Trail', 'x-trail', 'suv', TRUE),
(6, 'Serena', 'serena', 'mpv', TRUE),
(7, 'X1', 'x1', 'suv', TRUE),
(7, 'X3', 'x3', 'suv', TRUE),
(7, '320i', '320i', 'sedan', TRUE),
(8, 'C-Class', 'c-class', 'sedan', TRUE),
(8, 'E-Class', 'e-class', 'sedan', TRUE),
(8, 'GLC', 'glc', 'suv', TRUE);

-- ==============================
-- SEED DATA: CAR VARIANTS
-- ==============================
INSERT INTO car_variants (model_id, name, year_start, year_end, transmission_type, fuel_type, engine_cc, is_active) VALUES
(1, '1.3 E MT', 2020, 2024, 'manual', 'bensin', 1298, TRUE),
(1, '1.3 E CVT', 2020, 2024, 'automatic', 'bensin', 1298, TRUE),
(1, '1.5 G MT', 2020, 2024, 'manual', 'bensin', 1496, TRUE),
(1, '1.5 G CVT', 2020, 2024, 'automatic', 'bensin', 1496, TRUE),
(2, '2.0 V MT', 2020, 2024, 'manual', 'bensin', 1998, TRUE),
(2, '2.0 V AT', 2020, 2024, 'automatic', 'bensin', 1998, TRUE),
(2, '2.4 V AT', 2020, 2024, 'automatic', 'bensin', 2393, TRUE),
(3, '2.4 VRZ AT', 2020, 2024, 'automatic', 'bensin', 2393, TRUE),
(3, '2.8 GR-S AT', 2020, 2024, 'automatic', 'diesel', 2755, TRUE),
(10, 'RS CVT', 2020, 2024, 'automatic', 'bensin', 1498, TRUE),
(10, 'SE CVT', 2020, 2024, 'automatic', 'bensin', 1498, TRUE),
(11, '1.5 Turbo CVT', 2020, 2024, 'automatic', 'bensin', 1498, TRUE),
(11, '2.0 AT', 2020, 2024, 'automatic', 'bensin', 1997, TRUE),
(12, '1.5 S CVT', 2020, 2024, 'automatic', 'bensin', 1498, TRUE),
(12, '1.8 Prestige CVT', 2020, 2024, 'automatic', 'bensin', 1799, TRUE),
(16, 'Exceed AT', 2020, 2024, 'automatic', 'bensin', 1499, TRUE),
(16, 'Ultimate AT', 2020, 2024, 'automatic', 'bensin', 1499, TRUE),
(17, '4x2 AT', 2020, 2024, 'automatic', 'diesel', 2442, TRUE),
(17, '4x4 AT', 2020, 2024, 'automatic', 'diesel', 2442, TRUE);

-- ==============================
-- SEED DATA: CAR COLORS
-- ==============================
INSERT INTO car_colors (name, hex_code) VALUES
('Putih', '#FFFFFF'),
('Hitam', '#000000'),
('Silver', '#C0C0C0'),
('Abu-abu', '#808080'),
('Merah', '#FF0000'),
('Biru', '#0000FF'),
('Hijau', '#00FF00'),
('Kuning', '#FFFF00'),
('Coklat', '#8B4513'),
('Emas', '#FFD700'),
('Bronze', '#CD7F32'),
('Orange', '#FFA500'),
('Ungu', '#800080'),
('Navy', '#000080'),
('Maroon', '#800000');

-- ==============================
-- SEED DATA: INSPECTION CATEGORIES
-- ==============================
INSERT INTO inspection_categories (name, slug, description, order_index) VALUES
('Eksterior', 'eksterior', 'Pemeriksaan kondisi eksterior kendaraan', 1),
('Interior', 'interior', 'Pemeriksaan kondisi interior kendaraan', 2),
('Mesin', 'mesin', 'Pemeriksaan kondisi mesin dan performa', 3),
('Transmisi', 'transmisi', 'Pemeriksaan sistem transmisi', 4),
('Rangka & Suspensi', 'rangka-suspensi', 'Pemeriksaan kondisi rangka dan sistem suspensi', 5),
('Rem', 'rem', 'Pemeriksaan sistem pengereman', 6),
('Ban & Velg', 'ban-velg', 'Pemeriksaan kondisi ban dan velg', 7),
('Listrik & Elektronik', 'listrik-elektronik', 'Pemeriksaan sistem kelistrikan', 8),
('Dokumen', 'dokumen', 'Verifikasi kelengkapan dokumen', 9),
('Safety', 'safety', 'Pemeriksaan fitur keselamatan', 10);

-- ==============================
-- SEED DATA: INSPECTION ITEMS (160 items)
-- ==============================
INSERT INTO inspection_items (category_id, name, description, order_index, is_active) VALUES
-- Eksterior (20 items)
(1, 'Cat Body', 'Kondisi cat body keseluruhan', 1, TRUE),
(1, 'Panel Depan', 'Kondisi panel depan (bumper, grille)', 2, TRUE),
(1, 'Panel Belakang', 'Kondisi panel belakang (bumper, trunk)', 3, TRUE),
(1, 'Fender Depan Kiri', 'Kondisi fender depan kiri', 4, TRUE),
(1, 'Fender Depan Kanan', 'Kondisi fender depan kanan', 5, TRUE),
(1, 'Fender Belakang Kiri', 'Kondisi fender belakang kiri', 6, TRUE),
(1, 'Fender Belakang Kanan', 'Kondisi fender belakang kanan', 7, TRUE),
(1, 'Pintu Depan Kiri', 'Kondisi pintu depan kiri', 8, TRUE),
(1, 'Pintu Depan Kanan', 'Kondisi pintu depan kanan', 9, TRUE),
(1, 'Pintu Belakang Kiri', 'Kondisi pintu belakang kiri', 10, TRUE),
(1, 'Pintu Belakang Kanan', 'Kondisi pintu belakang kanan', 11, TRUE),
(1, 'Hood/Kap Mesin', 'Kondisi kap mesin', 12, TRUE),
(1, 'Atap/Roof', 'Kondisi atap kendaraan', 13, TRUE),
(1, 'Kaca Depan', 'Kondisi kaca depan', 14, TRUE),
(1, 'Kaca Belakang', 'Kondisi kaca belakang', 15, TRUE),
(1, 'Kaca Jendela Kiri', 'Kondisi kaca jendela kiri', 16, TRUE),
(1, 'Kaca Jendela Kanan', 'Kondisi kaca jendela kanan', 17, TRUE),
(1, 'Lampu Depan', 'Kondisi lampu depan (headlamp)', 18, TRUE),
(1, 'Lampu Belakang', 'Kondisi lampu belakang (taillight)', 19, TRUE),
(1, 'Kaca Spion', 'Kondisi kaca spion kiri dan kanan', 20, TRUE),

-- Interior (20 items)
(2, 'Dashboard', 'Kondisi dashboard', 1, TRUE),
(2, 'Setir/Steering Wheel', 'Kondisi setir', 2, TRUE),
(2, 'Jok Depan Kiri', 'Kondisi jok pengemudi', 3, TRUE),
(2, 'Jok Depan Kanan', 'Kondisi jok penumpang depan', 4, TRUE),
(2, 'Jok Baris Kedua', 'Kondisi jok baris kedua', 5, TRUE),
(2, 'Jok Baris Ketiga', 'Kondisi jok baris ketiga (jika ada)', 6, TRUE),
(2, 'Karpet Lantai', 'Kondisi karpet lantai', 7, TRUE),
(2, 'Plafon/Headliner', 'Kondisi plafon interior', 8, TRUE),
(2, 'Panel Pintu Kiri', 'Kondisi panel interior pintu kiri', 9, TRUE),
(2, 'Panel Pintu Kanan', 'Kondisi panel interior pintu kanan', 10, TRUE),
(2, 'AC', 'Fungsi AC dan pendinginan', 11, TRUE),
(2, 'Audio System', 'Fungsi sistem audio', 12, TRUE),
(2, 'Power Window', 'Fungsi power window', 13, TRUE),
(2, 'Central Lock', 'Fungsi central lock', 14, TRUE),
(2, 'Seat Adjuster', 'Fungsi pengaturan jok', 15, TRUE),
(2, 'Sunroof', 'Kondisi sunroof (jika ada)', 16, TRUE),
(2, 'Odometer', 'Fungsi odometer', 17, TRUE),
(2, 'Speedometer', 'Fungsi speedometer', 18, TRUE),
(2, 'Indikator Dashboard', 'Fungsi semua indikator dashboard', 19, TRUE),
(2, 'Bau Interior', 'Bau interior (tidak apek/moldy)', 20, TRUE),

-- Mesin (25 items)
(3, 'Mesin Start', 'Fungsi starter mesin', 1, TRUE),
(3, 'Suara Mesin', 'Suara mesin (normal/tidak berisik)', 2, TRUE),
(3, 'Getaran Mesin', 'Getaran mesin (normal/tidak berlebihan)', 3, TRUE),
(3, 'Oli Mesin', 'Kondisi dan level oli mesin', 4, TRUE),
(3, 'Coolant', 'Kondisi dan level coolant', 5, TRUE),
(3, 'Minyak Rem', 'Kondisi dan level minyak rem', 6, TRUE),
(3, 'Oli Power Steering', 'Kondisi oli power steering', 7, TRUE),
(3, 'Radiator', 'Kondisi radiator', 8, TRUE),
(3, 'Selang Radiator', 'Kondisi selang radiator', 9, TRUE),
(3, 'Kipas Radiator', 'Fungsi kipas radiator', 10, TRUE),
(3, 'Thermostat', 'Fungsi thermostat', 11, TRUE),
(3, 'Timing Belt/Chain', 'Kondisi timing belt/chain', 12, TRUE),
(3, 'V-Belt', 'Kondisi V-belt', 13, TRUE),
(3, 'Alternator', 'Fungsi alternator', 14, TRUE),
(3, 'Starter Motor', 'Fungsi starter motor', 15, TRUE),
(3, 'Aki/Battery', 'Kondisi aki', 16, TRUE),
(3, 'Kabel Aki', 'Kondisi kabel aki', 17, TRUE),
(3, 'Ignition Coil', 'Kondisi ignition coil', 18, TRUE),
(3, 'Busi/Spark Plug', 'Kondisi busi', 19, TRUE),
(3, 'Filter Udara', 'Kondisi filter udara', 20, TRUE),
(3, 'Filter Oli', 'Kondisi filter oli', 21, TRUE),
(3, 'Filter AC', 'Kondisi filter AC', 22, TRUE),
(3, 'Exhaust System', 'Kondisi exhaust system', 23, TRUE),
(3, 'Catalytic Converter', 'Kondisi catalytic converter', 24, TRUE),
(3, 'Fuel Pump', 'Fungsi fuel pump', 25, TRUE),

-- Transmisi (10 items)
(4, 'Pergeseran GigI', 'Pergeseran gigi (halus/tidak tersendat)', 1, TRUE),
(4, 'Kopling (Manual)', 'Fungsi kopling (untuk transmisi manual)', 2, TRUE),
(4, 'Oli Transmisi', 'Kondisi dan level oli transmisi', 3, TRUE),
(4, 'Mounting Mesin', 'Kondisi mounting mesin', 4, TRUE),
(4, 'Mounting Transmisi', 'Kondisi mounting transmisi', 5, TRUE),
(4, 'Persneling/Shift Lever', 'Kondisi tuas persneling', 6, TRUE),
(4, 'CVT Belt (CVT)', 'Kondisi CVT belt (untuk CVT)', 7, TRUE),
(4, 'Torque Converter (AT)', 'Kondisi torque converter (untuk AT)', 8, TRUE),
(4, 'Differential', 'Kondisi differential', 9, TRUE),
(4, 'Transfer Case (4WD)', 'Kondisi transfer case (untuk 4WD)', 10, TRUE),

-- Rangka & Suspensi (15 items)
(5, 'Chassis/Rangka', 'Kondisi chassis utama', 1, TRUE),
(5, 'Suspensi Depan', 'Kondisi suspensi depan', 2, TRUE),
(5, 'Suspensi Belakang', 'Kondisi suspensi belakang', 3, TRUE),
(5, 'Shock Breaker Depan', 'Kondisi shock breaker depan', 4, TRUE),
(5, 'Shock Breaker Belakang', 'Kondisi shock breaker belakang', 5, TRUE),
(5, 'Per/Coil Spring', 'Kondisi per/coil spring', 6, TRUE),
(5, 'Ball Joint', 'Kondisi ball joint', 7, TRUE),
(5, 'Tie Rod', 'Kondisi tie rod', 8, TRUE),
(5, 'Control Arm', 'Kondisi control arm', 9, TRUE),
(5, 'Stabilizer Bar', 'Kondisi stabilizer bar', 10, TRUE),
(5, 'Bushings', 'Kondisi bushings', 11, TRUE),
(5, 'Knuckle', 'Kondisi knuckle', 12, TRUE),
(5, 'Crossmember', 'Kondisi crossmember', 13, TRUE),
(5, 'Lower Arm', 'Kondisi lower arm', 14, TRUE),
(5, 'Upper Arm', 'Kondisi upper arm', 15, TRUE),

-- Rem (10 items)
(6, 'Rem Depan (Disc)', 'Kondisi rem depan', 1, TRUE),
(6, 'Rem Belakang (Disc/Drum)', 'Kondisi rem belakang', 2, TRUE),
(6, 'Kampas Rem/Pad', 'Tebal kampas rem', 3, TRUE),
(6, 'Disc Brake/Rotor', 'Kondisi disc brake rotor', 4, TRUE),
(6, 'Master Rem', 'Fungsi master rem', 5, TRUE),
(6, 'ABS', 'Fungsi ABS', 6, TRUE),
(7, 'Rem Parkir/Handbrake', 'Fungsi rem parkir', 7, TRUE),
(6, 'Brake Caliper', 'Kondisi brake caliper', 8, TRUE),
(6, 'Brake Line/Pipa Rem', 'Kondisi pipa rem', 9, TRUE),
(6, 'Brake Booster', 'Fungsi brake booster', 10, TRUE),

-- Ban & Velg (8 items)
(7, 'Ban Depan Kiri', 'Kondisi ban depan kiri', 1, TRUE),
(7, 'Ban Depan Kanan', 'Kondisi ban depan kanan', 2, TRUE),
(7, 'Ban Belakang Kiri', 'Kondisi ban belakang kiri', 3, TRUE),
(7, 'Ban Belakang Kanan', 'Kondisi ban belakang kanan', 4, TRUE),
(7, 'Ban Cadangan', 'Kondisi ban cadangan', 5, TRUE),
(7, 'Velg Depan', 'Kondisi velg depan', 6, TRUE),
(7, 'Velg Belakang', 'Kondisi velg belakang', 7, TRUE),
(7, 'Tekanan Ban', 'Tekanan angin ban', 8, TRUE),

-- Listrik & Elektronik (12 items)
(8, 'Lampu Utama', 'Fungsi lampu utama (low/high beam)', 1, TRUE),
(8, 'Lampu Rem', 'Fungsi lampu rem', 2, TRUE),
(8, 'Lampu Mundur', 'Fungsi lampu mundur', 3, TRUE),
(8, 'Lampu Sein/Sign', 'Fungsi lampu sein', 4, TRUE),
(8, 'Lampu Hazard', 'Fungsi lampu hazard', 5, TRUE),
(8, 'Lampu Interior', 'Fungsi lampu interior', 6, TRUE),
(8, 'Klakson', 'Fungsi klakson', 7, TRUE),
(8, 'Wiper Depan', 'Fungsi wiper depan', 8, TRUE),
(8, 'Wiper Belakang', 'Fungsi wiper belakang', 9, TRUE),
(8, 'Washer Fluid', 'Kondisi washer fluid', 10, TRUE),
(8, 'Power Outlet', 'Fungsi power outlet/charger', 11, TRUE),
(8, 'Alarm', 'Fungsi alarm kendaraan', 12, TRUE),

-- Dokumen (8 items)
(9, 'STNK', 'Kelengkapan dan keabsahan STNK', 1, TRUE),
(9, 'BPKB', 'Kelengkapan BPKB', 2, TRUE),
(9, 'Faktur', 'Kelengkapan faktur kendaraan', 3, TRUE),
(9, 'Buku Manual', 'Kelengkapan buku manual', 4, TRUE),
(9, 'Kunci Cadangan', 'Kelengkapan kunci cadangan', 5, TRUE),
(9, 'Buku Service', 'Kelengkapan buku service', 6, TRUE),
(9, 'Pajak Tahunan', 'Status pajak tahunan', 7, TRUE),
(9, 'Pajak 5 Tahunan', 'Status pajak 5 tahunan ( jika baru)', 8, TRUE),

-- Safety (12 items)
(10, 'Airbag', 'Kondisi airbag', 1, TRUE),
(10, 'Seatbelt Depan', 'Fungsi seatbelt depan', 2, TRUE),
(10, 'Seatbelt Belakang', 'Fungsi seatbelt belakang', 3, TRUE),
(10, 'ABS Sensor', 'Fungsi sensor ABS', 4, TRUE),
(10, 'ESP/Traction Control', 'Fungsi ESP/traction control', 5, TRUE),
(10, 'Hill Start Assist', 'Fungsi hill start assist', 6, TRUE),
(10, 'Blind Spot Monitor', 'Fungsi blind spot monitor', 7, TRUE),
(10, 'Lane Departure Warning', 'Fungsi lane departure warning', 8, TRUE),
(10, 'Camera Belakang', 'Fungsi kamera belakang', 9, TRUE),
(10, 'Sensor Parkir', 'Fungsi sensor parkir', 10, TRUE),
(10, 'Child Lock', 'Fungsi child lock', 11, TRUE),
(10, 'ISOFIX', 'Ketersediaan ISOFIX', 12, TRUE);

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

CREATE TRIGGER update_car_listings_updated_at BEFORE UPDATE ON car_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_inspections_updated_at BEFORE UPDATE ON car_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- SAMPLE LISTINGS (for testing)
-- ==============================
-- Note: These will need a valid seller_id from auth.users
-- Uncomment and modify after creating a user account

-- INSERT INTO car_listings (seller_id, variant_id, color_id, title, description, price, year, mileage, vehicle_condition, transaction_type, status, location_city, location_province)
-- VALUES
-- (UUID_HERE, 1, 1, 'Toyota Avanza 1.3 E MT 2022', 'Kondisi prima, satu tangan, service resmi', 195000000, 2022, 25000, 'bekas', 'jual', 'active', 'Jakarta Selatan', 'DKI Jakarta'),
-- (UUID_HERE, 10, 2, 'Honda Jazz RS CVT 2021', 'Full option, low KM', 275000000, 2021, 15000, 'bekas', 'jual', 'active', 'Bandung', 'Jawa Barat'),
-- (UUID_HERE, 16, 3, 'Mitsubishi Xpander Exceed 2023', 'Unit baru, dapat DP rendah', 320000000, 2023, 5000, 'baru', 'jual', 'active', 'Surabaya', 'Jawa Timur');

-- Done!
SELECT 'Quick start schema created successfully!' AS message;
