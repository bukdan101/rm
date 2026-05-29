-- =====================================================
-- ADMIN DASHBOARD TABLES - SAFE VERSION
-- Tanpa foreign key yang ketat agar bisa dijalankan
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. KYC VERIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Reference to auth.users or profiles
    
    -- Personal Info
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Documents
    id_card_url TEXT,
    selfie_url TEXT,
    document_type VARCHAR(20) DEFAULT 'ktp',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    
    -- Review
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(status);

-- =====================================================
-- 2. TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE,
    
    -- User
    user_id UUID,
    dealer_id UUID,
    
    -- Transaction Details
    type VARCHAR(30) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Reference
    reference_type VARCHAR(50),
    reference_id UUID,
    
    -- Payment Info
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_url TEXT,
    
    -- Bank Info
    bank_name VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(100),
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- Create sequence for transaction number
CREATE SEQUENCE IF NOT EXISTS transaction_seq;

-- =====================================================
-- 3. WITHDRAWALS
-- =====================================================
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    withdrawal_number VARCHAR(50) UNIQUE,
    
    -- User
    user_id UUID,
    dealer_id UUID,
    
    -- Amount
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2),
    
    -- Bank Info
    bank_name VARCHAR(50) NOT NULL,
    bank_code VARCHAR(10),
    bank_account_number VARCHAR(50) NOT NULL,
    bank_account_name VARCHAR(100) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    
    -- Review
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Reference
    transaction_id UUID,
    
    -- Timestamps
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- Create sequence for withdrawal number
CREATE SEQUENCE IF NOT EXISTS withdrawal_seq;

-- =====================================================
-- 4. TOPUP REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS topup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topup_number VARCHAR(50) UNIQUE,
    
    -- User
    user_id UUID,
    dealer_id UUID,
    
    -- Amount
    amount DECIMAL(15,2) NOT NULL,
    tokens INTEGER,
    
    -- Payment Proof
    payment_proof_url TEXT,
    payment_method VARCHAR(50),
    payment_date DATE,
    
    -- Bank Info
    destination_bank VARCHAR(50),
    destination_account VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    
    -- Review
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Reference
    transaction_id UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topup_user ON topup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_topup_status ON topup_requests(status);

-- =====================================================
-- 5. REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reporter
    reporter_id UUID,
    
    -- Reported Content
    report_type VARCHAR(30) NOT NULL,
    reported_user_id UUID,
    reported_dealer_id UUID,
    listing_id UUID,
    
    -- Report Details
    category VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    evidence_urls TEXT[],
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'normal',
    
    -- Resolution
    resolution_notes TEXT,
    action_taken VARCHAR(50),
    
    -- Review
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);

-- =====================================================
-- 6. SUPPORT TICKETS
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE,
    
    -- User
    user_id UUID,
    dealer_id UUID,
    
    -- Ticket Details
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'normal',
    
    -- Status
    status VARCHAR(20) DEFAULT 'open',
    
    -- Assignment
    assigned_to UUID,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    resolution_notes TEXT,
    
    -- Timestamps
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);

-- Support Ticket Messages
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    
    -- Sender
    sender_id UUID,
    sender_type VARCHAR(20) DEFAULT 'user',
    
    -- Message
    message TEXT NOT NULL,
    attachments TEXT[],
    
    -- Internal Note
    is_internal BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON support_ticket_messages(ticket_id);

-- =====================================================
-- 7. BANNERS
-- =====================================================
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    
    -- Link
    link_url TEXT,
    link_target VARCHAR(10) DEFAULT '_self',
    
    -- Position
    position VARCHAR(30) DEFAULT 'home_hero',
    display_order INTEGER DEFAULT 0,
    
    -- Targeting
    target_user VARCHAR(20) DEFAULT 'all',
    
    -- Schedule
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);

-- =====================================================
-- 8. COUPONS
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Code
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Discount
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount DECIMAL(10,2),
    
    -- Usage
    usage_limit INTEGER,
    usage_per_user INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    
    -- Minimum Purchase
    min_purchase DECIMAL(10,2),
    
    -- Applicability
    applies_to VARCHAR(30) DEFAULT 'all',
    target_user VARCHAR(20) DEFAULT 'all',
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- =====================================================
-- 9. BROADCASTS
-- =====================================================
CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    
    -- Type
    broadcast_type VARCHAR(30) DEFAULT 'notification',
    
    -- Target
    target_audience VARCHAR(30) DEFAULT 'all',
    target_user_ids UUID[],
    
    -- Schedule
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    
    -- Stats
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    
    -- Created by
    created_by UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status);

