-- ==============================================================
-- FIX MISSING TABLES AND SEED DATA
-- Run this in Supabase SQL Editor
-- ==============================================================

-- ==============================
-- MISSING TABLE: profiles
-- ==============================
CREATE TABLE IF NOT EXISTS profiles (
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
-- MISSING TABLE: inspection_categories
-- ==============================
CREATE TABLE IF NOT EXISTS inspection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- MISSING TABLE: provinces
-- ==============================
CREATE TABLE IF NOT EXISTS provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID,
  code TEXT,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- MISSING TABLE: cities
-- ==============================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- ENABLE RLS ON NEW TABLES
-- ==============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view categories" ON inspection_categories FOR SELECT USING (true);
CREATE POLICY "Public can view provinces" ON provinces FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view cities" ON cities FOR SELECT USING (is_active = TRUE);

-- ==============================
-- SEED DATA: PROVINCES
-- ==============================
INSERT INTO provinces (id, name, code, is_active) VALUES
('11111111-1111-1111-1111-111111111001', 'DKI Jakarta', 'DKI', TRUE),
('11111111-1111-1111-1111-111111111002', 'Jawa Barat', 'JBR', TRUE),
('11111111-1111-1111-1111-111111111003', 'Jawa Tengah', 'JTG', TRUE),
('11111111-1111-1111-1111-111111111004', 'Jawa Timur', 'JTM', TRUE),
('11111111-1111-1111-1111-111111111005', 'Banten', 'BNT', TRUE),
('11111111-1111-1111-1111-111111111006', 'DI Yogyakarta', 'DIY', TRUE),
('11111111-1111-1111-1111-111111111007', 'Bali', 'BLI', TRUE)
ON CONFLICT (id) DO NOTHING;

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
('22222222-2222-2222-2222-222222222009', '11111111-1111-1111-1111-111111111003', 'Semarang', 'kota', TRUE),
('22222222-2222-2222-2222-222222222011', '11111111-1111-1111-1111-111111111004', 'Surabaya', 'kota', TRUE),
('22222222-2222-2222-2222-222222222012', '11111111-1111-1111-1111-111111111004', 'Malang', 'kota', TRUE),
('22222222-2222-2222-2222-222222222013', '11111111-1111-1111-1111-111111111005', 'Tangerang', 'kota', TRUE),
('22222222-2222-2222-2222-222222222015', '11111111-1111-1111-1111-111111111006', 'Yogyakarta', 'kota', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: INSPECTION CATEGORIES
-- ==============================
INSERT INTO inspection_categories (id, name, description, icon, display_order, total_items) VALUES
('77777777-7777-7777-7777-777777777001', 'Eksterior', 'Pemeriksaan kondisi eksterior kendaraan', 'car', 1, 20),
('77777777-7777-7777-7777-777777777002', 'Interior', 'Pemeriksaan kondisi interior kendaraan', 'seat', 2, 20),
('77777777-7777-7777-7777-777777777003', 'Mesin', 'Pemeriksaan kondisi mesin dan performa', 'engine', 3, 25),
('77777777-7777-7777-7777-777777777004', 'Transmisi', 'Pemeriksaan sistem transmisi', 'cog', 4, 10),
('77777777-7777-7777-7777-777777777005', 'Rangka & Suspensi', 'Pemeriksaan kondisi rangka dan suspensi', 'wrench', 5, 15),
('77777777-7777-7777-7777-777777777006', 'Rem', 'Pemeriksaan sistem pengereman', 'disc', 6, 10),
('77777777-7777-7777-7777-777777777007', 'Ban & Velg', 'Pemeriksaan kondisi ban dan velg', 'circle', 7, 8),
('77777777-7777-7777-7777-777777777008', 'Listrik & Elektronik', 'Pemeriksaan sistem kelistrikan', 'zap', 8, 12),
('77777777-7777-7777-7777-777777777009', 'Dokumen', 'Verifikasi kelengkapan dokumen', 'file-text', 9, 8),
('77777777-7777-7777-7777-777777777010', 'Safety', 'Pemeriksaan fitur keselamatan', 'shield', 10, 12)
ON CONFLICT (id) DO NOTHING;

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
('33333333-3333-3333-3333-333333333008', 'Mercedes-Benz', 'mercedes-benz', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/100px-Mercedes-Logo.svg.png', 'Germany', TRUE, 8)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: CAR MODELS
-- ==============================
INSERT INTO car_models (id, brand_id, name, slug, body_type, is_popular, display_order) VALUES
('44444444-4444-4444-4444-444444444001', '33333333-3333-3333-3333-333333333001', 'Avanza', 'avanza', 'mpv', TRUE, 1),
('44444444-4444-4444-4444-444444444002', '33333333-3333-3333-3333-333333333001', 'Innova', 'innova', 'mpv', TRUE, 2),
('44444444-4444-4444-4444-444444444003', '33333333-3333-3333-3333-333333333001', 'Fortuner', 'fortuner', 'suv', TRUE, 3),
('44444444-4444-4444-4444-444444444004', '33333333-3333-3333-3333-333333333001', 'Rush', 'rush', 'suv', TRUE, 4),
('44444444-4444-4444-4444-444444444009', '33333333-3333-3333-3333-333333333002', 'Jazz', 'jazz', 'hatchback', TRUE, 1),
('44444444-4444-4444-4444-444444444010', '33333333-3333-3333-3333-333333333002', 'City', 'city', 'sedan', TRUE, 2),
('44444444-4444-4444-4444-444444444011', '33333333-3333-3333-3333-333333333002', 'CR-V', 'cr-v', 'suv', TRUE, 3),
('44444444-4444-4444-4444-444444444012', '33333333-3333-3333-3333-333333333002', 'HR-V', 'hr-v', 'suv', TRUE, 4),
('44444444-4444-4444-4444-444444444016', '33333333-3333-3333-3333-333333333003', 'Xpander', 'xpander', 'mpv', TRUE, 1),
('44444444-4444-4444-4444-444444444017', '33333333-3333-3333-3333-333333333003', 'Pajero Sport', 'pajero-sport', 'suv', TRUE, 2)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: CAR VARIANTS
-- ==============================
INSERT INTO car_variants (id, model_id, name, engine_capacity, transmission, fuel_type, seat_count, price_new) VALUES
('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', '1.3 E MT', 1.3, 'manual', 'bensin', 7, 215000000),
('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', '1.3 E CVT', 1.3, 'automatic', 'bensin', 7, 230000000),
('55555555-5555-5555-5555-555555555006', '44444444-4444-4444-4444-444444444002', '2.0 V AT', 2.0, 'automatic', 'bensin', 7, 375000000),
('55555555-5555-5555-5555-555555555009', '44444444-4444-4444-4444-444444444003', '2.8 GR-S AT', 2.8, 'automatic', 'diesel', 7, 620000000),
('55555555-5555-5555-5555-555555555012', '44444444-4444-4444-4444-444444444011', '1.5 Turbo CVT', 1.5, 'automatic', 'bensin', 5, 520000000),
('55555555-5555-5555-5555-555555555014', '44444444-4444-4444-4444-444444444012', '1.5 S CVT', 1.5, 'automatic', 'bensin', 5, 380000000),
('55555555-5555-5555-5555-555555555016', '44444444-4444-4444-4444-444444444016', 'Exceed AT', 1.5, 'automatic', 'bensin', 7, 320000000)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: CAR COLORS
-- ==============================
INSERT INTO car_colors (id, name, hex_code, is_metallic, is_popular) VALUES
('66666666-6666-6666-6666-666666666001', 'Putih', '#FFFFFF', FALSE, TRUE),
('66666666-6666-6666-6666-666666666002', 'Hitam', '#000000', FALSE, TRUE),
('66666666-6666-6666-6666-666666666003', 'Silver', '#C0C0C0', TRUE, TRUE),
('66666666-6666-6666-6666-666666666004', 'Abu-abu', '#808080', TRUE, TRUE),
('66666666-6666-6666-6666-666666666005', 'Merah', '#FF0000', FALSE, TRUE),
('66666666-6666-6666-6666-666666666006', 'Biru', '#0000FF', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: INSPECTION ITEMS
-- ==============================
INSERT INTO inspection_items (id, category_id, name, description, display_order, is_critical) VALUES
-- Eksterior
('88888888-8888-8888-8888-888888888001', '77777777-7777-7777-7777-777777777001', 'Cat Body', 'Kondisi cat body keseluruhan', 1, TRUE),
('88888888-8888-8888-8888-888888888002', '77777777-7777-7777-7777-777777777001', 'Panel Depan', 'Kondisi panel depan', 2, FALSE),
('88888888-8888-8888-8888-888888888003', '77777777-7777-7777-7777-777777777001', 'Kaca Depan', 'Kondisi kaca depan', 3, TRUE),
('88888888-8888-8888-8888-888888888004', '77777777-7777-7777-7777-777777777001', 'Lampu Depan', 'Kondisi lampu depan', 4, TRUE),
-- Interior
('88888888-8888-8888-8888-888888888011', '77777777-7777-7777-7777-777777777002', 'Dashboard', 'Kondisi dashboard', 1, FALSE),
('88888888-8888-8888-8888-888888888012', '77777777-7777-7777-7777-777777777002', 'Setir', 'Kondisi setir', 2, FALSE),
('88888888-8888-8888-8888-888888888013', '77777777-7777-7777-7777-777777777002', 'AC', 'Fungsi AC', 3, TRUE),
-- Mesin
('88888888-8888-8888-8888-888888888021', '77777777-7777-7777-7777-777777777003', 'Mesin Start', 'Fungsi starter mesin', 1, TRUE),
('88888888-8888-8888-8888-888888888022', '77777777-7777-7777-7777-777777777003', 'Suara Mesin', 'Suara mesin normal', 2, TRUE),
('88888888-8888-8888-8888-888888888023', '77777777-7777-7777-7777-777777777003', 'Oli Mesin', 'Kondisi oli mesin', 3, TRUE),
-- Rem
('88888888-8888-8888-8888-888888888041', '77777777-7777-7777-7777-777777777006', 'Rem Depan', 'Kondisi rem depan', 1, TRUE),
('88888888-8888-8888-8888-888888888042', '77777777-7777-7777-7777-777777777006', 'Rem Belakang', 'Kondisi rem belakang', 2, TRUE),
('88888888-8888-8888-8888-888888888043', '77777777-7777-7777-7777-777777777006', 'ABS', 'Fungsi ABS', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: DEMO PROFILE
-- ==============================
INSERT INTO profiles (id, email, full_name, role, is_verified) VALUES
('99999999-9999-9999-9999-999999999001', 'demo@carmarket.id', 'Demo Seller', 'seller', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: CAR LISTINGS
-- ==============================
INSERT INTO car_listings (id, listing_number, user_id, brand_id, model_id, variant_id, year, exterior_color_id, fuel, transmission, body_type, mileage, transaction_type, condition, price_cash, city, province, status, title, description, slug, published_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'CL-2024001', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444001', '55555555-5555-5555-5555-555555555002', 2022, '66666666-6666-6666-6666-666666666001', 'bensin', 'automatic', 'mpv', 25000, 'jual', 'bekas', 225000000, 'Jakarta Selatan', 'DKI Jakarta', 'active', 'Toyota Avanza 1.3 E CVT 2022', 'Mobil satu tangan, service resmi. Kondisi mulus.', 'toyota-avanza-2022', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'CL-2024002', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444011', '55555555-5555-5555-5555-555555555012', 2021, '66666666-6666-6666-6666-666666666002', 'bensin', 'automatic', 'suv', 18000, 'jual', 'bekas', 490000000, 'Bandung', 'Jawa Barat', 'active', 'Honda CR-V 1.5 Turbo 2021', 'Full option, low KM, kondisi seperti baru.', 'honda-crv-2021', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'CL-2024003', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333003', '44444444-4444-4444-4444-444444444016', '55555555-5555-5555-5555-555555555016', 2023, '66666666-6666-6666-6666-666666666003', 'bensin', 'automatic', 'mpv', 5000, 'jual', 'baru', 315000000, 'Surabaya', 'Jawa Timur', 'active', 'Mitsubishi Xpander Exceed 2023', 'Unit baru, DP ringan, bisa kredit.', 'mitsubishi-xpander-2023', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'CL-2024004', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444002', '55555555-5555-5555-5555-555555555006', 2020, '66666666-6666-6666-6666-666666666004', 'bensin', 'automatic', 'mpv', 45000, 'jual', 'bekas', 350000000, 'Semarang', 'Jawa Tengah', 'active', 'Toyota Innova 2.0 V AT 2020', 'Innova AT, kondisi terawat.', 'toyota-innova-2020', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'CL-2024005', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333002', '44444444-4444-4444-4444-444444444012', '55555555-5555-5555-5555-555555555014', 2022, '66666666-6666-6666-6666-666666666005', 'bensin', 'automatic', 'suv', 12000, 'jual', 'bekas', 365000000, 'Jakarta Pusat', 'DKI Jakarta', 'active', 'Honda HR-V 1.5 S CVT 2022', 'Tampilan sporty, fitur lengkap.', 'honda-hrv-2022', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'CL-2024006', '99999999-9999-9999-9999-999999999001', '33333333-3333-3333-3333-333333333001', '44444444-4444-4444-4444-444444444003', '55555555-5555-5555-5555-555555555009', 2021, '66666666-6666-6666-6666-666666666006', 'diesel', 'automatic', 'suv', 35000, 'jual', 'bekas', 580000000, 'Tangerang', 'Banten', 'active', 'Toyota Fortuner 2.8 GR-S 2021', 'Fortuner Diesel GR-S, 4WD.', 'toyota-fortuner-2021', NOW())
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: CAR IMAGES
-- ==============================
INSERT INTO car_images (id, car_listing_id, image_url, is_primary, display_order) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'https://images.unsplash.com/photo-1568844293986-8c1a5e37dbbb?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'https://images.unsplash.com/photo-1541506638840-5b3a70a18f5e?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', TRUE, 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb06', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- ==============================
-- SEED DATA: CAR FEATURES
-- ==============================
INSERT INTO car_features (car_listing_id, sunroof, cruise_control, rear_camera, keyless_start, push_start, abs, airbag, bluetooth, apple_carplay, android_auto) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (car_listing_id) DO NOTHING;

-- ==============================
-- SEED DATA: CAR INSPECTIONS
-- ==============================
INSERT INTO car_inspections (id, car_listing_id, inspector_name, inspection_place, inspection_date, total_points, passed_points, failed_points, inspection_score, accident_free, flood_free, risk_level, overall_grade, recommended, status) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccc01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'Inspector Demo', 'Bengkel Jakarta', '2024-01-15', 160, 152, 8, 95.00, TRUE, TRUE, 'low', 'A', TRUE, 'completed'),
('cccccccc-cccc-cccc-cccc-cccccccccc02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'Inspector Demo', 'Bengkel Bandung', '2024-01-10', 160, 148, 12, 92.50, TRUE, TRUE, 'low', 'A-', TRUE, 'completed'),
('cccccccc-cccc-cccc-cccc-cccccccccc03', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'Inspector Demo', 'Bengkel Tangerang', '2024-01-12', 160, 155, 5, 96.88, TRUE, TRUE, 'low', 'A+', TRUE, 'completed')
ON CONFLICT (id) DO NOTHING;

-- Done!
SELECT 'Database setup completed successfully!' AS message;
