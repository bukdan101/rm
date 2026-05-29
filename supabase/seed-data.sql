-- ==============================================================
-- SEED DATA: Popular Car Brands for Indonesia
-- Run this in Supabase SQL Editor after creating tables
-- ==============================================================

-- Insert popular car brands
INSERT INTO brands (id, name, slug, logo_url, country, is_popular, display_order) VALUES
('brand-toyota', 'Toyota', 'toyota', '/brands/toyota.png', 'Japan', true, 1),
('brand-honda', 'Honda', 'honda', '/brands/honda.png', 'Japan', true, 2),
('brand-mitsubishi', 'Mitsubishi', 'mitsubishi', '/brands/mitsubishi.png', 'Japan', true, 3),
('brand-suzuki', 'Suzuki', 'suzuki', '/brands/suzuki.png', 'Japan', true, 4),
('brand-daihatsu', 'Daihatsu', 'daihatsu', '/brands/daihatsu.png', 'Japan', true, 5),
('brand-nissan', 'Nissan', 'nissan', '/brands/nissan.png', 'Japan', true, 6),
('brand-mazda', 'Mazda', 'mazda', '/brands/mazda.png', 'Japan', false, 7),
('brand-hyundai', 'Hyundai', 'hyundai', '/brands/hyundai.png', 'South Korea', true, 8),
('brand-kia', 'Kia', 'kia', '/brands/kia.png', 'South Korea', false, 9),
('brand-wuling', 'Wuling', 'wuling', '/brands/wuling.png', 'China', true, 10),
('brand-bmw', 'BMW', 'bmw', '/brands/bmw.png', 'Germany', false, 11),
('brand-mercedes', 'Mercedes-Benz', 'mercedes-benz', '/brands/mercedes.png', 'Germany', false, 12),
('brand-audi', 'Audi', 'audi', '/brands/audi.png', 'Germany', false, 13),
('brand-volkswagen', 'Volkswagen', 'volkswagen', '/brands/vw.png', 'Germany', false, 14),
('brand-lexus', 'Lexus', 'lexus', '/brands/lexus.png', 'Japan', false, 15),
('brand-toyota-veloz', 'Toyota Veloz', 'toyota-veloz', '/brands/toyota.png', 'Japan', false, 16),
('brand-honda-jazz', 'Honda Jazz', 'honda-jazz', '/brands/honda.png', 'Japan', false, 17),
('brand-mitsubishi-xpander', 'Mitsubishi Xpander', 'mitsubishi-xpander', '/brands/mitsubishi.png', 'Japan', false, 18)
ON CONFLICT (slug) DO NOTHING;

-- Insert car body types
INSERT INTO car_body_types (id, name, description, icon_url) VALUES
('body-sedan', 'Sedan', 'Mobil penumpang 4 pintu dengan bagasi terpisah', '/icons/sedan.svg'),
('body-suv', 'SUV', 'Sport Utility Vehicle, cocok untuk segala medan', '/icons/suv.svg'),
('body-mpv', 'MPV', 'Multi Purpose Vehicle, mobil keluarga', '/icons/mpv.svg'),
('body-hatchback', 'Hatchback', 'Mobil kompak dengan bagasi terintegrasi', '/icons/hatchback.svg'),
('body-pickup', 'Pickup', 'Mobil komersial dengan bak terbuka', '/icons/pickup.svg'),
('body-van', 'Van', 'Mobil pengangkut penumpang atau barang', '/icons/van.svg'),
('body-coupe', 'Coupe', 'Mobil 2 pintu bergaya sporty', '/icons/coupe.svg'),
('body-convertible', 'Convertible', 'Mobil dengan atap yang bisa dibuka', '/icons/convertible.svg'),
('body-wagon', 'Station Wagon', 'Mobil keluarga dengan ruang bagasi luas', '/icons/wagon.svg')
ON CONFLICT DO NOTHING;

-- Insert fuel types
INSERT INTO car_fuel_types (id, name, description, icon_url) VALUES
('fuel-bensin', 'Bensin', 'Bahan bakar bensin/pertalite/pertamax', '/icons/fuel-bensin.svg'),
('fuel-diesel', 'Diesel', 'Bahan bakar solar/diesel', '/icons/fuel-diesel.svg'),
('fuel-electric', 'Electric', 'Kendaraan listrik murni (BEV)', '/icons/fuel-electric.svg'),
('fuel-hybrid', 'Hybrid', 'Kombinasi mesin bensin dan motor listrik', '/icons/fuel-hybrid.svg')
ON CONFLICT DO NOTHING;

-- Insert transmissions
INSERT INTO car_transmissions (id, name, description) VALUES
('trans-auto', 'Automatic', 'Transmisi otomatis'),
('trans-manual', 'Manual', 'Transmisi manual')
ON CONFLICT DO NOTHING;

