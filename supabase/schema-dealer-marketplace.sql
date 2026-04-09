-- ==============================================================
-- DEALER MARKETPLACE SCHEMA
-- Workflow: User Tawar ke Dealer (Direct Deal)
-- ==============================================================

-- ═══════════════════════════════════════════════════════════════
-- MODIFIKASI TABEL car_listings - TAMBAHKAN VISIBILITY
-- ═══════════════════════════════════════════════════════════════
-- Note: Run these as ALTER if table exists

-- Add visibility columns to car_listings (one at a time for PostgreSQL)
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS published_to_dealer_marketplace_at TIMESTAMP;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS tokens_spent_for_dealer_marketplace INT DEFAULT 0;

-- Add check constraint for visibility
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'car_listings_visibility_check'
    ) THEN
        ALTER TABLE car_listings ADD CONSTRAINT car_listings_visibility_check 
        CHECK (visibility IN ('public', 'dealer_marketplace', 'both'));
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- TABEL: dealer_marketplace_settings (Konfigurasi)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS dealer_marketplace_settings CASCADE;
CREATE TABLE dealer_marketplace_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Token Configuration
    token_cost_public INT DEFAULT 1, -- Token untuk public marketplace
    token_cost_dealer_marketplace INT DEFAULT 2, -- Token untuk dealer marketplace (2x)
    token_cost_both INT DEFAULT 3, -- Token untuk keduanya (public + dealer)
    
    -- Offer Duration
    default_offer_duration_hours INT DEFAULT 72, -- 3 hari
    
    -- Inspection
    inspection_cost BIGINT DEFAULT 250000,
    inspection_required_for_dealer_marketplace BOOLEAN DEFAULT false,
    
    -- Platform Fee (coming soon - currently free)
    platform_fee_percentage DECIMAL(5,2) DEFAULT 0,
    platform_fee_enabled BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings (only if not exists)
INSERT INTO dealer_marketplace_settings (
    token_cost_public, 
    token_cost_dealer_marketplace, 
    token_cost_both,
    default_offer_duration_hours,
    inspection_cost
) 
SELECT 1, 2, 3, 72, 250000
WHERE NOT EXISTS (SELECT 1 FROM dealer_marketplace_settings LIMIT 1);

-- ═══════════════════════════════════════════════════════════════
-- TABEL: dealer_offers (Penawaran dari Dealer ke User)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS dealer_offers CASCADE;
CREATE TABLE dealer_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_number TEXT UNIQUE,
    
    -- Relasi
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Penawaran
    offer_price BIGINT NOT NULL,
    original_price BIGINT, -- Harga yang diminta user
    message TEXT,
    
    -- Opsi tambahan dari dealer
    financing_available BOOLEAN DEFAULT false,
    financing_notes TEXT,
    inspection_included BOOLEAN DEFAULT false,
    pickup_service BOOLEAN DEFAULT false,
    pickup_location TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'viewed', 'negotiating', 'accepted', 'rejected', 'expired', 'withdrawn')),
    
    -- Timeline
    viewed_at TIMESTAMP,
    responded_at TIMESTAMP,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    withdrawn_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Counter offer (negosiasi)
    counter_offer_price BIGINT,
    counter_offer_by UUID REFERENCES profiles(id), -- siapa yang counter (user/dealer)
    counter_offer_message TEXT,
    counter_offer_at TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- TABEL: dealer_offer_histories (Riwayat Negosiasi)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS dealer_offer_histories CASCADE;
CREATE TABLE dealer_offer_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES dealer_offers(id) ON DELETE CASCADE,
    
    action TEXT NOT NULL 
        CHECK (action IN ('created', 'viewed', 'counter_offered', 'accepted', 'rejected', 'withdrawn', 'expired', 'message')),
    
    -- Price changes
    previous_price BIGINT,
    new_price BIGINT,
    
    -- Actor
    actor_id UUID REFERENCES profiles(id),
    actor_type TEXT CHECK (actor_type IN ('dealer', 'user')),
    
    -- Message
    message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- TABEL: dealer_marketplace_favorites (Favorit Dealer)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS dealer_marketplace_favorites CASCADE;
