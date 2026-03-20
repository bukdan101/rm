-- ==============================================================
-- SUPER DATABASE MARKETPLACE MOBIL (72 TABEL)
-- Production Ready untuk Supabase/PostgreSQL
-- Setara dengan OLX Autos / Carsome
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
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

CREATE TYPE fuel_type AS ENUM ('bensin', 'diesel', 'electric', 'hybrid', 'petrol_hybrid');
CREATE TYPE transmission_type AS ENUM ('automatic', 'manual');
CREATE TYPE body_type AS ENUM ('sedan', 'suv', 'mpv', 'hatchback', 'pickup', 'van', 'coupe', 'convertible', 'wagon');
CREATE TYPE vehicle_transaction_type AS ENUM ('jual', 'beli', 'rental');
CREATE TYPE vehicle_condition AS ENUM ('baru', 'bekas', 'sedang', 'istimewa');
CREATE TYPE inspection_status AS ENUM ('baik', 'sedang', 'perlu_perbaikan', 'istimewa');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- ==============================================================
-- MODULE 1: USER SYSTEM (7 tabel)
-- ==============================================================

-- 1.1 Profiles (extend auth.users)
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
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.2 User Addresses
DROP TABLE IF EXISTS user_addresses CASCADE;
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Rumah',
    address TEXT,
    city_id UUID,
    province_id UUID,
    postal_code TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.3 User Documents (KTP, SIM, etc)
DROP TABLE IF EXISTS user_documents CASCADE;
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

-- 1.4 User Verifications
DROP TABLE IF EXISTS user_verifications CASCADE;
CREATE TABLE user_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    verification_type TEXT CHECK (verification_type IN ('email', 'phone', 'kyc')),
    code TEXT,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.5 User Sessions
DROP TABLE IF EXISTS user_sessions CASCADE;
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.6 User Notifications
DROP TABLE IF EXISTS user_notifications CASCADE;
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    type TEXT,
    read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.7 User Settings
DROP TABLE IF EXISTS user_settings CASCADE;
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'id',
    currency TEXT DEFAULT 'IDR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 2: DEALER SYSTEM (6 tabel)
-- ==============================================================

-- 2.1 Dealers
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
    website TEXT,
    address TEXT,
    city_id UUID,
    province_id UUID,
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

-- 2.2 Dealer Branches
DROP TABLE IF EXISTS dealer_branches CASCADE;
CREATE TABLE dealer_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    name TEXT,
    address TEXT,
    city_id UUID,
    phone TEXT,
    operating_hours JSONB,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.3 Dealer Staff
DROP TABLE IF EXISTS dealer_staff CASCADE;
CREATE TABLE dealer_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'sales', 'inspector')),
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.4 Dealer Documents
DROP TABLE IF EXISTS dealer_documents CASCADE;
CREATE TABLE dealer_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    document_type TEXT,
    document_name TEXT,
    document_url TEXT,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.5 Dealer Reviews
DROP TABLE IF EXISTS dealer_reviews CASCADE;
CREATE TABLE dealer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.6 Dealer Inventory
DROP TABLE IF EXISTS dealer_inventory CASCADE;
CREATE TABLE dealer_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    car_listing_id UUID,
    location TEXT,
    stock_status TEXT DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 3: CAR MASTER DATA (8 tabel)
-- ==============================================================

-- 3.1 Brands
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

-- 3.2 Car Models
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

-- 3.3 Car Variants
DROP TABLE IF EXISTS car_variants CASCADE;
CREATE TABLE car_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    engine_capacity INT,
    transmission transmission_type,
    fuel_type fuel_type,
    seat_count INT,
    price_new BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.4 Car Generations
DROP TABLE IF EXISTS car_generations CASCADE;
CREATE TABLE car_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
    name TEXT,
    year_start INT,
    year_end INT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.5 Car Colors
DROP TABLE IF EXISTS car_colors CASCADE;
CREATE TABLE car_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_code TEXT,
    is_metallic BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.6 Car Body Types
DROP TABLE IF EXISTS car_body_types CASCADE;
CREATE TABLE car_body_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.7 Car Fuel Types
DROP TABLE IF EXISTS car_fuel_types CASCADE;
CREATE TABLE car_fuel_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.8 Car Transmissions
DROP TABLE IF EXISTS car_transmissions CASCADE;
CREATE TABLE car_transmissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 4: CAR FEATURE MASTER (4 tabel)
-- ==============================================================

