-- ==============================================================
-- MODULE 7: RENTAL SYSTEM (6 tabel)
-- ==============================================================

-- 7.1 Car Rental Prices
DROP TABLE IF EXISTS car_rental_prices CASCADE;
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
DROP TABLE IF EXISTS rental_bookings CASCADE;
CREATE TABLE rental_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE,
    car_listing_id UUID REFERENCES car_listings(id),
    renter_id UUID REFERENCES profiles(id),
    owner_id UUID REFERENCES profiles(id),
    
    -- Schedule
    pickup_date TIMESTAMP,
    return_date TIMESTAMP,
    actual_pickup_date TIMESTAMP,
    actual_return_date TIMESTAMP,
    pickup_location TEXT,
    return_location TEXT,
    
    -- Pricing
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
    
    -- Status
    status booking_status DEFAULT 'pending',
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    -- Check
    pickup_inspection_id UUID REFERENCES car_inspections(id),
    return_inspection_id UUID REFERENCES car_inspections(id),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7.3 Rental Availability
DROP TABLE IF EXISTS rental_availability CASCADE;
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
DROP TABLE IF EXISTS rental_payments CASCADE;
CREATE TABLE rental_payments (
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
DROP TABLE IF EXISTS rental_reviews CASCADE;
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
DROP TABLE IF EXISTS rental_insurance CASCADE;
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
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    car_listing_id UUID REFERENCES car_listings(id),
    
    -- Amount
    agreed_price BIGINT,
    platform_fee BIGINT,
    seller_fee BIGINT,
    buyer_fee BIGINT,
    total_amount BIGINT,
    
    -- Status
    status order_status DEFAULT 'pending',
    
    -- Escrow
    escrow_id UUID,
    escrow_status TEXT,
    
    -- Timeline
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

-- 8.2 Order Items (for multiple items if needed)
DROP TABLE IF EXISTS order_items CASCADE;
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
DROP TABLE IF EXISTS payments CASCADE;
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
    
    status payment_status DEFAULT 'pending',
    
    -- Fees
    platform_fee BIGINT DEFAULT 0,
    processing_fee BIGINT DEFAULT 0,
    
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    failure_reason TEXT,
    
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8.4 Payment Methods (User saved payment methods)
DROP TABLE IF EXISTS payment_methods CASCADE;
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
DROP TABLE IF EXISTS escrow_accounts CASCADE;
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

-- 8.6 Transactions (Transaction Log)
DROP TABLE IF EXISTS transactions CASCADE;
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
DROP TABLE IF EXISTS refunds CASCADE;
CREATE TABLE refunds (
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
DROP TABLE IF EXISTS invoices CASCADE;
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE,
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES profiles(id),
    
    -- Items breakdown
    items JSONB,
    subtotal BIGINT,
    taxes BIGINT DEFAULT 0,
    fees BIGINT DEFAULT 0,
    discounts BIGINT DEFAULT 0,
    total BIGINT,
    
    -- Status
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
DROP TABLE IF EXISTS conversations CASCADE;
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
DROP TABLE IF EXISTS messages CASCADE;
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
DROP TABLE IF EXISTS message_attachments CASCADE;
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
DROP TABLE IF EXISTS car_reviews CASCADE;
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
DROP TABLE IF EXISTS review_votes CASCADE;
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES car_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    vote_type TEXT CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(review_id, user_id)
);

-- 10.3 Review Images
DROP TABLE IF EXISTS review_images CASCADE;
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
DROP TABLE IF EXISTS search_logs CASCADE;
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
DROP TABLE IF EXISTS recommendations CASCADE;
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
DROP TABLE IF EXISTS recent_views CASCADE;
CREATE TABLE recent_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    view_count INT DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, car_listing_id)
);

-- 11.4 Trending Cars
DROP TABLE IF EXISTS trending_cars CASCADE;
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
DROP TABLE IF EXISTS analytics_events CASCADE;
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
DROP TABLE IF EXISTS analytics_page_views CASCADE;
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
DROP TABLE IF EXISTS analytics_clicks CASCADE;
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

-- 12.4 Analytics Conversion
DROP TABLE IF EXISTS analytics_conversions CASCADE;
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
DROP TABLE IF EXISTS notifications CASCADE;
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
DROP TABLE IF EXISTS notification_templates CASCADE;
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
DROP TABLE IF EXISTS notification_logs CASCADE;
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
DROP TABLE IF EXISTS countries CASCADE;
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
DROP TABLE IF EXISTS provinces CASCADE;
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES countries(id),
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14.3 Cities
DROP TABLE IF EXISTS cities CASCADE;
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
DROP TABLE IF EXISTS districts CASCADE;
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
-- INDEXES FOR PERFORMANCE
-- ==============================================================

