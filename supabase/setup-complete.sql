-- ==============================================================
-- AUTOMARKET DATABASE SETUP
-- Jalankan file ini di Supabase SQL Editor
-- ==============================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table (must exist first)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'dealer', 'admin', 'inspector')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    promo_notifications BOOLEAN DEFAULT false,
    chat_notifications BOOLEAN DEFAULT true,
    price_drop_notifications BOOLEAN DEFAULT true,
    language TEXT DEFAULT 'id',
    currency TEXT DEFAULT 'IDR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    logo_url TEXT,
    country TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID REFERENCES provinces(id),
    name TEXT NOT NULL,
    slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Create dealers table
CREATE TABLE IF NOT EXISTS dealers (
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
    city_id UUID REFERENCES cities(id),
    province_id UUID REFERENCES provinces(id),
    postal_code TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    total_listings INT DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    subscription_tier TEXT DEFAULT 'free',
    subscription_ends_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Create car_models table
CREATE TABLE IF NOT EXISTS car_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    body_type TEXT,
    is_popular BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Create car_variants table
CREATE TABLE IF NOT EXISTS car_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    engine_capacity INT,
    transmission TEXT,
    fuel_type TEXT,
    seat_count INT,
    price_new BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Create car_colors table
CREATE TABLE IF NOT EXISTS car_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_code TEXT,
    is_metallic BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Create car_listings table
CREATE TABLE IF NOT EXISTS car_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_number TEXT UNIQUE,
    user_id UUID REFERENCES profiles(id),
    dealer_id UUID REFERENCES dealers(id),
    brand_id UUID REFERENCES brands(id),
    model_id UUID REFERENCES car_models(id),
    variant_id UUID REFERENCES car_variants(id),
    year INT,
    exterior_color_id UUID REFERENCES car_colors(id),
    interior_color_id UUID REFERENCES car_colors(id),
    fuel TEXT,
    transmission TEXT,
    body_type TEXT,
    engine_capacity INT,
    seat_count INT,
    mileage INT,
    vin_number TEXT,
    plate_number TEXT,
    transaction_type TEXT DEFAULT 'jual',
    condition TEXT DEFAULT 'bekas',
    price_cash BIGINT,
    price_credit BIGINT,
    price_negotiable BOOLEAN DEFAULT true,
    city TEXT,
    province TEXT,
    city_id UUID REFERENCES cities(id),
    province_id UUID REFERENCES provinces(id),
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'rejected', 'deleted')),
    sold_at TIMESTAMP,
    expired_at TIMESTAMP,
    rejected_reason TEXT,
    title TEXT,
    description TEXT,
    meta_title TEXT,
    meta_description TEXT,
    slug TEXT UNIQUE,
    published_at TIMESTAMP,
    featured_until TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP
);

-- 12. Create car_images table
CREATE TABLE IF NOT EXISTS car_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. Create car_features table
CREATE TABLE IF NOT EXISTS car_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE UNIQUE,
    sunroof BOOLEAN DEFAULT false,
    cruise_control BOOLEAN DEFAULT false,
    rear_camera BOOLEAN DEFAULT false,
    front_camera BOOLEAN DEFAULT false,
    keyless_start BOOLEAN DEFAULT false,
    push_start BOOLEAN DEFAULT false,
    service_book BOOLEAN DEFAULT false,
    airbag BOOLEAN DEFAULT false,
    abs BOOLEAN DEFAULT false,
    esp BOOLEAN DEFAULT false,
    hill_start BOOLEAN DEFAULT false,
    auto_park BOOLEAN DEFAULT false,
    lane_keep BOOLEAN DEFAULT false,
    adaptive_cruise BOOLEAN DEFAULT false,
    blind_spot BOOLEAN DEFAULT false,
    wireless_charger BOOLEAN DEFAULT false,
    apple_carplay BOOLEAN DEFAULT false,
    android_auto BOOLEAN DEFAULT false,
    bluetooth BOOLEAN DEFAULT false,
    navigation BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Create wallets table (for tokens)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE UNIQUE,
    balance INT DEFAULT 0,
    total_earned INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_owner CHECK (user_id IS NOT NULL OR dealer_id IS NOT NULL)
);

-- 15. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund', 'registration_bonus', 'admin_adjustment')),
    amount INT NOT NULL,
    balance_before INT NOT NULL,
    balance_after INT NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 16. Create credit_packages table
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price INT NOT NULL,
    credits INT NOT NULL,
    bonus_credits INT DEFAULT 0,
    is_for_dealer BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 17. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    last_message TEXT,
    last_message_at TIMESTAMP,
    last_message_by UUID REFERENCES profiles(id),
    buyer_unread INT DEFAULT 0,
    seller_unread INT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(car_listing_id, buyer_id, seller_id)
);