-- Insert popular car colors
INSERT INTO car_colors (id, name, hex_code, is_metallic, is_popular) VALUES
('color-black', 'Hitam', '#000000', false, true),
('color-white', 'Putih', '#FFFFFF', false, true),
('color-silver', 'Silver', '#C0C0C0', true, true),
('color-gray', 'Abu-abu', '#808080', true, true),
('color-red', 'Merah', '#FF0000', false, true),
('color-blue', 'Biru', '#0000FF', false, true),
('color-green', 'Hijau', '#008000', false, false),
('color-brown', 'Coklat', '#8B4513', false, false),
('color-gold', 'Emas', '#FFD700', true, false),
('color-orange', 'Orange', '#FFA500', false, false),
('color-purple', 'Ungu', '#800080', false, false),
('color-yellow', 'Kuning', '#FFFF00', false, false),
('color-pearl-white', 'Putih Pearl', '#F5F5F5', true, true),
('color-midnight-blue', 'Biru Malam', '#191970', true, false)
ON CONFLICT DO NOTHING;

-- Insert Indonesian provinces
INSERT INTO provinces (id, code, name) VALUES
('prov-dki', 'DKI', 'DKI Jakarta'),
('prov-jabar', 'JB', 'Jawa Barat'),
('prov-jateng', 'JT', 'Jawa Tengah'),
('prov-jatim', 'JI', 'Jawa Timur'),
('prov-banten', 'BT', 'Banten'),
('prov-diy', 'YO', 'DI Yogyakarta'),
('prov-bali', 'BA', 'Bali'),
('prov-sumut', 'SU', 'Sumatera Utara'),
('prov-sumbar', 'SB', 'Sumatera Barat'),
('prov-sulsel', 'SN', 'Sulawesi Selatan'),
('prov-kaltim', 'KI', 'Kalimantan Timur'),
('prov-kalsel', 'KS', 'Kalimantan Selatan')
ON CONFLICT DO NOTHING;

-- Insert Indonesian cities
INSERT INTO cities (id, province_id, name, slug) VALUES
('city-jaksel', 'prov-dki', 'Jakarta Selatan', 'jakarta-selatan'),
('city-jakpus', 'prov-dki', 'Jakarta Pusat', 'jakarta-pusat'),
('city-jaktim', 'prov-dki', 'Jakarta Timur', 'jakarta-timur'),
('city-jakbar', 'prov-dki', 'Jakarta Barat', 'jakarta-barat'),
('city-jakut', 'prov-dki', 'Jakarta Utara', 'jakarta-utara'),
('city-depok', 'prov-jabar', 'Depok', 'depok'),
('city-bekasi', 'prov-jabar', 'Bekasi', 'bekasi'),
('city-bogor', 'prov-jabar', 'Bogor', 'bogor'),
('city-bandung', 'prov-jabar', 'Bandung', 'bandung'),
('city-tangerang', 'prov-banten', 'Tangerang', 'tangerang'),
('city-tangsel', 'prov-banten', 'Tangerang Selatan', 'tangerang-selatan'),
('city-serang', 'prov-banten', 'Serang', 'serang'),
('city-semarang', 'prov-jateng', 'Semarang', 'semarang'),
('city-solo', 'prov-jateng', 'Solo', 'solo'),
('city-yogya', 'prov-diy', 'Yogyakarta', 'yogyakarta'),
('city-surabaya', 'prov-jatim', 'Surabaya', 'surabaya'),
('city-malang', 'prov-jatim', 'Malang', 'malang'),
('city-denpasar', 'prov-bali', 'Denpasar', 'denpasar')
ON CONFLICT DO NOTHING;

-- Insert credit packages for tokens
INSERT INTO credit_packages (id, name, credits, price, bonus_credits, is_popular, display_order) VALUES
('pkg-50', 'Starter', 50, 50000, 0, false, 1),
('pkg-100', 'Basic', 100, 95000, 5, true, 2),
('pkg-250', 'Standard', 250, 225000, 15, false, 3),
('pkg-500', 'Premium', 500, 425000, 50, false, 4),
('pkg-1000', 'Enterprise', 1000, 800000, 150, false, 5)
ON CONFLICT DO NOTHING;

-- Insert inspection categories
INSERT INTO inspection_categories (id, name, description, icon, display_order, total_items) VALUES
('cat-eksterior', 'Eksterior', 'Pemeriksaan bagian luar kendaraan', 'car', 1, 45),
('cat-interior', 'Interior', 'Pemeriksaan bagian dalam kendaraan', 'armchair', 2, 35),
('cat-mesin', 'Mesin', 'Pemeriksaan mesin dan performa', 'cog', 3, 40),
('cat-rangka', 'Rangka & Chassis', 'Pemeriksaan struktur kendaraan', 'wrench', 4, 25),
('cat-elektrikal', 'Elektrikal', 'Pemeriksaan sistem kelistrikan', 'zap', 5, 15)
ON CONFLICT DO NOTHING;