CREATE TABLE dealer_marketplace_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES profiles(id), -- Staff yang save
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(dealer_id, car_listing_id)
);

-- ═══════════════════════════════════════════════════════════════
-- TABEL: dealer_marketplace_views (Tracking View)
-- ═══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS dealer_marketplace_views CASCADE;
CREATE TABLE dealer_marketplace_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES profiles(id),
    view_duration_seconds INT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_car_listings_visibility ON car_listings(visibility);
CREATE INDEX IF NOT EXISTS idx_car_listings_dealer_marketplace ON car_listings(visibility) 
    WHERE visibility IN ('dealer_marketplace', 'both');

CREATE INDEX IF NOT EXISTS idx_dealer_offers_dealer ON dealer_offers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_listing ON dealer_offers(car_listing_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_user ON dealer_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_status ON dealer_offers(status);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_expires ON dealer_offers(expires_at);

CREATE INDEX IF NOT EXISTS idx_dealer_offer_histories_offer ON dealer_offer_histories(offer_id);

CREATE INDEX IF NOT EXISTS idx_dealer_marketplace_favorites_dealer ON dealer_marketplace_favorites(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_marketplace_favorites_listing ON dealer_marketplace_favorites(car_listing_id);

CREATE INDEX IF NOT EXISTS idx_dealer_marketplace_views_dealer ON dealer_marketplace_views(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_marketplace_views_listing ON dealer_marketplace_views(car_listing_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE dealer_marketplace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_offer_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_marketplace_views ENABLE ROW LEVEL SECURITY;

-- Settings: Public read, admin write
CREATE POLICY "Public read settings" ON dealer_marketplace_settings
    FOR SELECT USING (true);

-- Offers: User can see offers to them, Dealer can see their offers
CREATE POLICY "Users view their offers" ON dealer_offers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Dealers view their offers" ON dealer_offers
    FOR SELECT USING (
        dealer_id IN (SELECT id FROM dealers WHERE owner_id = auth.uid())
        OR dealer_id IN (SELECT dealer_id FROM dealer_staff WHERE user_id = auth.uid())
    );

CREATE POLICY "Dealers create offers" ON dealer_offers
    FOR INSERT WITH CHECK (
        dealer_id IN (SELECT id FROM dealers WHERE owner_id = auth.uid())
        OR dealer_id IN (SELECT dealer_id FROM dealer_staff WHERE user_id = auth.uid())
    );

CREATE POLICY "Dealers update their offers" ON dealer_offers
    FOR UPDATE USING (
        dealer_id IN (SELECT id FROM dealers WHERE owner_id = auth.uid())
        OR dealer_id IN (SELECT dealer_id FROM dealer_staff WHERE user_id = auth.uid())
    );

CREATE POLICY "Users update offers to them" ON dealer_offers
    FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: Auto-generate offer_number
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION generate_offer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.offer_number IS NULL THEN
        NEW.offer_number := 'OFR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
            LPAD(nextval('offer_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for offer numbers
DROP SEQUENCE IF EXISTS offer_number_seq CASCADE;
CREATE SEQUENCE offer_number_seq START 1;

-- Create trigger
DROP TRIGGER IF EXISTS trg_generate_offer_number ON dealer_offers;
CREATE TRIGGER trg_generate_offer_number
    BEFORE INSERT ON dealer_offers
    FOR EACH ROW
    EXECUTE FUNCTION generate_offer_number();

-- ═══════════════════════════════════════════════════════════════
-- FUNCTION: Get dealer marketplace listings
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_dealer_marketplace_listings(
    p_dealer_id UUID DEFAULT NULL,
    p_brand_id UUID DEFAULT NULL,
    p_model_id UUID DEFAULT NULL,
    p_min_price BIGINT DEFAULT NULL,
    p_max_price BIGINT DEFAULT NULL,
    p_province_id UUID DEFAULT NULL,
    p_city_id UUID DEFAULT NULL,
    p_year_from INT DEFAULT NULL,
    p_year_to INT DEFAULT NULL,
    p_has_inspection BOOLEAN DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'newest',
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    listing_number TEXT,
    title TEXT,
    brand_name TEXT,
    model_name TEXT,
    year INT,
    price_cash BIGINT,
    mileage INT,
    city TEXT,
    province TEXT,
    fuel fuel_type,
    transmission transmission_type,
    body_type body_type,
    exterior_color TEXT,
    condition vehicle_condition,
    has_inspection BOOLEAN,
    inspection_grade TEXT,
    inspection_score DECIMAL,
    primary_image_url TEXT,
    view_count INT,
    favorite_count INT,
    dealer_offer_count BIGINT,
    published_at TIMESTAMP,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.listing_number,
        cl.title,
        b.name AS brand_name,
        cm.name AS model_name,
        cl.year,
        cl.price_cash,
        cl.mileage,
        cl.city,
        cl.province,
        cl.fuel,
        cl.transmission,
        cl.body_type,
        cc.name AS exterior_color,
        cl.condition,
        CASE WHEN ci.id IS NOT NULL THEN true ELSE false END AS has_inspection,
        ci.overall_grade AS inspection_grade,
        ci.inspection_score AS inspection_score,
        (SELECT image_url FROM car_images WHERE car_listing_id = cl.id AND is_primary = true LIMIT 1) AS primary_image_url,
        cl.view_count,
        cl.favorite_count,
        (SELECT COUNT(*) FROM dealer_offers WHERE car_listing_id = cl.id) AS dealer_offer_count,
        cl.published_to_dealer_marketplace_at AS published_at,
        cl.created_at
    FROM car_listings cl
    LEFT JOIN brands b ON cl.brand_id = b.id
    LEFT JOIN car_models cm ON cl.model_id = cm.id
    LEFT JOIN car_colors cc ON cl.exterior_color_id = cc.id
    LEFT JOIN car_inspections ci ON cl.id = ci.car_listing_id AND ci.status = 'completed'
    WHERE 
        cl.status = 'active'
        AND cl.deleted_at IS NULL
        AND cl.visibility IN ('dealer_marketplace', 'both')
        AND (p_brand_id IS NULL OR cl.brand_id = p_brand_id)
        AND (p_model_id IS NULL OR cl.model_id = p_model_id)
        AND (p_min_price IS NULL OR cl.price_cash >= p_min_price)
        AND (p_max_price IS NULL OR cl.price_cash <= p_max_price)
        AND (p_province_id IS NULL OR cl.province_id = p_province_id)
        AND (p_city_id IS NULL OR cl.city_id = p_city_id)
        AND (p_year_from IS NULL OR cl.year >= p_year_from)
        AND (p_year_to IS NULL OR cl.year <= p_year_to)
        AND (p_has_inspection IS NULL OR 
             (p_has_inspection = true AND ci.id IS NOT NULL) OR 
             (p_has_inspection = false AND ci.id IS NULL))
    ORDER BY 
        CASE WHEN p_sort_by = 'newest' THEN cl.published_to_dealer_marketplace_at END DESC,
        CASE WHEN p_sort_by = 'oldest' THEN cl.published_to_dealer_marketplace_at END ASC,
        CASE WHEN p_sort_by = 'price_asc' THEN cl.price_cash END ASC,
        CASE WHEN p_sort_by = 'price_desc' THEN cl.price_cash END DESC,
        CASE WHEN p_sort_by = 'mileage_asc' THEN cl.mileage END ASC,
        CASE WHEN p_sort_by = 'mileage_desc' THEN cl.mileage END DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
