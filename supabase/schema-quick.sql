-- ==============================================================
-- MARKETPLACE MOBIL - PRODUCTION SCHEMA
-- Jalankan di Supabase SQL Editor
-- ==============================================================

-- ==============================
-- EXTENSION
-- ==============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- ENUM TYPES
-- ==============================
DROP TYPE IF EXISTS fuel_type CASCADE;
DROP TYPE IF EXISTS transmission_type CASCADE;
DROP TYPE IF EXISTS body_type CASCADE;
DROP TYPE IF EXISTS vehicle_transaction_type CASCADE;
DROP TYPE IF EXISTS vehicle_condition CASCADE;
DROP TYPE IF EXISTS inspection_status CASCADE;

CREATE TYPE fuel_type AS ENUM ('bensin', 'diesel', 'electric', 'hybrid', 'petrol_hybrid');
CREATE TYPE transmission_type AS ENUM ('automatic', 'manual');
CREATE TYPE body_type AS ENUM ('sedan', 'suv', 'mpv', 'hatchback', 'pickup', 'van');
CREATE TYPE vehicle_transaction_type AS ENUM ('jual', 'beli', 'rental');
CREATE TYPE vehicle_condition AS ENUM ('baru', 'bekas', 'sedang', 'istimewa');
CREATE TYPE inspection_status AS ENUM ('baik', 'sedang', 'perlu_perbaikan', 'istimewa');

-- ==============================
-- PROFILES (extend auth.users)
-- ==============================
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'dealer', 'admin', 'inspector')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- BRANDS
-- ==============================
DROP TABLE IF EXISTS brands CASCADE;
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    logo_url TEXT,
    country TEXT,
    is_popular BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR MODELS
-- ==============================
DROP TABLE IF EXISTS car_models CASCADE;
CREATE TABLE car_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    body_type body_type,
    is_popular BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR VARIANTS
-- ==============================
DROP TABLE IF EXISTS car_variants CASCADE;
CREATE TABLE car_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    engine_capacity INT,
    transmission transmission_type,
    fuel_type fuel_type,
    seat_count INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR COLORS
-- ==============================
DROP TABLE IF EXISTS car_colors CASCADE;
CREATE TABLE car_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_code TEXT,
    is_metallic BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- DEALERS
-- ==============================
DROP TABLE IF EXISTS dealers CASCADE;
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
    address TEXT,
    city TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    total_listings INT DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR LISTINGS (Main Table)
-- ==============================
DROP TABLE IF EXISTS car_listings CASCADE;
CREATE TABLE car_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_number TEXT UNIQUE,
    user_id UUID REFERENCES profiles(id),
    dealer_id UUID REFERENCES dealers(id),
    brand_id UUID REFERENCES brands(id),
    model_id UUID REFERENCES car_models(id),
    variant_id UUID REFERENCES car_variants(id),
    
    -- Vehicle Details
    year INT,
    exterior_color_id UUID REFERENCES car_colors(id),
    interior_color_id UUID REFERENCES car_colors(id),
    fuel fuel_type,
    transmission transmission_type,
    body_type body_type,
    engine_capacity INT,
    seat_count INT,
    mileage INT,
    vin_number TEXT,
    plate_number TEXT,
    
    -- Transaction
    transaction_type vehicle_transaction_type,
    condition vehicle_condition,
    price_cash BIGINT,
    price_credit BIGINT,
    price_negotiable BOOLEAN DEFAULT true,
    
    -- Location
    city TEXT,
    province TEXT,
    
    -- Analytics
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'rejected', 'deleted')),
    sold_at TIMESTAMP,
    featured_until TIMESTAMP,
    
    -- Content
    title TEXT,
    description TEXT,
    slug TEXT UNIQUE,
    
    -- Timestamps
    published_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP
);

-- ==============================
-- CAR IMAGES
-- ==============================
DROP TABLE IF EXISTS car_images CASCADE;
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

-- ==============================
-- CAR DOCUMENTS
-- ==============================
DROP TABLE IF EXISTS car_documents CASCADE;
CREATE TABLE car_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE UNIQUE,
    license_plate TEXT,
    stnk_status TEXT,
    bpkb_status TEXT,
    ownership_type TEXT,
    previous_owners INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR FEATURES
-- ==============================
DROP TABLE IF EXISTS car_features CASCADE;
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
    apple_carplay BOOLEAN DEFAULT false,
    android_auto BOOLEAN DEFAULT false,
    bluetooth BOOLEAN DEFAULT false,
    navigation BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR FAVORITES