-- 4.1 Feature Categories
DROP TABLE IF EXISTS feature_categories CASCADE;
CREATE TABLE feature_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.2 Feature Groups
DROP TABLE IF EXISTS feature_groups CASCADE;
CREATE TABLE feature_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES feature_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.3 Feature Items
DROP TABLE IF EXISTS feature_items CASCADE;
CREATE TABLE feature_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES feature_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.4 Feature Values (for each car)
DROP TABLE IF EXISTS car_feature_values CASCADE;
CREATE TABLE car_feature_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID,
    feature_item_id UUID REFERENCES feature_items(id),
    value BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 5: LISTING SYSTEM (10 tabel)
-- ==============================================================

-- 5.1 Car Listings (Main Table)
DROP TABLE IF EXISTS car_listings CASCADE;
CREATE TABLE car_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_number TEXT UNIQUE,
    user_id UUID REFERENCES profiles(id),
    dealer_id UUID REFERENCES dealers(id),
    brand_id UUID REFERENCES brands(id),
    model_id UUID REFERENCES car_models(id),
    variant_id UUID REFERENCES car_variants(id),
    generation_id UUID REFERENCES car_generations(id),
    
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
    city_id UUID,
    province_id UUID,
    
    -- Analytics
    view_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'sold', 'expired', 'rejected', 'deleted')),
    sold_at TIMESTAMP,
    expired_at TIMESTAMP,
    rejected_reason TEXT,
    
    -- Content
    title TEXT,
    description TEXT,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    slug TEXT UNIQUE,
    
    -- Timestamps
    published_at TIMESTAMP,
    featured_until TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP
);

-- 5.2 Car Images
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

-- 5.3 Car Videos
DROP TABLE IF EXISTS car_videos CASCADE;
CREATE TABLE car_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    duration INT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5.4 Car Documents
DROP TABLE IF EXISTS car_documents CASCADE;
CREATE TABLE car_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    document_type TEXT CHECK (document_type IN ('stnk', 'bpkb', 'faktur', 'manual', 'service_book')),
    document_number TEXT,
    document_url TEXT,
    issue_date DATE,
    expiry_date DATE,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5.5 Car Features (Legacy - simple boolean)
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

-- 5.6 Car Price History
DROP TABLE IF EXISTS car_price_history CASCADE;
CREATE TABLE car_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    price_cash_old BIGINT,
    price_cash_new BIGINT,
    price_credit_old BIGINT,
    price_credit_new BIGINT,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reason TEXT
);

-- 5.7 Car Status History
DROP TABLE IF EXISTS car_status_history CASCADE;
CREATE TABLE car_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    status_old TEXT,
    status_new TEXT,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- 5.8 Car Views (Analytics)
DROP TABLE IF EXISTS car_views CASCADE;
CREATE TABLE car_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id),
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    view_duration INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5.9 Car Favorites
DROP TABLE IF EXISTS car_favorites CASCADE;
CREATE TABLE car_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- 5.10 Car Compare
DROP TABLE IF EXISTS car_compares CASCADE;
CREATE TABLE car_compares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_ids UUID[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 6: INSPECTION SYSTEM (6 tabel)
-- ==============================================================

-- 6.1 Inspection Categories
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

-- 6.2 Inspection Items
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

-- 6.3 Car Inspections (Header)
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
    odometer_tampered BOOLEAN DEFAULT false,
    
    -- Overall
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
    overall_grade TEXT CHECK (overall_grade IN ('A+', 'A', 'B+', 'B', 'C', 'D', 'E')),
    
    -- Recommendation
    recommended BOOLEAN DEFAULT true,
    recommendation_notes TEXT,
    
    -- Certificate
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    certificate_issued_at TIMESTAMP,
    certificate_expires_at TIMESTAMP,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6.4 Inspection Results
DROP TABLE IF EXISTS inspection_results CASCADE;
CREATE TABLE inspection_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    item_id INT REFERENCES inspection_items(id),
    status inspection_status DEFAULT 'baik',
    notes TEXT,
    image_url TEXT,
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    repair_cost_estimate BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(inspection_id, item_id)
);

-- 6.5 Inspection Photos
DROP TABLE IF EXISTS inspection_photos CASCADE;
CREATE TABLE inspection_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    inspection_result_id UUID REFERENCES inspection_results(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    position TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6.6 Inspection Certificates
DROP TABLE IF EXISTS inspection_certificates CASCADE;
CREATE TABLE inspection_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    issued_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