-- User System
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_phone ON profiles(phone);

-- Dealer System
CREATE INDEX idx_dealers_owner ON dealers(owner_id);
CREATE INDEX idx_dealers_city ON dealers(city_id);
CREATE INDEX idx_dealers_verified ON dealers(verified);
CREATE INDEX idx_dealer_reviews_dealer ON dealer_reviews(dealer_id);

-- Car Master Data
CREATE INDEX idx_car_models_brand ON car_models(brand_id);
CREATE INDEX idx_car_variants_model ON car_variants(model_id);

-- Listing System
CREATE INDEX idx_car_listings_user ON car_listings(user_id);
CREATE INDEX idx_car_listings_dealer ON car_listings(dealer_id);
CREATE INDEX idx_car_listings_brand ON car_listings(brand_id);
CREATE INDEX idx_car_listings_model ON car_listings(model_id);
CREATE INDEX idx_car_listings_year ON car_listings(year);
CREATE INDEX idx_car_listings_price ON car_listings(price_cash);
CREATE INDEX idx_car_listings_city ON car_listings(city_id);
CREATE INDEX idx_car_listings_status ON car_listings(status);
CREATE INDEX idx_car_listings_transaction ON car_listings(transaction_type);
CREATE INDEX idx_car_listings_condition ON car_listings(condition);
CREATE INDEX idx_car_listings_created ON car_listings(created_at DESC);
CREATE INDEX idx_car_listings_deleted ON car_listings(deleted_at);
CREATE INDEX idx_car_images_listing ON car_images(car_listing_id);
CREATE INDEX idx_car_favorites_user ON car_favorites(user_id);
CREATE INDEX idx_car_favorites_listing ON car_favorites(car_listing_id);
CREATE INDEX idx_car_views_listing ON car_views(car_listing_id);

-- Inspection System
CREATE INDEX idx_car_inspections_listing ON car_inspections(car_listing_id);
CREATE INDEX idx_car_inspections_inspector ON car_inspections(inspector_id);
CREATE INDEX idx_inspection_results_inspection ON inspection_results(inspection_id);
CREATE INDEX idx_inspection_items_category ON inspection_items(category_id);

-- Rental System
CREATE INDEX idx_rental_bookings_car ON rental_bookings(car_listing_id);
CREATE INDEX idx_rental_bookings_renter ON rental_bookings(renter_id);
CREATE INDEX idx_rental_availability_car_date ON rental_availability(car_listing_id, date);

-- Transaction System
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_listing ON orders(car_listing_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_order ON payments(order_id);

-- Chat System
CREATE INDEX idx_conversations_listing ON conversations(car_listing_id);
CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Review System
CREATE INDEX idx_car_reviews_listing ON car_reviews(car_listing_id);
CREATE INDEX idx_car_reviews_user ON car_reviews(user_id);

-- Search & Analytics
CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_created ON search_logs(created_at DESC);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

-- Location System
CREATE INDEX idx_provinces_country ON provinces(country_id);
CREATE INDEX idx_cities_province ON cities(province_id);
CREATE INDEX idx_districts_city ON districts(city_id);

-- ==============================================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_inventory ENABLE ROW LEVEL SECURITY;

ALTER TABLE car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_views ENABLE ROW LEVEL SECURITY;

ALTER TABLE car_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;

ALTER TABLE rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE car_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================================
-- RLS POLICIES (Sample - adjust as needed)
-- ==============================================================

-- Profiles: Users can read own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Car Listings: Public read active, owner can manage
CREATE POLICY "Public can view active listings" ON car_listings
    FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Owner can manage own listings" ON car_listings
    FOR ALL USING (auth.uid() = user_id);

-- Car Favorites: Users manage own favorites
CREATE POLICY "Users manage own favorites" ON car_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Messages: Participants can view conversation
CREATE POLICY "Conversation participants can view" ON conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Conversation participants can message" ON messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- Notifications: Users view own notifications
CREATE POLICY "Users view own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- Public tables (no auth required for read)
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read models" ON car_models FOR SELECT USING (true);
CREATE POLICY "Public read variants" ON car_variants FOR SELECT USING (true);
CREATE POLICY "Public read colors" ON car_colors FOR SELECT USING (true);
CREATE POLICY "Public read provinces" ON provinces FOR SELECT USING (true);
CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read inspection items" ON inspection_items FOR SELECT USING (true);
CREATE POLICY "Public read inspection categories" ON inspection_categories FOR SELECT USING (true);
