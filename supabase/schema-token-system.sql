-- =====================================================
-- FLEXIBLE TOKEN SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Semua harga token fleksibel, bisa di-setting oleh Admin
-- =====================================================

-- =====================================================
-- TABLE 1: token_settings
-- Master settings untuk semua harga token (Admin controlled)
-- =====================================================
CREATE TABLE IF NOT EXISTS token_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Token Price
    token_price_base INTEGER DEFAULT 1000,        -- Rp 1.000 per token
    token_price_currency VARCHAR(10) DEFAULT 'IDR',
    
    -- AI Price Prediction
    ai_prediction_tokens INTEGER DEFAULT 5,       -- 5 Token (fleksibel)
    ai_prediction_duration_hours INTEGER DEFAULT 24, -- Hasil valid 24 jam
    
    -- Listing Normal (Public Marketplace)
    listing_normal_tokens INTEGER DEFAULT 10,     -- 10 Token
    listing_normal_duration_days INTEGER DEFAULT 30, -- 30 hari
    listing_normal_chat_free BOOLEAN DEFAULT TRUE,   -- Chat gratis
    
    -- Listing Dealer (Dealer Marketplace)
    listing_dealer_tokens INTEGER DEFAULT 20,     -- 20 Token (2x normal)
    listing_dealer_duration_days INTEGER DEFAULT 7,  -- 7 hari
    listing_dealer_multiplier DECIMAL(3,2) DEFAULT 2.00, -- 2x lipat dari normal
    
    -- Dealer Contact Seller
    dealer_contact_tokens INTEGER DEFAULT 5,      -- 5 Token (1/2 harga iklan)
    dealer_contact_multiplier DECIMAL(3,2) DEFAULT 0.50, -- 1/2 dari iklan normal
    
    -- Boost Features
    boost_tokens INTEGER DEFAULT 3,               -- 3 Token
    boost_duration_days INTEGER DEFAULT 7,
    
    highlight_tokens INTEGER DEFAULT 2,           -- 2 Token
    highlight_duration_days INTEGER DEFAULT 7,
    
    featured_tokens INTEGER DEFAULT 5,            -- 5 Token
    featured_duration_days INTEGER DEFAULT 7,
    
    premium_badge_tokens INTEGER DEFAULT 10,      -- 10 Token
    premium_badge_duration_days INTEGER DEFAULT 30,
    
    -- Top Search Position
    top_search_tokens INTEGER DEFAULT 5,          -- 5 Token
    top_search_duration_days INTEGER DEFAULT 7,
    
    -- Inspeksi
    inspection_tokens INTEGER DEFAULT 0,          -- GRATIS (0 Token)
    inspection_mandatory BOOLEAN DEFAULT TRUE,    -- Wajib untuk prediksi akurat
    
    -- Auto-move Settings
    auto_move_to_public BOOLEAN DEFAULT TRUE,     -- Otomatis pindah ke public
    auto_move_gratis BOOLEAN DEFAULT TRUE,        -- Gratis saat auto-move
    remind_before_expire_days INTEGER DEFAULT 2,  -- Reminder H-2
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT chk_token_price_positive CHECK (token_price_base > 0)
);