-- 18. Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    message TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location', 'system')),
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    deleted_for_sender BOOLEAN DEFAULT false,
    deleted_for_receiver BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 19. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 20. Create car_favorites table
CREATE TABLE IF NOT EXISTS car_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- 21. Create inspection_categories table
CREATE TABLE IF NOT EXISTS inspection_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    total_items INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 22. Create inspection_items table
CREATE TABLE IF NOT EXISTS inspection_items (
    id SERIAL PRIMARY KEY,
    category_id UUID REFERENCES inspection_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 23. Create car_inspections table
CREATE TABLE IF NOT EXISTS car_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES profiles(id),
    inspector_name TEXT,
    inspection_place TEXT,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    total_points INT DEFAULT 160,
    passed_points INT,
    failed_points INT DEFAULT 0,
    inspection_score DECIMAL(5,2),
    accident_free BOOLEAN DEFAULT true,
    flood_free BOOLEAN DEFAULT true,
    fire_free BOOLEAN DEFAULT true,
    odometer_tampered BOOLEAN DEFAULT false,
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
    overall_grade TEXT CHECK (overall_grade IN ('A+', 'A', 'B+', 'B', 'C', 'D', 'E')),
    recommended BOOLEAN DEFAULT true,
    recommendation_notes TEXT,
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    certificate_issued_at TIMESTAMP,
    certificate_expires_at TIMESTAMP,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 24. Create inspection_results table
CREATE TABLE IF NOT EXISTS inspection_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    item_id INT REFERENCES inspection_items(id),
    status TEXT DEFAULT 'baik' CHECK (status IN ('baik', 'sedang', 'perlu_perbaikan', 'istimewa')),
    notes TEXT,
    image_url TEXT,
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    repair_cost_estimate BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(inspection_id, item_id)
);

-- 25. Create user_documents table (for KYC)
CREATE TABLE IF NOT EXISTS user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    document_type TEXT CHECK (document_type IN ('ktp', 'sim', 'npwp', 'kk')),
    document_number TEXT,
    document_url TEXT,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- INSERT SEED DATA
-- ==============================================================

-- Insert popular car brands
INSERT INTO brands (id, name, slug, country, is_popular, display_order) VALUES
('brand-toyota', 'Toyota', 'toyota', 'Japan', true, 1),
('brand-honda', 'Honda', 'honda', 'Japan', true, 2),
('brand-mitsubishi', 'Mitsubishi', 'mitsubishi', 'Japan', true, 3),
('brand-suzuki', 'Suzuki', 'suzuki', 'Japan', true, 4),
('brand-daihatsu', 'Daihatsu', 'daihatsu', 'Japan', true, 5),
('brand-nissan', 'Nissan', 'nissan', 'Japan', true, 6),
('brand-mazda', 'Mazda', 'mazda', 'Japan', false, 7),
('brand-hyundai', 'Hyundai', 'hyundai', 'South Korea', true, 8),
('brand-kia', 'Kia', 'kia', 'South Korea', false, 9),
('brand-wuling', 'Wuling', 'wuling', 'China', true, 10),
('brand-bmw', 'BMW', 'bmw', 'Germany', false, 11),
('brand-mercedes', 'Mercedes-Benz', 'mercedes-benz', 'Germany', false, 12)
ON CONFLICT (slug) DO NOTHING;

-- Insert provinces
INSERT INTO provinces (id, code, name) VALUES
('prov-dki', 'DKI', 'DKI Jakarta'),
('prov-jabar', 'JB', 'Jawa Barat'),
('prov-jateng', 'JT', 'Jawa Tengah'),
('prov-jatim', 'JI', 'Jawa Timur'),
('prov-banten', 'BT', 'Banten'),
('prov-diy', 'YO', 'DI Yogyakarta'),
('prov-bali', 'BA', 'Bali')
ON CONFLICT DO NOTHING;

-- Insert cities
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
('city-semarang', 'prov-jateng', 'Semarang', 'semarang'),
('city-solo', 'prov-jateng', 'Solo', 'solo'),
('city-yogya', 'prov-diy', 'Yogyakarta', 'yogyakarta'),
('city-surabaya', 'prov-jatim', 'Surabaya', 'surabaya'),
('city-malang', 'prov-jatim', 'Malang', 'malang'),
('city-denpasar', 'prov-bali', 'Denpasar', 'denpasar')
ON CONFLICT DO NOTHING;

