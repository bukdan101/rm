-- =====================================================
-- ADMIN TABLES - MINIMAL VERSION
-- Jalankan ini satu per satu jika perlu
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. KYC VERIFICATIONS (tabel baru)
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    full_name VARCHAR(255),
    id_number VARCHAR(50),
    id_card_url TEXT,
    selfie_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WITHDRAWALS (tabel baru)
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    withdrawal_number VARCHAR(50),
    user_id UUID,
    amount DECIMAL(15,2) DEFAULT 0,
    fee DECIMAL(15,2) DEFAULT 0,
    bank_name VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TOPUP REQUESTS (tabel baru)
CREATE TABLE IF NOT EXISTS topup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topup_number VARCHAR(50),
    user_id UUID,
    amount DECIMAL(15,2) DEFAULT 0,
    tokens INTEGER DEFAULT 0,
    payment_proof_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. REPORTS (tabel baru)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID,
    report_type VARCHAR(30),
    reported_user_id UUID,
    listing_id UUID,
    category VARCHAR(50),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SUPPORT TICKETS (tabel baru)
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50),
    user_id UUID,
    subject VARCHAR(255),
    category VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SUPPORT TICKET MESSAGES
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID,
    sender_id UUID,
    sender_type VARCHAR(20) DEFAULT 'user',
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ACTIVITY LOGS (tabel baru)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_role VARCHAR(20),
    action VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(45),
    status VARCHAR(20) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. BANNERS (tabel baru)
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    image_url TEXT,
    link_url TEXT,
    position VARCHAR(30) DEFAULT 'home_hero',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. COUPONS (tabel baru)
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    discount_type VARCHAR(20),
    discount_value DECIMAL(10,2) DEFAULT 0,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. BROADCASTS (tabel baru)
CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    message TEXT,
    broadcast_type VARCHAR(30) DEFAULT 'notification',
    target_audience VARCHAR(30) DEFAULT 'all',
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CATEGORIES (tabel baru)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    parent_id UUID,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    listing_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. BOOST SETTINGS (tabel baru)
CREATE TABLE IF NOT EXISTS boost_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boost_type VARCHAR(30),
    name VARCHAR(100),
    description TEXT,
    price_tokens INTEGER DEFAULT 0,
    duration_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. SYSTEM SETTINGS (tabel baru)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name VARCHAR(100) DEFAULT 'AutoMarket',
    site_tagline VARCHAR(255),
    contact_email VARCHAR(255),
    maintenance_mode BOOLEAN DEFAULT FALSE,
    allow_registration BOOLEAN DEFAULT TRUE,
    allow_listing BOOLEAN DEFAULT TRUE,
    max_listings_per_user INTEGER DEFAULT 10,
    require_listing_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. FEE SETTINGS (tabel baru)
CREATE TABLE IF NOT EXISTS fee_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_fee_percent DECIMAL(5,2) DEFAULT 2.5,
    transaction_fee DECIMAL(10,2) DEFAULT 5000,
    withdrawal_fee DECIMAL(10,2) DEFAULT 10000,
    min_withdrawal DECIMAL(10,2) DEFAULT 50000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default data
INSERT INTO system_settings (site_name, contact_email) VALUES ('AutoMarket', 'support@automarket.id') ON CONFLICT DO NOTHING;
INSERT INTO fee_settings DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO boost_settings (boost_type, name, price_tokens, duration_days) VALUES
('featured', 'Featured', 5, 7),
('highlight', 'Highlight', 2, 7),
('top_search', 'Top Search', 5, 7)
ON CONFLICT DO NOTHING;