-- =====================================================
-- TABLE 2: token_packages
-- Paket token yang bisa dibeli user/dealer
-- =====================================================
CREATE TABLE IF NOT EXISTS token_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL,                   -- "Paket Starter"
    description TEXT,                             -- "Cocok untuk pemula"
    tokens INTEGER NOT NULL,                      -- 50
    price INTEGER NOT NULL,                       -- 45000 (dalam Rupiah)
    discount_percentage DECIMAL(5,2) DEFAULT 0,   -- 10.00
    bonus_tokens INTEGER DEFAULT 0,               -- Extra 5 token gratis
    
    -- Tampilan
    is_popular BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT FALSE,
    badge_text VARCHAR(50),                       -- "Best Value"
    
    -- Target
    target_user VARCHAR(20) DEFAULT 'all',        -- all, user, dealer
    dealer_only_features JSONB,                   -- Fitur khusus dealer
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE 3: user_tokens
-- Saldo token per user
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Balance
    balance INTEGER DEFAULT 0,                    -- Saldo token saat ini
    total_purchased INTEGER DEFAULT 0,            -- Total token pernah dibeli
    total_used INTEGER DEFAULT 0,                 -- Total token terpakai
    total_bonus INTEGER DEFAULT 0,                -- Total token bonus
    
    -- Expiring Soon
    expiring_soon INTEGER DEFAULT 0,              -- Token yang akan expired
    expiring_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    last_purchase_at TIMESTAMP WITH TIME ZONE,
    last_usage_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0),
    CONSTRAINT chk_user_or_dealer CHECK (user_id IS NOT NULL OR dealer_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_dealer ON user_tokens(dealer_id);

-- =====================================================
-- TABLE 4: token_transactions
-- History semua transaksi token
-- =====================================================
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE,
    
    -- Owner
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    
    -- Transaction Type
    transaction_type VARCHAR(30) NOT NULL,        -- purchase, usage, bonus, refund, expiry
    
    -- Amount
    amount INTEGER NOT NULL,                      -- Jumlah token (+/-)
    balance_before INTEGER,                       -- Saldo sebelum
    balance_after INTEGER,                        -- Saldo sesudah
    
    -- Reference
    reference_type VARCHAR(50),                   -- listing, prediction, contact, boost, etc
    reference_id UUID,                            -- ID dari reference
    
    -- Description
    description TEXT,
    metadata JSONB,                               -- Detail tambahan
    
    -- For purchases
    package_id UUID REFERENCES token_packages(id),
    payment_id UUID,                              -- Reference ke payments table
    price_paid INTEGER,                           -- Harga yang dibayar (IDR)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_transaction_type CHECK (
        transaction_type IN ('purchase', 'usage', 'bonus', 'refund', 'expiry', 'adjustment')
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_dealer ON token_transactions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created ON token_transactions(created_at DESC);

-- Trigger: Generate transaction number
CREATE OR REPLACE FUNCTION generate_token_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_number IS NULL THEN
        NEW.transaction_number := 'TTX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                                   LPAD(nextval('token_transaction_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS token_transaction_seq;
CREATE TRIGGER trg_generate_token_transaction_number
    BEFORE INSERT ON token_transactions
    FOR EACH ROW
    EXECUTE FUNCTION generate_token_transaction_number();

-- =====================================================
-- TABLE 5: token_usage_logs
-- Detail log penggunaan token
-- =====================================================
CREATE TABLE IF NOT EXISTS token_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES token_transactions(id),
    
    -- Action Details
    action_type VARCHAR(50) NOT NULL,             -- ai_prediction, listing_normal, listing_dealer, dealer_contact, boost, etc
    tokens_used INTEGER NOT NULL,
    
    -- Settings at time of usage
    setting_snapshot JSONB,                       -- Snapshot pengaturan token saat itu
    
    -- Reference
    reference_type VARCHAR(50),
    reference_id UUID,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed',       -- pending, completed, refunded, failed
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT chk_usage_status CHECK (
        status IN ('pending', 'completed', 'refunded', 'failed')
    )
);

-- =====================================================
-- UPDATE EXISTING TABLES
-- =====================================================

-- Update ai_predictions dengan token tracking
ALTER TABLE ai_predictions ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE ai_predictions ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES token_transactions(id);
ALTER TABLE ai_predictions ADD COLUMN IF NOT EXISTS token_setting_snapshot JSONB;

-- Update dealer_offers dengan token tracking
ALTER TABLE dealer_offers ADD COLUMN IF NOT EXISTS contact_tokens_used INTEGER DEFAULT 0;
ALTER TABLE dealer_offers ADD COLUMN IF NOT EXISTS contact_transaction_id UUID REFERENCES token_transactions(id);

-- Update car_listings dengan token tracking
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'normal'; -- normal, dealer_market
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES token_transactions(id);
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS dealer_market_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS moved_to_public_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS auto_move_enabled BOOLEAN DEFAULT TRUE;

-- =====================================================
-- TRIGGER: Update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_token_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_token_settings_updated_at
    BEFORE UPDATE ON token_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_token_tables_updated_at();

CREATE TRIGGER update_token_packages_updated_at
    BEFORE UPDATE ON token_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_token_tables_updated_at();

CREATE TRIGGER update_user_tokens_updated_at
    BEFORE UPDATE ON user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_token_tables_updated_at();

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default token settings
INSERT INTO token_settings (
    token_price_base,
    ai_prediction_tokens,
    listing_normal_tokens,
    listing_normal_duration_days,
    listing_dealer_tokens,
    listing_dealer_duration_days,
    dealer_contact_tokens
) VALUES (
    1000,    -- Rp 1.000 per token
    5,       -- AI Prediction = 5 Token
    10,      -- Listing Normal = 10 Token
    30,      -- 30 hari
    20,      -- Listing Dealer = 20 Token
    7,       -- 7 hari
    5        -- Dealer Contact = 5 Token
) ON CONFLICT DO NOTHING;

-- Insert default token packages
INSERT INTO token_packages (name, description, tokens, price, discount_percentage, bonus_tokens, is_popular, is_recommended, badge_text, display_order) VALUES
('Paket Starter', 'Cocok untuk pemula yang ingin mencoba', 50, 45000, 10.00, 0, FALSE, FALSE, NULL, 1),
('Paket Pro', 'Pilihan terbaik untuk pengguna aktif', 100, 80000, 20.00, 0, TRUE, TRUE, 'Best Value', 2),
('Paket Enterprise', 'Untuk dealer dan power seller', 200, 150000, 25.00, 20, FALSE, FALSE, 'Bonus 20 Token', 3),
('Paket Ultimate', 'Maximum savings untuk profesional', 500, 350000, 30.00, 50, FALSE, FALSE, 'Bonus 50 Token', 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Get active token settings
CREATE OR REPLACE FUNCTION get_active_token_settings()
RETURNS token_settings
LANGUAGE plpgsql
AS $$
DECLARE
    settings token_settings;
BEGIN
    SELECT * INTO settings
    FROM token_settings
    WHERE is_active = TRUE
      AND (valid_until IS NULL OR valid_until > NOW())
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN settings;
END;
$$;

-- Function: Calculate token cost for action
CREATE OR REPLACE FUNCTION calculate_token_cost(
    p_action_type VARCHAR,
    p_current_settings token_settings DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_settings token_settings;
    v_cost INTEGER;
BEGIN
    -- Get settings if not provided
    IF p_current_settings IS NULL THEN
        v_settings := get_active_token_settings();
    ELSE
        v_settings := p_current_settings;
    END IF;
    
    -- Calculate cost based on action type
    CASE p_action_type
        WHEN 'ai_prediction' THEN v_cost := v_settings.ai_prediction_tokens;
        WHEN 'listing_normal' THEN v_cost := v_settings.listing_normal_tokens;
        WHEN 'listing_dealer' THEN v_cost := v_settings.listing_dealer_tokens;
        WHEN 'dealer_contact' THEN v_cost := v_settings.dealer_contact_tokens;
        WHEN 'boost' THEN v_cost := v_settings.boost_tokens;
        WHEN 'highlight' THEN v_cost := v_settings.highlight_tokens;
        WHEN 'featured' THEN v_cost := v_settings.featured_tokens;
        WHEN 'premium_badge' THEN v_cost := v_settings.premium_badge_tokens;
        WHEN 'top_search' THEN v_cost := v_settings.top_search_tokens;
        WHEN 'inspection' THEN v_cost := v_settings.inspection_tokens;
        ELSE v_cost := 0;
    END CASE;
    
    RETURN v_cost;
END;
$$;

-- Function: Deduct tokens from user
CREATE OR REPLACE FUNCTION deduct_user_tokens(
    p_user_id UUID,
    p_dealer_id UUID,
    p_amount INTEGER,
    p_action_type VARCHAR,
    p_reference_type VARCHAR DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_balance INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Get current balance
    IF p_user_id IS NOT NULL THEN
        SELECT balance INTO v_balance FROM user_tokens WHERE user_id = p_user_id FOR UPDATE;
    ELSIF p_dealer_id IS NOT NULL THEN
        SELECT balance INTO v_balance FROM user_tokens WHERE dealer_id = p_dealer_id FOR UPDATE;
    ELSE
        RETURN FALSE;
    END IF;
    
    -- Check if enough balance
    IF v_balance IS NULL OR v_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Create transaction
    INSERT INTO token_transactions (
        user_id, dealer_id, transaction_type, amount,
        balance_before, balance_after,
        reference_type, reference_id, description
    ) VALUES (
        p_user_id, p_dealer_id, 'usage', -p_amount,
        v_balance, v_balance - p_amount,
        p_reference_type, p_reference_id, p_description
    ) RETURNING id INTO v_transaction_id;
    
    -- Update balance
    IF p_user_id IS NOT NULL THEN
        UPDATE user_tokens 
        SET balance = balance - p_amount,
            total_used = total_used + p_amount,
            last_usage_at = NOW(),
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSIF p_dealer_id IS NOT NULL THEN
        UPDATE user_tokens 
        SET balance = balance - p_amount,
            total_used = total_used + p_amount,
            last_usage_at = NOW(),
            updated_at = NOW()
        WHERE dealer_id = p_dealer_id;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE token_settings IS 'Master settings untuk semua harga token - dikontrol oleh Admin';
COMMENT ON TABLE token_packages IS 'Paket token yang bisa dibeli user/dealer';
COMMENT ON TABLE user_tokens IS 'Saldo token per user/dealer';
COMMENT ON TABLE token_transactions IS 'History semua transaksi token (purchase, usage, bonus, refund)';
COMMENT ON TABLE token_usage_logs IS 'Detail log penggunaan token per aksi';

COMMENT ON COLUMN token_settings.ai_prediction_tokens IS 'Token untuk AI Price Prediction - Default 5, fleksibel via admin';
COMMENT ON COLUMN token_settings.listing_dealer_tokens IS 'Token untuk Jual ke Dealer - Default 20 (2x normal)';
COMMENT ON COLUMN token_settings.dealer_contact_tokens IS 'Token untuk Dealer Kontak Seller - Default 5 (1/2 iklan)';