-- ==============================
DROP TABLE IF EXISTS car_favorites CASCADE;
CREATE TABLE car_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- ==============================
-- INSPECTION CATEGORIES
-- ==============================
DROP TABLE IF EXISTS inspection_categories CASCADE;
CREATE TABLE inspection_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    total_items INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- INSPECTION ITEMS
-- ==============================
DROP TABLE IF EXISTS inspection_items CASCADE;
CREATE TABLE inspection_items (
    id SERIAL PRIMARY KEY,
    category_id UUID REFERENCES inspection_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR INSPECTIONS
-- ==============================
DROP TABLE IF EXISTS car_inspections CASCADE;
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
    
    -- Safety Checks
    accident_free BOOLEAN DEFAULT true,
    flood_free BOOLEAN DEFAULT true,
    fire_free BOOLEAN DEFAULT true,
    
    -- Overall
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    overall_grade TEXT CHECK (overall_grade IN ('A+', 'A', 'B+', 'B', 'C', 'D')),
    
    -- Certificate
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- INSPECTION RESULTS
-- ==============================
DROP TABLE IF EXISTS inspection_results CASCADE;
CREATE TABLE inspection_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    item_id INT REFERENCES inspection_items(id),
    status inspection_status DEFAULT 'baik',
    notes TEXT,
    image_url TEXT,
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(inspection_id, item_id)
);

-- ==============================
-- CAR RENTAL PRICES
-- ==============================
DROP TABLE IF EXISTS car_rental_prices CASCADE;
CREATE TABLE car_rental_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE UNIQUE,
    price_per_day BIGINT,
    price_per_week BIGINT,
    price_per_month BIGINT,
    min_rental_days INT DEFAULT 1,
    deposit_amount BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CONVERSATIONS
-- ==============================
DROP TABLE IF EXISTS conversations CASCADE;
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    last_message TEXT,
    last_message_at TIMESTAMP,
    buyer_unread INT DEFAULT 0,
    seller_unread INT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(car_listing_id, buyer_id, seller_id)
);

-- ==============================
-- MESSAGES
-- ==============================
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    message TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- INDEXES FOR PERFORMANCE
-- ==============================
CREATE INDEX idx_car_listings_user ON car_listings(user_id);
CREATE INDEX idx_car_listings_brand ON car_listings(brand_id);
CREATE INDEX idx_car_listings_model ON car_listings(model_id);
CREATE INDEX idx_car_listings_year ON car_listings(year);
CREATE INDEX idx_car_listings_price ON car_listings(price_cash);
CREATE INDEX idx_car_listings_city ON car_listings(city);
CREATE INDEX idx_car_listings_status ON car_listings(status);
CREATE INDEX idx_car_listings_transaction ON car_listings(transaction_type);
CREATE INDEX idx_car_listings_condition ON car_listings(condition);
CREATE INDEX idx_car_listings_created ON car_listings(created_at DESC);
CREATE INDEX idx_car_images_listing ON car_images(car_listing_id);
CREATE INDEX idx_car_favorites_user ON car_favorites(user_id);
CREATE INDEX idx_car_favorites_listing ON car_favorites(car_listing_id);
CREATE INDEX idx_inspection_items_category ON inspection_items(category_id);
CREATE INDEX idx_inspection_results_inspection ON inspection_results(inspection_id);

-- ==============================
-- ENABLE ROW LEVEL SECURITY
-- ==============================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ==============================
-- RLS POLICIES
-- ==============================

-- Profiles
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Brands (Public read)
CREATE POLICY "Brands are viewable by everyone" ON brands FOR SELECT USING (true);
CREATE POLICY "Car models are viewable by everyone" ON car_models FOR SELECT USING (true);
CREATE POLICY "Car variants are viewable by everyone" ON car_variants FOR SELECT USING (true);
CREATE POLICY "Car colors are viewable by everyone" ON car_colors FOR SELECT USING (true);
CREATE POLICY "Inspection categories are viewable" ON inspection_categories FOR SELECT USING (true);
CREATE POLICY "Inspection items are viewable" ON inspection_items FOR SELECT USING (true);

-- Car Listings
CREATE POLICY "Active listings are viewable" ON car_listings FOR SELECT USING (status = 'active' AND deleted_at IS NULL);
CREATE POLICY "Users can create listings" ON car_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON car_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON car_listings FOR DELETE USING (auth.uid() = user_id);

-- Car Images
CREATE POLICY "Images are viewable" ON car_images FOR SELECT USING (true);
CREATE POLICY "Users can manage own listing images" ON car_images FOR ALL USING (
    car_listing_id IN (SELECT id FROM car_listings WHERE user_id = auth.uid())
);

-- Car Favorites
CREATE POLICY "Users can view own favorites" ON car_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON car_favorites FOR ALL USING (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
);

-- Messages
CREATE POLICY "Conversation participants can view messages" ON messages FOR SELECT USING (
    conversation_id IN (
        SELECT id FROM conversations WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (
    conversation_id IN (
        SELECT id FROM conversations WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
);
