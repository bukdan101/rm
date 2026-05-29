-- =====================================================
-- MARKETPLACE LISTING SYSTEM - CORRECTED BUSINESS LOGIC
-- =====================================================
-- User bisa memilih: Dealer Only, Public Only, atau KEDUANYA
-- Status: active -> suspended (bisa di-reactivate dengan token)
-- =====================================================

-- =====================================================
-- UPDATE car_listings TABLE
-- Add marketplace-specific fields
-- =====================================================

-- Add new columns for marketplace listing
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS listing_marketplace_type VARCHAR(20) DEFAULT 'public_only';
-- Options: 'dealer_only', 'public_only', 'both'

ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS dealer_marketplace_active BOOLEAN DEFAULT FALSE;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS public_marketplace_active BOOLEAN DEFAULT FALSE;

ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS dealer_marketplace_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS public_marketplace_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS dealer_marketplace_tokens_used INTEGER DEFAULT 0;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS public_marketplace_tokens_used INTEGER DEFAULT 0;

ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS dealer_marketplace_transaction_id UUID REFERENCES token_transactions(id);
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS public_marketplace_transaction_id UUID REFERENCES token_transactions(id);

-- Track reactivate history
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS reactivate_count INTEGER DEFAULT 0;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS last_reactivated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS reactivate_history JSONB;

-- Add constraint for marketplace type
ALTER TABLE car_listings DROP CONSTRAINT IF EXISTS chk_listing_marketplace_type;
ALTER TABLE car_listings ADD CONSTRAINT chk_listing_marketplace_type 
CHECK (listing_marketplace_type IN ('dealer_only', 'public_only', 'both'));

-- =====================================================
-- UPDATE STATUS CONSTRAINT
-- Status flow: draft -> active -> suspended -> (reactivate) -> active
-- =====================================================
ALTER TABLE car_listings DROP CONSTRAINT IF EXISTS chk_listing_status;
ALTER TABLE car_listings ADD CONSTRAINT chk_listing_status 
CHECK (status IN ('draft', 'pending_payment', 'active', 'suspended', 'expired', 'sold'));

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_car_listings_marketplace_type ON car_listings(listing_marketplace_type);
CREATE INDEX IF NOT EXISTS idx_car_listings_dealer_active ON car_listings(dealer_marketplace_active) WHERE dealer_marketplace_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_car_listings_public_active ON car_listings(public_marketplace_active) WHERE public_marketplace_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_car_listings_dealer_expires ON car_listings(dealer_marketplace_expires_at);
CREATE INDEX IF NOT EXISTS idx_car_listings_public_expires ON car_listings(public_marketplace_expires_at);