-- Insert car colors
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
('color-pearl-white', 'Putih Pearl', '#F5F5F5', true, true)
ON CONFLICT DO NOTHING;

-- Insert credit packages
INSERT INTO credit_packages (id, name, description, price, credits, bonus_credits, is_for_dealer, is_popular, display_order) VALUES
('pkg-starter', 'Starter', 'Paket hemat untuk mulai berjualan', 50000, 50, 0, false, false, 1),
('pkg-basic', 'Basic', 'Paket populer untuk penjual aktif', 95000, 100, 5, false, true, 2),
('pkg-standard', 'Standard', 'Paket terbaik untuk hasil maksimal', 225000, 250, 15, false, false, 3),
('pkg-premium', 'Premium', 'Paket premium dengan bonus besar', 425000, 500, 50, false, false, 4),
('pkg-enterprise', 'Enterprise', 'Paket terlengkap untuk serius berjualan', 800000, 1000, 150, false, false, 5)
ON CONFLICT DO NOTHING;

-- Insert inspection categories
INSERT INTO inspection_categories (id, name, description, icon, display_order, total_items) VALUES
('cat-eksterior', 'Eksterior', 'Pemeriksaan bagian luar kendaraan', 'car', 1, 45),
('cat-interior', 'Interior', 'Pemeriksaan bagian dalam kendaraan', 'armchair', 2, 35),
('cat-mesin', 'Mesin', 'Pemeriksaan mesin dan performa', 'cog', 3, 40),
('cat-rangka', 'Rangka & Chassis', 'Pemeriksaan struktur kendaraan', 'wrench', 4, 25),
('cat-elektrikal', 'Elektrikal', 'Pemeriksaan sistem kelistrikan', 'zap', 5, 15)
ON CONFLICT DO NOTHING;

-- Insert inspection items for Eksterior category
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical) VALUES
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Bumper Depan', 'Kondisi bumper depan', 1, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Bumper Belakang', 'Kondisi bumper belakang', 2, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Kap Mesin', 'Kondisi kap mesin', 3, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Bagasi', 'Kondisi bagasi/tutup belakang', 4, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Pintu Depan Kiri', 'Kondisi pintu depan kiri', 5, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Pintu Depan Kanan', 'Kondisi pintu depan kanan', 6, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Pintu Belakang Kiri', 'Kondisi pintu belakang kiri', 7, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Pintu Belakang Kanan', 'Kondisi pintu belakang kanan', 8, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Fender Depan Kiri', 'Kondisi fender depan kiri', 9, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Fender Depan Kanan', 'Kondisi fender depan kanan', 10, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Lampu Depan', 'Kondisi lampu depan/headlamp', 11, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Lampu Belakang', 'Kondisi lampu belakang/tail lamp', 12, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Kaca Depan', 'Kondisi kaca depan/windshield', 13, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Kaca Belakang', 'Kondisi kaca belakang', 14, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Kaca Jendela Kiri', 'Kondisi kaca jendela sisi kiri', 15, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Kaca Jendela Kanan', 'Kondisi kaca jendela sisi kanan', 16, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Spion Kiri', 'Kondisi spion sisi kiri', 17, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Spion Kanan', 'Kondisi spion sisi kanan', 18, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Grille', 'Kondisi grille depan', 19, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Ban Depan Kiri', 'Kondisi ban depan kiri', 20, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Ban Depan Kanan', 'Kondisi ban depan kanan', 21, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Ban Belakang Kiri', 'Kondisi ban belakang kiri', 22, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Ban Belakang Kanan', 'Kondisi ban belakang kanan', 23, true),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Velg Depan Kiri', 'Kondisi velg depan kiri', 24, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Velg Depan Kanan', 'Kondisi velg depan kanan', 25, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Velg Belakang Kiri', 'Kondisi velg belakang kiri', 26, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Velg Belakang Kanan', 'Kondisi velg belakang kanan', 27, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Knalpot', 'Kondisi knalpot', 28, false),
((SELECT id FROM inspection_categories WHERE name = 'Eksterior'), 'Atap/Roof', 'Kondisi atap kendaraan', 29, false)
ON CONFLICT DO NOTHING;