-- =====================================================
-- 10. ACTIVITY LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id UUID,
    user_role VARCHAR(20),
    user_email VARCHAR(255),
    
    -- Action
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    -- Details
    description TEXT,
    metadata JSONB,
    
    -- Request Info
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- =====================================================
-- 11. CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    
    -- Hierarchy
    parent_id UUID,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Stats
    listing_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =====================================================
-- 12. BOOST SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS boost_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Boost Type
    boost_type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Pricing
    price_tokens INTEGER NOT NULL,
    price_cash DECIMAL(10,2),
    
    -- Duration
    duration_days INTEGER DEFAULT 7,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    badge_color VARCHAR(20),
    badge_icon VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default boost settings
INSERT INTO boost_settings (boost_type, name, description, price_tokens, duration_days, display_order) VALUES
('featured', 'Featured', 'Tampil di halaman utama', 5, 7, 1),
('highlight', 'Highlight', 'Border warna mencolok', 2, 7, 2),
('top_search', 'Top Search', 'Prioritas di hasil pencarian', 5, 7, 3),
('premium_badge', 'Premium Badge', 'Badge premium listing', 10, 30, 4),
('urgent', 'Urgent', 'Label urgent untuk penjualan cepat', 3, 7, 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 13. SYSTEM SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Site Info
    site_name VARCHAR(100) DEFAULT 'AutoMarket',
    site_tagline VARCHAR(255),
    site_description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Features
    maintenance_mode BOOLEAN DEFAULT FALSE,
    allow_registration BOOLEAN DEFAULT TRUE,
    allow_listing BOOLEAN DEFAULT TRUE,
    
    -- Limits
    max_listings_per_user INTEGER DEFAULT 10,
    max_images_per_listing INTEGER DEFAULT 10,
    max_message_length INTEGER DEFAULT 5000,
    
    -- Moderation
    require_listing_approval BOOLEAN DEFAULT FALSE,
    auto_approve_verified_users BOOLEAN DEFAULT TRUE,
    
    -- Notifications
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Social Links
    facebook_url VARCHAR(255),
    instagram_url VARCHAR(255),
    twitter_url VARCHAR(255),
    youtube_url VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (site_name, site_tagline, contact_email) 
VALUES ('AutoMarket', 'Marketplace Mobil Terpercaya', 'support@automarket.id')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 14. FEE SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS fee_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Platform Fees
    platform_fee_percent DECIMAL(5,2) DEFAULT 2.5,
    transaction_fee DECIMAL(10,2) DEFAULT 5000,
    
    -- Withdrawal
    withdrawal_fee DECIMAL(10,2) DEFAULT 10000,
    min_withdrawal DECIMAL(10,2) DEFAULT 50000,
    max_withdrawal_per_day DECIMAL(15,2) DEFAULT 10000000,
    
    -- Dealer Subscription
    dealer_subscription_monthly DECIMAL(12,2) DEFAULT 100000,
    dealer_subscription_yearly DECIMAL(12,2) DEFAULT 1000000,
    
    -- Token Pricing
    token_base_price DECIMAL(10,2) DEFAULT 1000,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default fee settings
INSERT INTO fee_settings (platform_fee_percent, transaction_fee, withdrawal_fee, min_withdrawal) 
VALUES (2.5, 5000, 10000, 50000)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE kyc_verifications IS 'Verifikasi identitas pengguna';
COMMENT ON TABLE transactions IS 'Semua transaksi keuangan';
COMMENT ON TABLE withdrawals IS 'Permintaan penarikan dana';
COMMENT ON TABLE topup_requests IS 'Permintaan topup saldo';
COMMENT ON TABLE reports IS 'Laporan dari user untuk konten/user lain';
COMMENT ON TABLE support_tickets IS 'Tiket bantuan customer support';
COMMENT ON TABLE support_ticket_messages IS 'Pesan dalam tiket support';
COMMENT ON TABLE banners IS 'Banner iklan/promosi';
COMMENT ON TABLE coupons IS 'Kupon diskon';
COMMENT ON TABLE broadcasts IS 'Broadcast message ke user';
COMMENT ON TABLE activity_logs IS 'Log aktivitas sistem';
COMMENT ON TABLE categories IS 'Kategori marketplace';
COMMENT ON TABLE boost_settings IS 'Pengaturan boost listing';
COMMENT ON TABLE system_settings IS 'Pengaturan sistem';
COMMENT ON TABLE fee_settings IS 'Pengaturan biaya platform';