-- =====================================================
-- FUNCTION: Check and Update Listing Status
-- Automatically set to suspended when both marketplaces expire
-- =====================================================
CREATE OR REPLACE FUNCTION check_listing_status(p_listing_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_listing RECORD;
    v_dealer_active BOOLEAN;
    v_public_active BOOLEAN;
    v_dealer_expired BOOLEAN;
    v_public_expired BOOLEAN;
BEGIN
    -- Get listing data
    SELECT * INTO v_listing FROM car_listings WHERE id = p_listing_id;
    
    IF NOT FOUND THEN RETURN; END IF;
    
    -- Check dealer marketplace status
    v_dealer_active := v_listing.dealer_marketplace_active;
    v_dealer_expired := v_listing.dealer_marketplace_expires_at IS NOT NULL 
                        AND v_listing.dealer_marketplace_expires_at < NOW();
    
    -- Check public marketplace status
    v_public_active := v_listing.public_marketplace_active;
    v_public_expired := v_listing.public_marketplace_expires_at IS NOT NULL 
                        AND v_listing.public_marketplace_expires_at < NOW();
    
    -- Update dealer marketplace active status
    IF v_dealer_active AND v_dealer_expired THEN
        UPDATE car_listings 
        SET dealer_marketplace_active = FALSE,
            updated_at = NOW()
        WHERE id = p_listing_id;
    END IF;
    
    -- Update public marketplace active status
    IF v_public_active AND v_public_expired THEN
        UPDATE car_listings 
        SET public_marketplace_active = FALSE,
            updated_at = NOW()
        WHERE id = p_listing_id;
    END IF;
    
    -- If both are inactive/expired, set status to suspended
    IF (NOT v_dealer_active OR v_dealer_expired) 
       AND (NOT v_public_active OR v_public_expired) THEN
        UPDATE car_listings 
        SET status = 'suspended',
            updated_at = NOW()
        WHERE id = p_listing_id 
          AND status = 'active';
    END IF;
END;
$$;

-- =====================================================
-- FUNCTION: Activate Listing in Marketplace
-- Deduct tokens and activate listing
-- =====================================================
CREATE OR REPLACE FUNCTION activate_listing_marketplace(
    p_listing_id UUID,
    p_user_id UUID,
    p_dealer_id UUID,
    p_marketplace_type VARCHAR, -- 'dealer_only', 'public_only', 'both'
    p_token_settings JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_settings JSONB := p_token_settings;
    v_dealer_tokens INTEGER;
    v_public_tokens INTEGER;
    v_dealer_duration INTEGER;
    v_public_duration INTEGER;
    v_total_tokens INTEGER;
    v_user_balance INTEGER;
    v_result JSONB;
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Get token costs from settings
    v_dealer_tokens := COALESCE((v_settings->>'listing_dealer_tokens')::INTEGER, 20);
    v_public_tokens := COALESCE((v_settings->>'listing_normal_tokens')::INTEGER, 10);
    v_dealer_duration := COALESCE((v_settings->>'listing_dealer_duration_days')::INTEGER, 7);
    v_public_duration := COALESCE((v_settings->>'listing_normal_duration_days')::INTEGER, 30);
    
    -- Calculate total tokens needed
    CASE p_marketplace_type
        WHEN 'dealer_only' THEN
            v_total_tokens := v_dealer_tokens;
        WHEN 'public_only' THEN
            v_total_tokens := v_public_tokens;
        WHEN 'both' THEN
            v_total_tokens := v_dealer_tokens + v_public_tokens;
        ELSE
            v_total_tokens := 0;
    END CASE;
    
    -- Check user balance
    IF p_user_id IS NOT NULL THEN
        SELECT balance INTO v_user_balance FROM user_tokens WHERE user_id = p_user_id;
    ELSIF p_dealer_id IS NOT NULL THEN
        SELECT balance INTO v_user_balance FROM user_tokens WHERE dealer_id = p_dealer_id;
    ELSE
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'User ID or Dealer ID required'
        );
    END IF;
    
    IF v_user_balance IS NULL OR v_user_balance < v_total_tokens THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Insufficient token balance',
            'required', v_total_tokens,
            'balance', COALESCE(v_user_balance, 0)
        );
    END IF;
    
    -- Deduct tokens (this is simplified, actual deduction should use the service)
    -- For now, we just return the calculation
    v_result := jsonb_build_object(
        'success', TRUE,
        'total_tokens', v_total_tokens,
        'marketplace_type', p_marketplace_type,
        'dealer_tokens', CASE WHEN p_marketplace_type IN ('dealer_only', 'both') THEN v_dealer_tokens ELSE 0 END,
        'public_tokens', CASE WHEN p_marketplace_type IN ('public_only', 'both') THEN v_public_tokens ELSE 0 END,
        'dealer_expires_at', CASE WHEN p_marketplace_type IN ('dealer_only', 'both') 
                                  THEN (v_now + (v_dealer_duration || ' days')::INTERVAL)::TEXT 
                                  ELSE NULL END,
        'public_expires_at', CASE WHEN p_marketplace_type IN ('public_only', 'both') 
                                  THEN (v_now + (v_public_duration || ' days')::INTERVAL)::TEXT 
                                  ELSE NULL END
    );
    
    RETURN v_result;
END;
$$;

