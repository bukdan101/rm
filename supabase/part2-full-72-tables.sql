-- ==============================================================
-- PART 2: FULL 72 TABLES - COMPLETE SCHEMA
-- Run this AFTER Part 1 completes
-- ==============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================
-- MODULE 1: USER SYSTEM (7 tabel)
-- ==============================================================

-- 1.1 Profiles
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

-- 1.3 User Documents
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

-- ==============================================================
-- MODULE 2: DEALER SYSTEM (6 tabel)
-- ==============================================================

-- 2.1 Dealers
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

-- 3.3 Car Variants
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

-- 3.4 Car Generations
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
CREATE TABLE car_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_code TEXT,
    is_metallic BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.6 Car Body Types
CREATE TABLE car_body_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.7 Car Fuel Types
CREATE TABLE car_fuel_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3.8 Car Transmissions
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
CREATE TABLE feature_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.2 Feature Groups
CREATE TABLE feature_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES feature_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.3 Feature Items
CREATE TABLE feature_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES feature_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4.4 Feature Values
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
CREATE TABLE car_listings (
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

-- 5.5 Car Features
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
CREATE TABLE car_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    status_old TEXT,
    status_new TEXT,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- 5.8 Car Views
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
CREATE TABLE car_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- 5.10 Car Compare
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
CREATE TABLE inspection_items (
    id SERIAL PRIMARY KEY,
    category_id UUID REFERENCES inspection_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6.3 Car Inspections
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

-- 6.4 Inspection Results
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

-- 6.5 Inspection Photos
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

-- ==============================================================
-- MODULE 7: RENTAL SYSTEM (6 tabel)
-- ==============================================================

-- 7.1 Car Rental Prices
CREATE TABLE car_rental_prices (
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
CREATE TABLE rental_bookings (
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    pickup_inspection_id UUID REFERENCES car_inspections(id),
    return_inspection_id UUID REFERENCES car_inspections(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7.3 Rental Availability
CREATE TABLE rental_availability (
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
CREATE TABLE rental_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES rental_bookings(id) ON DELETE CASCADE,
    payment_type TEXT CHECK (payment_type IN ('deposit', 'rental', 'extra_charge', 'deposit_refund')),
    amount BIGINT,
    payment_method TEXT,
    payment_reference TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7.5 Rental Reviews
CREATE TABLE rental_reviews (
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
CREATE TABLE rental_insurance (
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
CREATE TABLE orders (
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded')),
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
CREATE TABLE order_items (
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
CREATE TABLE payments (
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
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
CREATE TABLE payment_methods (
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
CREATE TABLE escrow_accounts (
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
CREATE TABLE transactions (
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
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_number TEXT UNIQUE,
    order_id UUID REFERENCES orders(id),
    payment_id UUID REFERENCES payments(id),
    amount BIGINT,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.8 Invoices
CREATE TABLE invoices (
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

-- 9.2 Messages
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

-- 9.3 Message Attachments
CREATE TABLE message_attachments (
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
CREATE TABLE car_reviews (
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
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES car_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(review_id, user_id)
);

-- 10.3 Review Images
CREATE TABLE review_images (
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
CREATE TABLE search_logs (
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
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    score DECIMAL(5,4),
    reason TEXT,
    source TEXT CHECK (source IN ('similar', 'popular', 'recently_viewed', 'personalized', 'trending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11.3 Recent Views
CREATE TABLE recent_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    view_count INT DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- 11.4 Trending Cars
CREATE TABLE trending_cars (
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
CREATE TABLE analytics_events (
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
CREATE TABLE analytics_page_views (
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
CREATE TABLE analytics_clicks (
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
CREATE TABLE analytics_conversions (
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

-- 13.2 Notification Templates
CREATE TABLE notification_templates (
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
CREATE TABLE notification_logs (
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
CREATE TABLE countries (
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
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES countries(id),
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14.3 Cities
CREATE TABLE cities (
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
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id),
    name TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- MODULE 15: CREDIT/WALLET SYSTEM (5 tabel)
-- ==============================================================

-- 15.1 Wallets
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

-- 15.2 Wallet Transactions
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

-- 15.3 Credit Packages
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

-- 15.4 Boost Features
CREATE TABLE boost_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    credit_cost INT NOT NULL,
    duration_days INT NOT NULL,
    icon TEXT,
    color TEXT,
    benefits TEXT[],
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15.5 Listing Boosts
CREATE TABLE listing_boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL,
    boost_feature_id UUID NOT NULL REFERENCES boost_features(id),
    user_credit_id UUID REFERENCES wallets(id),
    transaction_id UUID REFERENCES wallet_transactions(id),
    credits_spent INT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================
-- SEED DATA
-- ==============================================================

-- Brands
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

-- Countries
INSERT INTO countries (code, name, phone_code, currency_code, currency_name) VALUES
('ID', 'Indonesia', '+62', 'IDR', 'Rupiah');

-- Provinces
INSERT INTO provinces (country_id, code, name)
SELECT id, 'DKI', 'DKI Jakarta' FROM countries WHERE code = 'ID'
UNION ALL
SELECT id, 'JB', 'Jawa Barat' FROM countries WHERE code = 'ID'
UNION ALL
SELECT id, 'JT', 'Jawa Tengah' FROM countries WHERE code = 'ID'
UNION ALL
SELECT id, 'JI', 'Jawa Timur' FROM countries WHERE code = 'ID'
UNION ALL
SELECT id, 'BT', 'Banten' FROM countries WHERE code = 'ID'
UNION ALL
SELECT id, 'YO', 'DI Yogyakarta' FROM countries WHERE code = 'ID'
UNION ALL
SELECT id, 'BA', 'Bali' FROM countries WHERE code = 'ID';

-- Cities
INSERT INTO cities (province_id, name, type)
SELECT id, 'Jakarta Selatan', 'kota' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Pusat', 'kota' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Timur', 'kota' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Barat', 'kota' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Jakarta Utara', 'kota' FROM provinces WHERE code = 'DKI'
UNION ALL
SELECT id, 'Depok', 'kota' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Bekasi', 'kota' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Bogor', 'kota' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Bandung', 'kota' FROM provinces WHERE code = 'JB'
UNION ALL
SELECT id, 'Tangerang', 'kota' FROM provinces WHERE code = 'BT'
UNION ALL
SELECT id, 'Tangerang Selatan', 'kota' FROM provinces WHERE code = 'BT'
UNION ALL
SELECT id, 'Semarang', 'kota' FROM provinces WHERE code = 'JT'
UNION ALL
SELECT id, 'Solo', 'kota' FROM provinces WHERE code = 'JT'
UNION ALL
SELECT id, 'Yogyakarta', 'kota' FROM provinces WHERE code = 'YO'
UNION ALL
SELECT id, 'Surabaya', 'kota' FROM provinces WHERE code = 'JI'
UNION ALL
SELECT id, 'Malang', 'kota' FROM provinces WHERE code = 'JI'
UNION ALL
SELECT id, 'Denpasar', 'kota' FROM provinces WHERE code = 'BA';

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

-- Boost Features
INSERT INTO boost_features (name, slug, description, credit_cost, duration_days, icon, color, benefits, display_order) VALUES
('Highlight', 'highlight', 'Tampilkan iklan dengan background highlight', 3, 7, 'Sparkles', 'amber', ARRAY['Background kuning', 'Lebih mudah dilihat'], 1),
('Top Search', 'top-search', 'Prioritaskan di hasil pencarian teratas', 5, 7, 'ArrowUp', 'blue', ARRAY['Posisi teratas', 'Visibilitas 3x lipat'], 2),
('Featured', 'featured', 'Tampilkan di halaman utama', 10, 14, 'Star', 'purple', ARRAY['Halaman utama', 'Badge eksklusif', '14 hari'], 3);

-- Inspection Categories
INSERT INTO inspection_categories (name, description, icon, display_order, total_items) VALUES
('Eksterior', 'Pemeriksaan bagian luar kendaraan', 'car', 1, 45),
('Interior', 'Pemeriksaan bagian dalam kendaraan', 'armchair', 2, 35),
('Mesin', 'Pemeriksaan mesin dan performa', 'cog', 3, 40),
('Rangka & Chassis', 'Pemeriksaan struktur kendaraan', 'wrench', 4, 25),
('Elektrikal', 'Pemeriksaan sistem kelistrikan', 'zap', 5, 15);

-- Inspection Items
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical)
SELECT id, 'Bumper Depan', 'Kondisi bumper depan', 1, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Bumper Belakang', 'Kondisi bumper belakang', 2, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Kap Mesin', 'Kondisi kap mesin', 3, false FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Lampu Depan', 'Kondisi lampu depan', 4, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Lampu Belakang', 'Kondisi lampu belakang', 5, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Kaca Depan', 'Kondisi kaca depan', 6, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Ban Depan Kiri', 'Kondisi ban depan kiri', 7, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Ban Depan Kanan', 'Kondisi ban depan kanan', 8, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Ban Belakang Kiri', 'Kondisi ban belakang kiri', 9, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Ban Belakang Kanan', 'Kondisi ban belakang kanan', 10, true FROM inspection_categories WHERE name = 'Eksterior'
UNION ALL SELECT id, 'Dashboard', 'Kondisi dashboard', 1, false FROM inspection_categories WHERE name = 'Interior'
UNION ALL SELECT id, 'Setir', 'Kondisi setir', 2, true FROM inspection_categories WHERE name = 'Interior'
UNION ALL SELECT id, 'AC', 'Kondisi sistem AC', 3, true FROM inspection_categories WHERE name = 'Interior'
UNION ALL SELECT id, 'Speedometer', 'Kondisi meter cluster', 4, true FROM inspection_categories WHERE name = 'Interior'
UNION ALL SELECT id, 'Mesin Start', 'Kondisi starter mesin', 1, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL SELECT id, 'Suara Mesin', 'Kondisi suara mesin', 2, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL SELECT id, 'Transmisi', 'Kondisi transmisi', 3, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL SELECT id, 'Oli Mesin', 'Kondisi oli mesin', 4, true FROM inspection_categories WHERE name = 'Mesin'
UNION ALL SELECT id, 'Chassis Utama', 'Kondisi chassis', 1, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL SELECT id, 'Suspensi Depan', 'Kondisi suspensi depan', 2, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL SELECT id, 'Rem Depan', 'Kondisi rem depan', 3, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL SELECT id, 'Rem Belakang', 'Kondisi rem belakang', 4, true FROM inspection_categories WHERE name = 'Rangka & Chassis'
UNION ALL SELECT id, 'Baterai/Aki', 'Kondisi aki', 1, true FROM inspection_categories WHERE name = 'Elektrikal'
UNION ALL SELECT id, 'Lampu', 'Fungsi lampu', 2, true FROM inspection_categories WHERE name = 'Elektrikal'
UNION ALL SELECT id, 'Klakson', 'Fungsi klakson', 3, true FROM inspection_categories WHERE name = 'Elektrikal';

-- ==============================================================
-- INDEXES
-- ==============================================================
CREATE INDEX idx_listings_user ON car_listings(user_id);
CREATE INDEX idx_listings_dealer ON car_listings(dealer_id);
CREATE INDEX idx_listings_status ON car_listings(status);
CREATE INDEX idx_listings_brand ON car_listings(brand_id);
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallets_dealer ON wallets(dealer_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);

-- ==============================================================
-- ROW LEVEL SECURITY
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

SELECT '72 tables created successfully!' as message;