-- Insert inspection items for Interior category
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical) VALUES
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Dashboard', 'Kondisi dashboard', 1, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Setir/Steering', 'Kondisi setir', 2, true),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Jok Depan Kiri', 'Kondisi jok pengemudi', 3, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Jok Depan Kanan', 'Kondisi jok penumpang depan', 4, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Jok Belakang', 'Kondisi jok baris kedua', 5, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Karpet', 'Kondisi karpet lantai', 6, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Plafon/Headliner', 'Kondisi plafon interior', 7, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Panel Pintu Kiri', 'Kondisi trim pintu kiri', 8, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Panel Pintu Kanan', 'Kondisi trim pintu kanan', 9, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'AC', 'Kondisi sistem AC', 10, true),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Audio/Sound System', 'Kondisi sistem audio', 11, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Speedometer', 'Kondisi meter cluster', 12, true),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Sabuk Pengaman', 'Kondisi seatbelt', 13, true),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Power Window', 'Kondisi power window', 14, false),
((SELECT id FROM inspection_categories WHERE name = 'Interior'), 'Central Lock', 'Kondisi central lock', 15, false)
ON CONFLICT DO NOTHING;

-- Insert inspection items for Mesin category
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical) VALUES
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Mesin Start', 'Kondisi starter mesin', 1, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Suara Mesin', 'Kondisi suara mesin', 2, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Getaran Mesin', 'Kondisi getaran mesin', 3, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Asap Knalpot', 'Kondisi asap knalpot', 4, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Oli Mesin', 'Kondisi oli mesin', 5, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Transmisi', 'Kondisi transmisi', 6, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Kopling', 'Kondisi kopling (untuk MT)', 7, false),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Radiator', 'Kondisi radiator', 8, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Selang Radiator', 'Kondisi selang radiator', 9, false),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Fan/Aki', 'Kondisi kipas dan aki', 10, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Alternator', 'Kondisi alternator', 11, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Air Filter', 'Kondisi filter udara', 12, false),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Fuel Pump', 'Kondisi fuel pump', 13, false),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Timing Belt/Chain', 'Kondisi timing belt/chain', 14, true),
((SELECT id FROM inspection_categories WHERE name = 'Mesin'), 'Oil Filter', 'Kondisi filter oli', 15, false)
ON CONFLICT DO NOTHING;

-- Insert inspection items for Rangka category
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical) VALUES
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Chassis Utama', 'Kondisi chassis utama', 1, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Suspensi Depan', 'Kondisi suspensi depan', 2, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Suspensi Belakang', 'Kondisi suspensi belakang', 3, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Shock Breaker Depan', 'Kondisi shock depan', 4, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Shock Breaker Belakang', 'Kondisi shock belakang', 5, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Rem Depan', 'Kondisi rem depan', 6, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Rem Belakang', 'Kondisi rem belakang', 7, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Handbrake', 'Kondisi rem tangan', 8, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Ball Joint', 'Kondisi ball joint', 9, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Tie Rod', 'Kondisi tie rod', 10, true),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Arm Suspension', 'Kondisi arm suspension', 11, false),
((SELECT id FROM inspection_categories WHERE name = 'Rangka & Chassis'), 'Bushings', 'Kondisi bushing', 12, false)
ON CONFLICT DO NOTHING;

-- Insert inspection items for Elektrikal category
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical) VALUES
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Baterai/Aki', 'Kondisi aki', 1, true),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Lampu Depan', 'Fungsi lampu depan', 2, true),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Lampu Belakang', 'Fungsi lampu belakang', 3, true),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Lampu Rem', 'Fungsi lampu rem', 4, true),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Lampu Mundur', 'Fungsi lampu mundur', 5, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Lampu Sein', 'Fungsi lampu sein', 6, true),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Klakson', 'Fungsi klakson', 7, true),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Wiper Depan', 'Fungsi wiper depan', 8, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Wiper Belakang', 'Fungsi wiper belakang', 9, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Power Window', 'Fungsi power window', 10, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Central Lock', 'Fungsi central lock', 11, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Alarm/Immobilizer', 'Fungsi alarm', 12, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Socket/Charger', 'Fungsi port charger', 13, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Power Mirror', 'Fungsi spion elektrik', 14, false),
((SELECT id FROM inspection_categories WHERE name = 'Elektrikal'), 'Sensors (Parking/ABS)', 'Fungsi sensor', 15, false)
ON CONFLICT DO NOTHING;

-- ==============================================================
-- CREATE INDEXES
-- ==============================================================
CREATE INDEX IF NOT EXISTS idx_listings_user ON car_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_dealer ON car_listings(dealer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON car_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON car_listings(brand_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON car_listings(city_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_dealer ON wallets(dealer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- ==============================================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view active packages" ON credit_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================
-- SUCCESS MESSAGE
-- ==============================================================
SELECT 'Database setup completed successfully!' as message;