-- =====================================================
-- FUNCTION: Reactivate Suspended Listing
-- =====================================================
CREATE OR REPLACE FUNCTION reactivate_listing(
    p_listing_id UUID,
    p_user_id UUID,
    p_dealer_id UUID,
    p_new_marketplace_type VARCHAR,
    p_token_settings JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_listing RECORD;
    v_activation_result JSONB;
BEGIN
    -- Get listing
    SELECT * INTO v_listing FROM car_listings WHERE id = p_listing_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Listing not found');
    END IF;
    
    IF v_listing.status NOT IN ('suspended', 'expired') THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Listing is not suspended');
    END IF;
    
    -- Calculate activation
    v_activation_result := activate_listing_marketplace(
        p_listing_id,
        p_user_id,
        p_dealer_id,
        p_new_marketplace_type,
        p_token_settings
    );
    
    RETURN v_activation_result;
END;
$$;

-- =====================================================
-- VIEW: Active Dealer Marketplace Listings
-- For dealers to browse
-- =====================================================
CREATE OR REPLACE VIEW dealer_marketplace_listings AS
SELECT 
    cl.*,
    b.name as brand_name,
    cm.name as model_name,
    cv.name as variant_name,
    p.full_name as seller_name,
    d.name as dealer_name,
    d.slug as dealer_slug,
    ci.image_url as primary_image
FROM car_listings cl
LEFT JOIN brands b ON cl.brand_id = b.id
LEFT JOIN car_models cm ON cl.model_id = cm.id
LEFT JOIN car_variants cv ON cl.variant_id = cv.id
LEFT JOIN profiles p ON cl.user_id = p.id
LEFT JOIN dealers d ON cl.dealer_id = d.id
LEFT JOIN car_images ci ON cl.id = ci.car_listing_id AND ci.is_primary = TRUE
WHERE cl.dealer_marketplace_active = TRUE
  AND cl.dealer_marketplace_expires_at > NOW()
  AND cl.status = 'active'
ORDER BY cl.dealer_marketplace_expires_at ASC;

-- =====================================================
-- VIEW: Active Public Marketplace Listings
-- For all users to browse
-- =====================================================
CREATE OR REPLACE VIEW public_marketplace_listings AS
SELECT 
    cl.*,
    b.name as brand_name,
    cm.name as model_name,
    cv.name as variant_name,
    p.full_name as seller_name,
    d.name as dealer_name,
    d.slug as dealer_slug,
    ci.image_url as primary_image
FROM car_listings cl
LEFT JOIN brands b ON cl.brand_id = b.id
LEFT JOIN car_models cm ON cl.model_id = cm.id
LEFT JOIN car_variants cv ON cl.variant_id = cv.id
LEFT JOIN profiles p ON cl.user_id = p.id
LEFT JOIN dealers d ON cl.dealer_id = d.id
LEFT JOIN car_images ci ON cl.id = ci.car_listing_id AND ci.is_primary = TRUE
WHERE cl.public_marketplace_active = TRUE
  AND cl.public_marketplace_expires_at > NOW()
  AND cl.status = 'active'
ORDER BY cl.created_at DESC;

-- =====================================================
-- VIEW: My Listings (for user dashboard)
-- =====================================================
CREATE OR REPLACE VIEW my_listings AS
SELECT 
    cl.*,
    b.name as brand_name,
    cm.name as model_name,
    cv.name as variant_name,
    ci.image_url as primary_image,
    -- Calculate status for each marketplace
    CASE 
        WHEN cl.dealer_marketplace_active AND cl.dealer_marketplace_expires_at > NOW() 
        THEN 'active'
        WHEN cl.dealer_marketplace_expires_at IS NOT NULL AND cl.dealer_marketplace_expires_at <= NOW() 
        THEN 'expired'
        ELSE 'inactive'
    END as dealer_marketplace_status,
    CASE 
        WHEN cl.public_marketplace_active AND cl.public_marketplace_expires_at > NOW() 
        THEN 'active'
        WHEN cl.public_marketplace_expires_at IS NOT NULL AND cl.public_marketplace_expires_at <= NOW() 
        THEN 'expired'
        ELSE 'inactive'
    END as public_marketplace_status,
    -- Days remaining
    CASE 
        WHEN cl.dealer_marketplace_expires_at > NOW() 
        THEN EXTRACT(DAY FROM (cl.dealer_marketplace_expires_at - NOW()))::INTEGER
        ELSE 0
    END as dealer_days_remaining,
    CASE 
        WHEN cl.public_marketplace_expires_at > NOW() 
        THEN EXTRACT(DAY FROM (cl.public_marketplace_expires_at - NOW()))::INTEGER
        ELSE 0
    END as public_days_remaining
FROM car_listings cl
LEFT JOIN brands b ON cl.brand_id = b.id
LEFT JOIN car_models cm ON cl.model_id = cm.id
LEFT JOIN car_variants cv ON cl.variant_id = cv.id
LEFT JOIN car_images ci ON cl.id = ci.car_listing_id AND ci.is_primary = TRUE;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON COLUMN car_listings.listing_marketplace_type IS 'Type of marketplace listing: dealer_only, public_only, or both';
COMMENT ON COLUMN car_listings.dealer_marketplace_active IS 'Whether listing is currently active in dealer marketplace';
COMMENT ON COLUMN car_listings.public_marketplace_active IS 'Whether listing is currently active in public marketplace';
COMMENT ON COLUMN car_listings.dealer_marketplace_expires_at IS 'When dealer marketplace listing expires (7 days default)';
COMMENT ON COLUMN car_listings.public_marketplace_expires_at IS 'When public marketplace listing expires (30 days default)';

COMMENT ON VIEW dealer_marketplace_listings IS 'Active listings in dealer marketplace - only dealers can see';
COMMENT ON VIEW public_marketplace_listings IS 'Active listings in public marketplace - all users can see';
COMMENT ON VIEW my_listings IS 'User/dealer own listings with marketplace status';
