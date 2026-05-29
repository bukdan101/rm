-- =====================================================
-- AI PRICE PREDICTION SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Complex AI prediction with VLM, Market Data, Inspection, Seller Trust
-- =====================================================

-- =====================================================
-- TABLE 1: ai_predictions
-- Main table for storing AI prediction results
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_number VARCHAR(50) UNIQUE,
    
    -- User/Dealer info
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    
    -- Vehicle Data
    brand_id UUID REFERENCES brands(id),
    model_id UUID REFERENCES car_models(id),
    variant_id UUID REFERENCES car_variants(id),
    year INTEGER NOT NULL,
    transmission VARCHAR(20),
    fuel_type VARCHAR(20),
    mileage INTEGER, -- in km
    exterior_color_id UUID REFERENCES car_colors(id),
    interior_color_id UUID REFERENCES car_colors(id),
    
    -- Location
    province_id UUID REFERENCES provinces(id),
    city_id UUID REFERENCES cities(id),
    location_text VARCHAR(255),
    
    -- Purchase Info (optional)
    purchase_price BIGINT, -- harga beli
    purchase_year INTEGER,
    purchase_from VARCHAR(50), -- dealer, individual, auction
    
    -- Condition Assessment
    condition_score DECIMAL(3,2), -- 0.00 - 10.00
    condition_grade VARCHAR(5), -- A+, A, B+, B, C, D, E
    exterior_grade VARCHAR(5),
    interior_grade VARCHAR(5),
    engine_grade VARCHAR(5),
    
    -- VLM Analysis Results
    vlm_analysis JSONB, -- full VLM response
    vlm_condition_score DECIMAL(3,2),
    vlm_damages JSONB, -- detected damages
    vlm_features JSONB, -- detected features
    vlm_confidence DECIMAL(5,2), -- percentage
    
    -- Inspection Data
    inspection_id UUID REFERENCES car_inspections(id),
    inspection_score INTEGER, -- 0-100
    inspection_grade VARCHAR(5),
    inspection_items_total INTEGER,
    inspection_items_passed INTEGER,
    inspection_items_failed INTEGER,
    estimated_repair_cost BIGINT,
    
    -- Market Data Analysis
    market_avg_price BIGINT,
    market_low_price BIGINT,
    market_high_price BIGINT,
    market_median_price BIGINT,
    market_listings_analyzed INTEGER,
    market_trend VARCHAR(20), -- rising, falling, stable
    market_trend_percentage DECIMAL(5,2),
    market_data_json JSONB, -- detailed market analysis
    
    -- Seller Trust Factor
    seller_type VARCHAR(20), -- user, dealer
    seller_rating DECIMAL(3,2),
    seller_trust_score DECIMAL(5,2), -- 0-100
    seller_verified BOOLEAN DEFAULT FALSE,
    seller_total_transactions INTEGER DEFAULT 0,
    seller_trust_adjustment DECIMAL(5,2), -- percentage adjustment
    
    -- Final Prediction
    predicted_price_low BIGINT,
    predicted_price_high BIGINT,
    predicted_price_recommended BIGINT,
    prediction_confidence DECIMAL(5,2), -- overall confidence
    prediction_factors JSONB, -- breakdown of all factors
    
    -- Quick Sale Price
    quick_sale_price BIGINT, -- price for quick sale
    optimal_price BIGINT, -- price for max profit
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed', -- pending, processing, completed, failed
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- prediction validity
    
    -- Indexes
    CONSTRAINT valid_confidence CHECK (prediction_confidence >= 0 AND prediction_confidence <= 100)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user ON ai_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_dealer ON ai_predictions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_brand_model ON ai_predictions(brand_id, model_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_year ON ai_predictions(year);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_status ON ai_predictions(status);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_created ON ai_predictions(created_at DESC);

-- =====================================================
-- TABLE 2: prediction_photos
-- Photos uploaded for AI prediction
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES ai_predictions(id) ON DELETE CASCADE,
    
    -- Photo Info
    photo_type VARCHAR(30) NOT NULL, -- exterior_front, exterior_rear, exterior_side_left, exterior_side_right, interior_dashboard, interior_seats, interior_rear, engine, odometer, document_stnk, document_bpkb, other
    photo_url TEXT NOT NULL,
    photo_thumbnail_url TEXT,
    photo_order INTEGER DEFAULT 0,
    
    -- VLM Analysis for this photo
    vlm_analyzed BOOLEAN DEFAULT FALSE,
    vlm_analysis JSONB,
    vlm_condition_score DECIMAL(3,2),
    vlm_detections JSONB, -- detected items, damages, features
    
    -- Metadata
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prediction_photos_prediction ON prediction_photos(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_photos_type ON prediction_photos(photo_type);

-- =====================================================
-- TABLE 3: prediction_factors
-- Individual factors affecting the prediction
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID REFERENCES ai_predictions(id) ON DELETE CASCADE,
    
    -- Factor Details
    factor_category VARCHAR(50) NOT NULL, -- vehicle, condition, market, location, seller, inspection, vlm
    factor_name VARCHAR(100) NOT NULL,
    factor_value TEXT,
    
    -- Impact
    impact_type VARCHAR(20), -- positive, negative, neutral
    impact_percentage DECIMAL(5,2), -- percentage impact on price
    impact_amount BIGINT, -- absolute impact in IDR
    
    -- Weight & Score
    weight DECIMAL(3,2), -- importance weight 0-1
    score DECIMAL(5,2), -- score for this factor
    
    -- Description
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prediction_factors_prediction ON prediction_factors(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_factors_category ON prediction_factors(factor_category);

-- =====================================================
-- TABLE 4: dealer_offer_settings
-- Admin-configurable fee settings for dealer offers
-- =====================================================
CREATE TABLE IF NOT EXISTS dealer_offer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Fee Structure
    fee_type VARCHAR(30) NOT NULL, -- percentage, fixed, tiered
    fee_percentage DECIMAL(5,2) DEFAULT 5.00, -- default 5%
    fee_fixed_amount BIGINT DEFAULT 0,
    
    -- Tiered Fee Structure (if fee_type = 'tiered')
    fee_tiers JSONB, -- [{"min_price": 0, "max_price": 100000000, "fee_percentage": 5}, ...]
    
    -- Min/Max
    min_fee_amount BIGINT DEFAULT 0,
    max_fee_amount BIGINT, -- null means no max
    
    -- Applicability
    applies_to VARCHAR(20) DEFAULT 'all', -- all, dealer_only, user_only
    min_vehicle_price BIGINT DEFAULT 0,
    max_vehicle_price BIGINT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT chk_fee_type CHECK (fee_type IN ('percentage', 'fixed', 'tiered'))
);

-- =====================================================
-- TABLE 5: dealer_offers
-- Offers from dealers for "Sell to Dealer" feature
-- =====================================================
CREATE TABLE IF NOT EXISTS dealer_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_number VARCHAR(50) UNIQUE,
    
    -- Reference
    prediction_id UUID REFERENCES ai_predictions(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES car_listings(id) ON DELETE SET NULL,
    
    -- Parties
    seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_type VARCHAR(20) NOT NULL, -- user, dealer
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    
    -- Vehicle Summary
    vehicle_title VARCHAR(255),
    vehicle_year INTEGER,
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_variant VARCHAR(100),
    vehicle_mileage INTEGER,
    
    -- AI Prediction Reference
    ai_predicted_price_low BIGINT,
    ai_predicted_price_high BIGINT,
    ai_predicted_price_recommended BIGINT,
    ai_confidence DECIMAL(5,2),
    
    -- Seller's Asking Price
    seller_ask_price BIGINT,
    seller_notes TEXT,
    
    -- Dealer's Offer
    dealer_offer_price BIGINT,
    dealer_notes TEXT,
    dealer_valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Fee Calculation
    fee_setting_id UUID REFERENCES dealer_offer_settings(id),
    fee_percentage DECIMAL(5,2),
    fee_amount BIGINT,
    seller_receives BIGINT, -- offer_price - fee
    
    -- Inspection Request
    inspection_requested BOOLEAN DEFAULT FALSE,
    inspection_scheduled_at TIMESTAMP WITH TIME ZONE,
    inspection_location TEXT,
    inspection_completed BOOLEAN DEFAULT FALSE,
    inspection_id_ref UUID REFERENCES car_inspections(id),
    
    -- Counter Offers
    has_counter_offer BOOLEAN DEFAULT FALSE,
    counter_offer_count INTEGER DEFAULT 0,
    last_counter_price BIGINT,
    last_counter_by VARCHAR(20), -- seller, dealer
    counter_history JSONB, -- [{"by": "seller", "price": X, "at": timestamp}, ...]
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending', -- pending, viewed, negotiating, inspection_requested, inspection_scheduled, inspection_completed, accepted, rejected, expired, cancelled
    
    -- Acceptance
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES profiles(id),
    accepted_price BIGINT,
    
    -- Rejection
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,
    
    -- Completion
    transaction_completed_at TIMESTAMP WITH TIME ZONE,
    transaction_reference VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT chk_dealer_offer_status CHECK (status IN ('pending', 'viewed', 'negotiating', 'inspection_requested', 'inspection_scheduled', 'inspection_completed', 'accepted', 'rejected', 'expired', 'cancelled'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dealer_offers_seller ON dealer_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_dealer ON dealer_offers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_prediction ON dealer_offers(prediction_id);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_status ON dealer_offers(status);
CREATE INDEX IF NOT EXISTS idx_dealer_offers_created ON dealer_offers(created_at DESC);

-- =====================================================
-- TABLE 6: market_price_history
-- Historical market prices for better prediction
-- =====================================================
CREATE TABLE IF NOT EXISTS market_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Vehicle Reference
    brand_id UUID REFERENCES brands(id),
    model_id UUID REFERENCES car_models(id),
    variant_id UUID REFERENCES car_variants(id),
    year INTEGER NOT NULL,
    transmission VARCHAR(20),
    fuel_type VARCHAR(20),
    
    -- Price Data
    listing_id UUID REFERENCES car_listings(id) ON DELETE SET NULL,
    listed_price BIGINT,
    sold_price BIGINT, -- actual transaction price if available
    price_type VARCHAR(20), -- listing, sold, dealer_quote
    
    -- Source
    source VARCHAR(50), -- internal, external, api
    source_reference VARCHAR(100),
    
    -- Location
    province_id UUID REFERENCES provinces(id),
    city_id UUID REFERENCES cities(id),
    
    -- Condition
    condition_grade VARCHAR(5),
    mileage INTEGER,
    
    -- Metadata
    data_date DATE, -- date of the price data
    is_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_price_brand_model ON market_price_history(brand_id, model_id);
CREATE INDEX IF NOT EXISTS idx_market_price_year ON market_price_history(year);
CREATE INDEX IF NOT EXISTS idx_market_price_date ON market_price_history(data_date DESC);

-- =====================================================
-- TABLE 7: prediction_market_data
-- Cached market data for predictions
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Vehicle Reference
    brand_id UUID REFERENCES brands(id),
    model_id UUID REFERENCES car_models(id),
    variant_id UUID REFERENCES car_variants(id),
    year_from INTEGER,
    year_to INTEGER,
    
    -- Aggregated Data
    avg_price BIGINT,
    median_price BIGINT,
    min_price BIGINT,
    max_price BIGINT,
    price_std_dev BIGINT,
    
    -- Sample Size
    listings_count INTEGER,
    sold_count INTEGER,
    
    -- Trend
    price_trend VARCHAR(20), -- rising, falling, stable
    trend_percentage DECIMAL(5,2),
    trend_period_days INTEGER DEFAULT 90,
    
    -- Depreciation
    yearly_depreciation DECIMAL(5,2), -- percentage per year
    
    -- Location specific (null = national)
    province_id UUID REFERENCES provinces(id),
    
    -- Cache
    data_as_of TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prediction_market_brand_model ON prediction_market_data(brand_id, model_id);
CREATE INDEX IF NOT EXISTS idx_prediction_market_valid ON prediction_market_data(valid_until);

-- =====================================================
-- TABLE 8: ai_prediction_templates
-- Templates for different vehicle types
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_prediction_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Info
    template_name VARCHAR(100) NOT NULL,
    template_code VARCHAR(50) UNIQUE,
    description TEXT,
    
    -- Vehicle Type
    body_type VARCHAR(30),
    fuel_type VARCHAR(20),
    
    -- Base Depreciation
    base_depreciation_year1 DECIMAL(5,2) DEFAULT 15.00, -- 15% first year
    base_depreciation_year2 DECIMAL(5,2) DEFAULT 10.00, -- 10% second year
    base_depreciation_year3plus DECIMAL(5,2) DEFAULT 8.00, -- 8% per year after
    
    -- Factor Weights
    weight_vlm_analysis DECIMAL(3,2) DEFAULT 0.25,
    weight_inspection DECIMAL(3,2) DEFAULT 0.30,
    weight_market_data DECIMAL(3,2) DEFAULT 0.25,
    weight_seller_trust DECIMAL(3,2) DEFAULT 0.10,
    weight_location DECIMAL(3,2) DEFAULT 0.10,
    
    -- Price Adjustments (JSONB for flexibility)
    condition_adjustments JSONB, -- {"excellent": 10, "good": 5, "fair": -5, "poor": -15}
    mileage_adjustments JSONB, -- per km brackets
    color_adjustments JSONB, -- popular colors premium
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRIGGER: Generate prediction number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_prediction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.prediction_number IS NULL THEN
        NEW.prediction_number := 'PRED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                                 LPAD(nextval('prediction_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS prediction_number_seq;
CREATE TRIGGER trg_generate_prediction_number
    BEFORE INSERT ON ai_predictions
    FOR EACH ROW
    EXECUTE FUNCTION generate_prediction_number();

-- =====================================================
-- TRIGGER: Generate offer number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_offer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.offer_number IS NULL THEN
        NEW.offer_number := 'OFFR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                            LPAD(nextval('offer_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS offer_number_seq;
CREATE TRIGGER trg_generate_offer_number
    BEFORE INSERT ON dealer_offers
    FOR EACH ROW
    EXECUTE FUNCTION generate_offer_number();

-- =====================================================
-- TRIGGER: Update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_predictions_updated_at
    BEFORE UPDATE ON ai_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_offers_updated_at
    BEFORE UPDATE ON dealer_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealer_offer_settings_updated_at
    BEFORE UPDATE ON dealer_offer_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prediction_market_data_updated_at
    BEFORE UPDATE ON prediction_market_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_prediction_templates_updated_at
    BEFORE UPDATE ON ai_prediction_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT FEE SETTING
-- =====================================================
INSERT INTO dealer_offer_settings (
    fee_type, 
    fee_percentage, 
    applies_to, 
    is_active,
    valid_from
) VALUES (
    'percentage', 
    5.00, 
    'all', 
    TRUE,
    NOW()
) ON CONFLICT DO NOTHING;

-- =====================================================
-- INSERT DEFAULT TEMPLATES
-- =====================================================
INSERT INTO ai_prediction_templates (template_name, template_code, body_type, description) VALUES
('SUV Standard', 'SUV_STD', 'suv', 'Template standar untuk kendaraan SUV'),
('Sedan Standard', 'SEDAN_STD', 'sedan', 'Template standar untuk kendaraan Sedan'),
('MPV Standard', 'MPV_STD', 'mpv', 'Template standar untuk kendaraan MPV'),
('Hatchback Standard', 'HATCH_STD', 'hatchback', 'Template standar untuk kendaraan Hatchback'),
('Pickup Standard', 'PICKUP_STD', 'pickup', 'Template standar untuk kendaraan Pickup'),
('Electric Vehicle', 'EV_STD', NULL, 'Template untuk kendaraan listrik'),
('Hybrid Vehicle', 'HYBRID_STD', NULL, 'Template untuk kendaraan hybrid')
ON CONFLICT (template_code) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE ai_predictions IS 'Stores AI price prediction results with VLM, market data, inspection analysis';
COMMENT ON TABLE prediction_photos IS 'Photos uploaded for AI prediction with VLM analysis results';
COMMENT ON TABLE prediction_factors IS 'Individual factors affecting price prediction';
COMMENT ON TABLE dealer_offer_settings IS 'Admin-configurable fee settings for dealer offers (default 5%)';
COMMENT ON TABLE dealer_offers IS 'Offers from dealers for sell-to-dealer feature';
COMMENT ON TABLE market_price_history IS 'Historical market prices for prediction accuracy';
COMMENT ON TABLE prediction_market_data IS 'Cached aggregated market data for predictions';
COMMENT ON TABLE ai_prediction_templates IS 'Templates for different vehicle types with factor weights';
