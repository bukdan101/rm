-- ==============================================================
-- SUPER DATABASE MARKETPLACE MOBIL (72 TABEL)
-- Production Ready untuk Supabase/PostgreSQL
-- Setara dengan OLX Autos / Carsome
-- ==============================================================
-- GABUNGAN DARI schema-pro-part1.sql dan schema-pro-part2.sql
-- ==============================================================

-- ==============================
-- EXTENSION
-- ==============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- ENUM TYPES
-- ==============================
DO $$ BEGIN
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
END $$;

-- ==============================================================
-- MODULE 1: USER SYSTEM (7 tabel)
-- ==============================================================

-- 1.1 Profiles
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS user_addresses (
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

-- 1.3 User Documents
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

-- 1.4 User Verifications
CREATE TABLE IF NOT EXISTS user_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    verification_type TEXT CHECK (verification_type IN ('email', 'phone', 'kyc')),
    code TEXT,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.5 User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.6 User Notifications
CREATE TABLE IF NOT EXISTS user_notifications (
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
CREATE TABLE IF NOT EXISTS user_settings (
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
CREATE TABLE IF NOT EXISTS dealer_branches (
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
CREATE TABLE IF NOT EXISTS dealer_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'sales', 'inspector')),
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2.4 Dealer Documents
CREATE TABLE IF NOT EXISTS dealer_documents (
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
CREATE TABLE IF NOT EXISTS dealer_reviews (
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
CREATE TABLE IF NOT EXISTS dealer_inventory (
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
CREATE TABLE IF NOT EXISTS brands (
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
CREATE TABLE IF NOT EXISTS car_models (
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
CREATE TABLE IF NOT EXISTS car_variants (
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
CREATE TABLE IF NOT EXISTS car_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
    name TEXT,
    year_start INT,
    year_end INT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.5 Car Colors
CREATE TABLE IF NOT EXISTS car_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_code TEXT,
    is_metallic BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.6 Car Body Types
CREATE TABLE IF NOT EXISTS car_body_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.7 Car Fuel Types
CREATE TABLE IF NOT EXISTS car_fuel_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.8 Car Transmissions
CREATE TABLE IF NOT EXISTS car_transmissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 4: CAR FEATURE MASTER (4 tabel)
-- ==============================================================

-- 4.1 Feature Categories
CREATE TABLE IF NOT EXISTS feature_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.2 Feature Groups
CREATE TABLE IF NOT EXISTS feature_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES feature_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.3 Feature Items
CREATE TABLE IF NOT EXISTS feature_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES feature_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.4 Feature Values
CREATE TABLE IF NOT EXISTS car_feature_values (
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
CREATE TABLE IF NOT EXISTS car_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_number TEXT UNIQUE,
    user_id UUID REFERENCES profiles(id),
    dealer_id UUID REFERENCES dealers(id),
    brand_id UUID REFERENCES brands(id),
    model_id UUID REFERENCES car_models(id),
    variant_id UUID REFERENCES car_variants(id),
    generation_id UUID REFERENCES car_generations(id),
    
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
    
    transaction_type vehicle_transaction_type,
    condition vehicle_condition,
    price_cash BIGINT,
    price_credit BIGINT,
    price_negotiable BOOLEAN DEFAULT true,
    
    city TEXT,
    province TEXT,
    city_id UUID,
    province_id UUID,
    
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

-- 5.2 Car Images
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

-- 5.3 Car Videos
CREATE TABLE IF NOT EXISTS car_videos (
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
CREATE TABLE IF NOT EXISTS car_documents (
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

-- 5.5 Car Features
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

-- 5.6 Car Price History
CREATE TABLE IF NOT EXISTS car_price_history (
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
CREATE TABLE IF NOT EXISTS car_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    status_old TEXT,
    status_new TEXT,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- 5.8 Car Views
CREATE TABLE IF NOT EXISTS car_views (
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
CREATE TABLE IF NOT EXISTS car_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- 5.10 Car Compare
CREATE TABLE IF NOT EXISTS car_compares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_ids UUID[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 6: INSPECTION SYSTEM (6 tabel)
-- ==============================================================

-- 6.1 Inspection Categories
CREATE TABLE IF NOT EXISTS inspection_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    total_items INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6.2 Inspection Items
CREATE TABLE IF NOT EXISTS inspection_items (
    id SERIAL PRIMARY KEY,
    category_id UUID REFERENCES inspection_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6.3 Car Inspections
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

-- 6.4 Inspection Results
CREATE TABLE IF NOT EXISTS inspection_results (
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
CREATE TABLE IF NOT EXISTS inspection_photos (
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
CREATE TABLE IF NOT EXISTS inspection_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    issued_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 7: RENTAL SYSTEM (6 tabel)
-- ==============================================================

-- 7.1 Car Rental Prices
CREATE TABLE IF NOT EXISTS car_rental_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    price_per_hour BIGINT,
    price_per_day BIGINT,
    price_per_week BIGINT,
    price_per_month BIGINT,
    min_rental_days INT DEFAULT 1,
    max_rental_days INT,
    deposit_amount BIGINT,
    includes_driver BOOLEAN DEFAULT false,
    includes_fuel BOOLEAN DEFAULT false,
    mileage_limit_per_day INT,
    excess_mileage_charge BIGINT,
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7.2 Rental Bookings
CREATE TABLE IF NOT EXISTS rental_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE,
    car_listing_id UUID REFERENCES car_listings(id),
    renter_id UUID REFERENCES profiles(id),
    owner_id UUID REFERENCES profiles(id),
    
    pickup_date TIMESTAMP,
    return_date TIMESTAMP,
    actual_pickup_date TIMESTAMP,
    actual_return_date TIMESTAMP,
    pickup_location TEXT,
    return_location TEXT,
    
    daily_rate BIGINT,
    total_days INT,
    base_amount BIGINT,
    mileage_charge BIGINT DEFAULT 0,
    late_fee BIGINT DEFAULT 0,
    damage_fee BIGINT DEFAULT 0,
    other_charges BIGINT DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    total_amount BIGINT,
    deposit_amount BIGINT,
    deposit_returned BOOLEAN DEFAULT false,
    
    status booking_status DEFAULT 'pending',
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    pickup_inspection_id UUID REFERENCES car_inspections(id),
    return_inspection_id UUID REFERENCES car_inspections(id),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7.3 Rental Availability
CREATE TABLE IF NOT EXISTS rental_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    date DATE,
    is_available BOOLEAN DEFAULT true,
    booking_id UUID REFERENCES rental_bookings(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(car_listing_id, date)
);

-- 7.4 Rental Payments
CREATE TABLE IF NOT EXISTS rental_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES rental_bookings(id) ON DELETE CASCADE,
    payment_type TEXT CHECK (payment_type IN ('deposit', 'rental', 'extra_charge', 'deposit_refund')),
    amount BIGINT,
    payment_method TEXT,
    payment_reference TEXT,
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7.5 Rental Reviews
CREATE TABLE IF NOT EXISTS rental_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES rental_bookings(id),
    reviewer_id UUID REFERENCES profiles(id),
    reviewee_id UUID REFERENCES profiles(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7.6 Rental Insurance
CREATE TABLE IF NOT EXISTS rental_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES rental_bookings(id),
    insurance_provider TEXT,
    policy_number TEXT,
    coverage_type TEXT,
    coverage_amount BIGINT,
    premium_amount BIGINT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 8: TRANSACTION SYSTEM (8 tabel)
-- ==============================================================

-- 8.1 Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    car_listing_id UUID REFERENCES car_listings(id),
    
    agreed_price BIGINT,
    platform_fee BIGINT,
    seller_fee BIGINT,
    buyer_fee BIGINT,
    total_amount BIGINT,
    
    status order_status DEFAULT 'pending',
    
    escrow_id UUID,
    escrow_status TEXT,
    
    confirmed_at TIMESTAMP,
    processing_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by UUID REFERENCES profiles(id),
    cancellation_reason TEXT,
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.2 Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_type TEXT DEFAULT 'car',
    item_id UUID,
    item_name TEXT,
    quantity INT DEFAULT 1,
    unit_price BIGINT,
    total_price BIGINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.3 Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT UNIQUE,
    order_id UUID REFERENCES orders(id),
    payer_id UUID REFERENCES profiles(id),
    payee_id UUID REFERENCES profiles(id),
    
    amount BIGINT,
    currency TEXT DEFAULT 'IDR',
    payment_method TEXT,
    payment_provider TEXT,
    provider_reference TEXT,
    
    status payment_status DEFAULT 'pending',
    
    platform_fee BIGINT DEFAULT 0,
    processing_fee BIGINT DEFAULT 0,
    
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    failure_reason TEXT,
    
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.4 Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    method_type TEXT CHECK (method_type IN ('bank_transfer', 'credit_card', 'debit_card', 'ewallet', 'va')),
    provider TEXT,
    account_number TEXT,
    account_name TEXT,
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.5 Escrow Accounts
CREATE TABLE IF NOT EXISTS escrow_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    
    amount_held BIGINT,
    release_amount BIGINT,
    
    status TEXT CHECK (status IN ('pending', 'held', 'released', 'refunded', 'disputed')),
    
    held_at TIMESTAMP,
    release_scheduled_at TIMESTAMP,
    released_at TIMESTAMP,
    refunded_at TIMESTAMP,
    
    release_conditions JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.6 Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number TEXT UNIQUE,
    order_id UUID REFERENCES orders(id),
    payment_id UUID REFERENCES payments(id),
    
    transaction_type TEXT CHECK (transaction_type IN ('payment', 'refund', 'release', 'fee', 'adjustment')),
    amount BIGINT,
    
    from_account UUID REFERENCES profiles(id),
    to_account UUID REFERENCES profiles(id),
    
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.7 Refunds
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_number TEXT UNIQUE,
    order_id UUID REFERENCES orders(id),
    payment_id UUID REFERENCES payments(id),
    
    amount BIGINT,
    reason TEXT,
    
    status payment_status DEFAULT 'pending',
    
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.8 Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE,
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES profiles(id),
    
    items JSONB,
    subtotal BIGINT,
    taxes BIGINT DEFAULT 0,
    fees BIGINT DEFAULT 0,
    discounts BIGINT DEFAULT 0,
    total BIGINT,
    
    status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
    
    issued_at TIMESTAMP,
    due_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    invoice_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 9: CHAT SYSTEM (3 tabel)
-- ==============================================================

-- 9.1 Conversations
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

-- 9.2 Messages
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

-- 9.3 Message Attachments
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    file_name TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size BIGINT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 10: REVIEW & RATING (3 tabel)
-- ==============================================================

-- 10.1 Car Reviews
CREATE TABLE IF NOT EXISTS car_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    order_id UUID REFERENCES orders(id),
    
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    pros TEXT,
    cons TEXT,
    
    is_verified_purchase BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    
    seller_response TEXT,
    seller_responded_at TIMESTAMP,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'hidden', 'deleted')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(car_listing_id, user_id)
);

-- 10.2 Review Votes
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES car_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(review_id, user_id)
);

-- 10.3 Review Images
CREATE TABLE IF NOT EXISTS review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES car_reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 11: SEARCH & DISCOVERY (4 tabel)
-- ==============================================================

-- 11.1 Search Logs
CREATE TABLE IF NOT EXISTS search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    query TEXT,
    filters JSONB,
    results_count INT,
    clicked_listing_id UUID REFERENCES car_listings(id),
    session_id TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11.2 Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    score DECIMAL(5,4),
    reason TEXT,
    source TEXT CHECK (source IN ('similar', 'popular', 'recently_viewed', 'personalized', 'trending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11.3 Recent Views
CREATE TABLE IF NOT EXISTS recent_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    view_count INT DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- 11.4 Trending Cars
CREATE TABLE IF NOT EXISTS trending_cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    period TEXT,
    view_count INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    score DECIMAL(10,2),
    rank INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 12: ANALYTICS (4 tabel)
-- ==============================================================

-- 12.1 Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    properties JSONB,
    session_id TEXT,
    device_type TEXT,
    platform TEXT,
    app_version TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12.2 Analytics Page Views
CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    page_type TEXT,
    page_id UUID,
    page_url TEXT,
    referrer TEXT,
    session_id TEXT,
    time_on_page INT,
    scroll_depth INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12.3 Analytics Clicks
CREATE TABLE IF NOT EXISTS analytics_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    element_type TEXT,
    element_id TEXT,
    element_text TEXT,
    page_url TEXT,
    x_position INT,
    y_position INT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12.4 Analytics Conversions
CREATE TABLE IF NOT EXISTS analytics_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    conversion_type TEXT,
    conversion_value BIGINT,
    funnel_step TEXT,
    funnel_complete BOOLEAN DEFAULT false,
    session_id TEXT,
    attribution JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 13: NOTIFICATION SYSTEM (3 tabel)
-- ==============================================================

-- 13.1 Notifications
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

-- 13.2 Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT UNIQUE,
    title_template TEXT,
    message_template TEXT,
    variables TEXT[],
    channels TEXT[] DEFAULT ARRAY['push', 'email', 'sms'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13.3 Notification Logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    notification_id UUID REFERENCES notifications(id),
    channel TEXT,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 14: LOCATION SYSTEM (4 tabel)
-- ==============================================================

-- 14.1 Countries
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone_code TEXT,
    currency_code TEXT,
    currency_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14.2 Provinces
CREATE TABLE IF NOT EXISTS provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES countries(id),
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14.3 Cities
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID REFERENCES provinces(id),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('kota', 'kabupaten')),
    postal_codes TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14.4 Districts
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id),
    name TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Done! 72 tables created
SELECT '72 tables schema created!' AS message;
