-- ==============================================================
-- PART 2: CREATE TABLES AND INSERT DATA
-- Run this AFTER Part 1 completes
-- ==============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================
-- CREATE TABLES
-- ==============================================================

-- Brands
CREATE TABLE brands (
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

-- Provinces
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cities
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID REFERENCES provinces(id),
    name TEXT NOT NULL,
    slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profiles
CREATE TABLE profiles (
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

-- User Settings
CREATE TABLE user_settings (
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

-- Dealers
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

-- Car Models
CREATE TABLE car_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    body_type TEXT,
    is_popular BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Car Variants
CREATE TABLE car_variants (
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

-- Car Colors
CREATE TABLE car_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_code TEXT,
    is_metallic BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Car Listings
CREATE TABLE car_listings (
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

-- Car Images
CREATE TABLE car_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Car Features
CREATE TABLE car_features (
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

-- Wallets
CREATE TABLE wallets (
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

-- Wallet Transactions
CREATE TABLE wallet_transactions (
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

-- Credit Packages
CREATE TABLE credit_packages (
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

-- Conversations
CREATE TABLE conversations (
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

-- Messages
CREATE TABLE messages (
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

-- Notifications
CREATE TABLE notifications (
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

-- Car Favorites
CREATE TABLE car_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- Inspection Categories
CREATE TABLE inspection_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    total_items INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inspection Items
CREATE TABLE inspection_items (
    id SERIAL PRIMARY KEY,
    category_id UUID REFERENCES inspection_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Car Inspections
CREATE TABLE car_inspections (
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

-- Inspection Results
CREATE TABLE inspection_results (
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

-- User Documents
CREATE TABLE user_documents (
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
-- INSERT SEED DATA (without explicit IDs - let auto-generate)
-- ==============================================================

-- Brands (let id auto-generate)
INSERT INTO brands (name, slug, country, is_popular, display_order) VALUES
('Toyota', 'toyota', 'Japan', true, 1),
('Honda', 'honda', 'Japan', true, 2),
('Mitsubishi', 'mitsubishi', 'Japan', true, 3),
('Suzuki', 'suzuki', 'Japan', true, 4),
('Daihatsu', 'daihatsu', 'Japan', true, 5),
('Nissan', 'nissan', 'Japan', true, 6),
('Mazda', 'mazda', 'Japan', false, 7),
('Hyundai', 'hyundai', 'South Korea', true, 8),
('Kia', 'kia', 'South Korea', false, 9),
('Wuling', 'wuling', 'China', true, 10),
('BMW', 'bmw', 'Germany', false, 11),
('Mercedes-Benz', 'mercedes-benz', 'Germany', false, 12);

-- Provinces
INSERT INTO provinces (code, name) VALUES
('DKI', 'DKI Jakarta'),
('JB', 'Jawa Barat'),
('JT', 'Jawa Tengah'),
('JI', 'Jawa Timur'),
('BT', 'Banten'),
('YO', 'DI Yogyakarta'),
('BA', 'Bali');

-- Cities (need province_id from above)
INSERT INTO cities (province_id, name, slug)
SELECT id, 'Jakarta Selatan', 'jakarta-selatan' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Pusat', 'jakarta-pusat' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Timur', 'jakarta-timur' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Barat', 'jakarta-barat' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Utara', 'jakarta-utara' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Depok', 'depok' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Bekasi', 'bekasi' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Bogor', 'bogor' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Bandung', 'bandung' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Tangerang', 'tangerang' FROM provinces WHERE code = 'BT'
UNION ALL
SELECT id, 'Tangerang Selatan', 'tangerang-selatan' FROM provinces WHERE code = 'BT'
UNION ALL
SELECT id, 'Semarang', 'semarang' FROM provinces WHERE code = 'JT'
UNION ALL
SELECT id, 'Solo', 'solo' FROM provinces WHERE code = 'JT'
UNION ALL
SELECT id, 'Yogyakarta', 'yogyakarta' FROM provinces WHERE code = 'YO'
UNION ALL
SELECT id, 'Surabaya', 'surabaya' FROM provinces WHERE code = 'JI'
UNION ALL
SELECT id, 'Malang', 'malang' FROM provinces WHERE code = 'JI'
UNION ALL
SELECT id, 'Denpasar', 'denpasar' FROM provinces WHERE code = 'BA';

-- Colors
INSERT INTO car_colors (name, hex_code, is_metallic, is_popular) VALUES
('Hitam', '#000000', false, true),
('Putih', '#FFFFFF', false, true),
('Silver', '#C0C0C0', true, true),
('Abu-abu', '#808080', true, true),
('Merah', '#FF0000', false, true),
('Biru', '#0000FF', false, true),
('Hijau', '#008000', false, false),
('Coklat', '#8B4513', false, false),
('Emas', '#FFD700', true, false),
('Putih Pearl', '#F5F5F5', true, true);

-- Credit Packages
INSERT INTO credit_packages (name, description, price, credits, bonus_credits, is_for_dealer, is_popular, display_order) VALUES
('Starter', 'Paket hemat untuk mulai berjualan', 50000, 50, 0, false, false, 1),
('Basic', 'Paket populer untuk penjual aktif', 95000, 100, 5, false, true, 2),
('Standard', 'Paket terbaik untuk hasil maksimal', 225000, 250, 15, false, false, 3),
('Premium', 'Paket premium dengan bonus besar', 425000, 500, 50, false, false, 4),
('Enterprise', 'Paket terlengkap untuk serius berjualan', 800000, 1000, 150, false, false, 5);

-- Inspection Categories (use uuid_generate_v4() for id)
INSERT INTO inspection_categories (id, name, description, icon, display_order, total_items) VALUES
(uuid_generate_v4(), 'Eksterior', 'Pemeriksaan bagian luar kendaraan', 'car', 1, 45),
(uuid_generate_v4(), 'Interior', 'Pemeriksaan bagian dalam kendaraan', 'armchair', 2, 35),
(uuid_generate_v4(), 'Mesin', 'Pemeriksaan mesin dan performa', 'cog', 3, 40),
(uuid_generate_v4(), 'Rangka & Chassis', 'Pemeriksaan struktur kendaraan', 'wrench', 4, 25),
(uuid_generate_v4(), 'Elektrikal', 'Pemeriksaan sistem kelistrikan', 'zap', 5, 15);

-- Inspection Items - Eksterior
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical)
SELECT id, 'Bumper Depan', 'Kondisi bumper depan', 1, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Bumper Belakang', 'Kondisi bumper belakang', 2, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Kap Mesin', 'Kondisi kap mesin', 3, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Bagasi', 'Kondisi bagasi/tutup belakang', 4, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Pintu Depan Kiri', 'Kondisi pintu depan kiri', 5, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Pintu Depan Kanan', 'Kondisi pintu depan kanan', 6, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Pintu Belakang Kiri', 'Kondisi pintu belakang kiri', 7, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Pintu Belakang Kanan', 'Kondisi pintu belakang kanan', 8, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Lampu Depan', 'Kondisi lampu depan/headlamp', 9, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Lampu Belakang', 'Kondisi lampu belakang/tail lamp', 10, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Kaca Depan', 'Kondisi kaca depan/windshield', 11, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Spion Kiri', 'Kondisi spion sisi kiri', 12, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Spion Kanan', 'Kondisi spion sisi kanan', 13, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Ban Depan Kiri', 'Kondisi ban depan kiri', 14, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Ban Depan Kanan', 'Kondisi ban depan kanan', 15, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Ban Belakang Kiri', 'Kondisi ban belakang kiri', 16, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL
SELECT id, 'Ban Belakang Kanan', 'Kondisi ban belakang kanan', 17, true FROM inspection_categories WHERE name = 'Eksterior';

-- Inspection Items - Interior
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical)
SELECT id, 'Dashboard', 'Kondisi dashboard', 1, false FROM inspection_categories WHERE name = 'Interior'
UNION ALL
SELECT id, 'Setir/Steering', 'Kondisi setir', 2, true FROM inspection_categories WHERE name = 'Interior'
UNION ALL
SELECT id, 'Jok Depan Kiri', 'Kondisi jok pengemudi', 3, false FROM inspection_categories WHERE name = 'Interior'
UNION ALL
SELECT id, 'Jok Depan Kanan', 'Kondisi jok penumpang depan', 4, false FROM inspection_categories WHERE name = 'Interior'
UNION ALL
SELECT id, 'Jok Belakang', 'Kondisi jok baris kedua', 5, false FROM inspection_categories WHERE name = 'Interior'
UNION ALL
SELECT id, 'AC', 'Kondisi sistem AC', 6, true FROM inspection_categories WHERE name = 'Interior'
UNION ALL
SELECT id, 'Speedometer', 'Kondisi meter cluster', 7, true FROM inspection_categories WHERE name = 'Interior'
UNION ALL
SELECT id, 'Sabuk Pengaman', 'Kondisi seatbelt', 8, true FROM inspection_categories WHERE name = 'Interior';

-- Inspection Items - Mesin
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical)
SELECT id, 'Mesin Start', 'Kondisi starter mesin', 1, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL
SELECT id, 'Suara Mesin', 'Kondisi suara mesin', 2, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL
SELECT id, 'Getaran Mesin', 'Kondisi getaran mesin', 3, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL
SELECT id, 'Asap Knalpot', 'Kondisi asap knalpot', 4, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL
SELECT id, 'Oli Mesin', 'Kondisi oli mesin', 5, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL
SELECT id, 'Transmisi', 'Kondisi transmisi', 6, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL
SELECT id, 'Radiator', 'Kondisi radiator', 7, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL
SELECT id, 'Alternator', 'Kondisi alternator', 8, true FROM inspection_categories WHERE name = 'Mesin';

-- Inspection Items - Rangka
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical)
SELECT id, 'Chassis Utama', 'Kondisi chassis utama', 1, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL
SELECT id, 'Suspensi Depan', 'Kondisi suspensi depan', 2, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL
SELECT id, 'Suspensi Belakang', 'Kondisi suspensi belakang', 3, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL
SELECT id, 'Rem Depan', 'Kondisi rem depan', 4, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL
SELECT id, 'Rem Belakang', 'Kondisi rem belakang', 5, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL
SELECT id, 'Ball Joint', 'Kondisi ball joint', 6, true FROM inspection_categories WHERE name = 'Rangka & Chassis';

-- Inspection Items - Elektrikal
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical)
SELECT id, 'Baterai/Aki', 'Kondisi aki', 1, true FROM inspection_categories WHERE name = 'Elektrikal'
UNION ALL
SELECT id, 'Lampu Depan', 'Fungsi lampu depan', 2, true FROM inspection_categories WHERE name = 'Elektrikal'
UNION ALL
SELECT id, 'Lampu Belakang', 'Fungsi lampu belakang', 3, true FROM inspection_categories WHERE name = 'Elektrikal'
UNION ALL
SELECT id, 'Lampu Rem', 'Fungsi lampu rem', 4, true FROM inspection_categories WHERE name = 'Elektrikal'
UNION ALL
SELECT id, 'Lampu Sein', 'Fungsi lampu sein', 5, true FROM inspection_categories WHERE name = 'Elektrikal'
UNION ALL
SELECT id, 'Klakson', 'Fungsi klakson', 6, true FROM inspection_categories WHERE name = 'Elektrikal';

-- ==============================================================
-- CREATE INDEXES
-- ==============================================================
CREATE INDEX idx_listings_user ON car_listings(user_id);
CREATE INDEX idx_listings_dealer ON car_listings(dealer_id);
CREATE INDEX idx_listings_status ON car_listings(status);
CREATE INDEX idx_listings_brand ON car_listings(brand_id);
CREATE INDEX idx_listings_city ON car_listings(city_id);
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_dealer ON wallets(dealer_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

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

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view active packages" ON credit_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

SELECT 'Database setup completed successfully!' as message;
