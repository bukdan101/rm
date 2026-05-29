-- ==============================================================
-- INSPECTION SYSTEM - Complete Schema
-- AutoMarket Car Marketplace
-- ==============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. INSPECTION PRICING (Admin managed)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS inspection_pricing CASCADE;
CREATE TABLE inspection_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('self', 'professional', 'certificate')) NOT NULL,
    
    -- Token costs
    token_cost INT DEFAULT 0,
    
    -- Features
    includes_inspector BOOLEAN DEFAULT false,
    includes_certificate BOOLEAN DEFAULT false,
    includes_ai_analysis BOOLEAN DEFAULT true,
    certificate_validity_days INT DEFAULT 90,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. INSPECTION BOOKINGS
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS inspection_bookings CASCADE;
CREATE TABLE inspection_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    inspector_id UUID REFERENCES profiles(id),
    pricing_id UUID REFERENCES inspection_pricing(id),
    
    -- Type
    inspection_type TEXT CHECK (inspection_type IN ('self', 'professional')) NOT NULL DEFAULT 'self',
    
    -- Schedule (for professional)
    scheduled_date TIMESTAMP,
    location_address TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_notes TEXT,
    
    -- Payment
    token_cost INT DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMP,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',        -- Waiting for payment/schedule
        'scheduled',      -- Scheduled (professional)
        'confirmed',      -- Confirmed by inspector
        'in_progress',    -- Inspection in progress
        'completed',      -- Inspection completed
        'cancelled'       -- Cancelled
    )),
    
    -- Notes
    user_notes TEXT,
    inspector_notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. EXTEND CAR_INSPECTIONS TABLE
-- ═══════════════════════════════════════════════════════════════
-- Add new columns to existing car_inspections table
DO $$
BEGIN
    -- Add columns if not exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'booking_id') THEN
        ALTER TABLE car_inspections ADD COLUMN booking_id UUID REFERENCES inspection_bookings(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'inspection_type') THEN
        ALTER TABLE car_inspections ADD COLUMN inspection_type TEXT DEFAULT 'self' CHECK (inspection_type IN ('self', 'professional'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'purchase_price') THEN
        ALTER TABLE car_inspections ADD COLUMN purchase_price BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'ai_price_min') THEN
        ALTER TABLE car_inspections ADD COLUMN ai_price_min BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'ai_price_max') THEN
        ALTER TABLE car_inspections ADD COLUMN ai_price_max BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'ai_price_recommended') THEN
        ALTER TABLE car_inspections ADD COLUMN ai_price_recommended BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'ai_profit_margin') THEN
        ALTER TABLE car_inspections ADD COLUMN ai_profit_margin DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'ai_demand_level') THEN
        ALTER TABLE car_inspections ADD COLUMN ai_demand_level TEXT CHECK (ai_demand_level IN ('high', 'medium', 'low'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'has_certificate') THEN
        ALTER TABLE car_inspections ADD COLUMN has_certificate BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'certificate_purchased_at') THEN
        ALTER TABLE car_inspections ADD COLUMN certificate_purchased_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'car_inspections' AND column_name = 'days_to_sell_estimate') THEN
        ALTER TABLE car_inspections ADD COLUMN days_to_sell_estimate INT;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 4. AI PRICE ANALYSIS LOG
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS ai_price_analysis CASCADE;
CREATE TABLE ai_price_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id),
    
    -- Input
    purchase_price BIGINT,
    
    -- AI Output - Price Estimates
    estimated_price_min BIGINT,
    estimated_price_max BIGINT,
    recommended_price BIGINT,
    market_average_price BIGINT,
    
    -- Analysis
    condition_score DECIMAL(5,2),
    market_demand TEXT CHECK (market_demand IN ('high', 'medium', 'low')),
    days_to_sell_estimate INT,
    profit_margin_percent DECIMAL(5,2),
    
    -- Recommendation
    recommendation TEXT,
    risk_factors JSONB,
    similar_listings JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 5. CERTIFICATE PURCHASES
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS certificate_purchases CASCADE;
CREATE TABLE certificate_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_number TEXT UNIQUE,
    inspection_id UUID REFERENCES car_inspections(id),
    user_id UUID REFERENCES profiles(id),
    car_listing_id UUID REFERENCES car_listings(id),
    
    -- Payment
    token_cost INT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMP,
    
    -- Certificate
    certificate_number TEXT UNIQUE,
    certificate_url TEXT,
    issued_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 6. INSPECTOR PROFILES (Extended from profiles)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS inspector_profiles CASCADE;
CREATE TABLE inspector_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) UNIQUE,
    
    -- Professional Info
    employee_id TEXT,
    specialization TEXT[],
    certification_level TEXT CHECK (certification_level IN ('junior', 'senior', 'expert')),
    years_of_experience INT DEFAULT 0,
    
    -- Stats
    total_inspections INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    working_area TEXT[],
    max_daily_inspections INT DEFAULT 5,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. INSPECTION COMMENTS (Per item)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS inspection_item_comments CASCADE;
CREATE TABLE inspection_item_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_result_id UUID REFERENCES inspection_results(id) ON DELETE CASCADE,
    comment TEXT,
    repair_cost_estimate BIGINT,
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA - INSPECTION PRICING
-- ═══════════════════════════════════════════════════════════════
INSERT INTO inspection_pricing (name, description, type, token_cost, includes_inspector, includes_certificate, includes_ai_analysis, certificate_validity_days, is_popular, display_order) VALUES
('Inspeksi Mandiri', 'Isi formulir inspeksi sendiri, dapatkan analisis AI gratis', 'self', 0, false, false, true, 0, false, 1),
('Inspeksi Profesional', 'Inspector profesional datang ke lokasi Anda, sertifikat otomatis', 'professional', 50, true, true, true, 90, true, 2),
('Beli Sertifikat', 'Tingkatkan inspeksi mandiri Anda dengan sertifikat resmi', 'certificate', 25, false, true, true, 90, false, 3);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_user ON inspection_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_inspector ON inspection_bookings(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_listing ON inspection_bookings(car_listing_id);
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_status ON inspection_bookings(status);
CREATE INDEX IF NOT EXISTS idx_inspection_bookings_scheduled ON inspection_bookings(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_car_inspections_booking ON car_inspections(booking_id);
CREATE INDEX IF NOT EXISTS idx_car_inspections_type ON car_inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_car_inspections_certificate ON car_inspections(has_certificate);

CREATE INDEX IF NOT EXISTS idx_certificate_purchases_user ON certificate_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_purchases_inspection ON certificate_purchases(inspection_id);

CREATE INDEX IF NOT EXISTS idx_inspector_profiles_user ON inspector_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_inspector_profiles_available ON inspector_profiles(is_available);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE inspection_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_price_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspector_profiles ENABLE ROW LEVEL SECURITY;

-- Public read pricing
CREATE POLICY "Public read inspection pricing" ON inspection_pricing FOR SELECT USING (is_active = true);

-- Users manage own bookings
CREATE POLICY "Users view own bookings" ON inspection_bookings FOR SELECT USING (auth.uid() = user_id OR auth.uid() = inspector_id);
CREATE POLICY "Users create own bookings" ON inspection_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON inspection_bookings FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = inspector_id);

-- Users view own certificates
CREATE POLICY "Users view own certificates" ON certificate_purchases FOR SELECT USING (auth.uid() = user_id);

-- Public read inspector profiles
CREATE POLICY "Public read active inspectors" ON inspector_profiles FOR SELECT USING (is_active = true AND is_verified = true);
