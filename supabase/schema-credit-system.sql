-- ==============================================================
-- CREDIT SYSTEM SCHEMA FOR AUTOMARKET
-- Complete credit, payment, and boost system
-- ==============================================================

-- Enable UUID extension (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- 1. CREDIT PACKAGES
-- ==============================
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,           -- dalam Rupiah
  credits INTEGER NOT NULL,         -- jumlah kredit dasar
  bonus_credits INTEGER DEFAULT 0,  -- bonus kredit
  total_credits INTEGER GENERATED ALWAYS AS (credits + bonus_credits) STORED,
  is_for_dealer BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 2. USER CREDITS (Saldo)
-- ==============================
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,        -- saldo kredit saat ini
  total_earned INTEGER DEFAULT 0,   -- total kredit yang pernah diterima
  total_spent INTEGER DEFAULT 0,    -- total kredit yang pernah digunakan
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_credit UNIQUE (user_id),
  CONSTRAINT unique_dealer_credit UNIQUE (dealer_id),
  CONSTRAINT valid_owner CHECK (user_id IS NOT NULL OR dealer_id IS NOT NULL)
);

-- ==============================
-- 3. CREDIT TRANSACTIONS
-- ==============================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_credit_id UUID REFERENCES user_credits(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'purchase',           -- Pembelian paket
    'usage',              -- Penggunaan untuk listing/boost
    'bonus',              -- Bonus dari promo
    'refund',             -- Pengembalian kredit
    'registration_bonus', -- Bonus pendaftaran (500 pertama)
    'admin_adjustment'    -- Penyesuaian manual oleh admin
  )),
  amount INTEGER NOT NULL,           -- positif untuk kredit masuk, negatif untuk keluar
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,                 -- ID terkait (payment_id, listing_id, etc)
  reference_type TEXT,               -- 'payment', 'listing', 'boost', 'registration'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 4. PAYMENTS (Pembayaran BNI VA)
-- ==============================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE,
  user_id UUID REFERENCES profiles(id),
  dealer_id UUID REFERENCES dealers(id),
  package_id UUID REFERENCES credit_packages(id),
  amount INTEGER NOT NULL,           -- jumlah pembayaran
  credits_awarded INTEGER NOT NULL,  -- kredit yang akan diberikan
  payment_method TEXT DEFAULT 'bni_va' CHECK (payment_method IN ('bni_va', 'bank_transfer')),
  va_number TEXT,                    -- nomor VA BNI
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',       -- Menunggu pembayaran
    'paid',          -- Sudah dibayar, menunggu verifikasi
    'verified',      -- Diverifikasi admin, kredit sudah masuk
    'cancelled',     -- Dibatalkan
    'expired'        -- Kedaluwarsa
  )),
  paid_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  proof_url TEXT,                    -- URL bukti transfer
  admin_notes TEXT,
  user_notes TEXT,
  expires_at TIMESTAMPTZ,            -- Batas waktu pembayaran
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_payment_owner CHECK (user_id IS NOT NULL OR dealer_id IS NOT NULL)
);

-- ==============================
-- 5. BOOST FEATURES
-- ==============================
CREATE TABLE IF NOT EXISTS boost_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                -- 'highlight', 'top_search', 'featured'
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  credit_cost INTEGER NOT NULL,      -- biaya kredit
  duration_days INTEGER NOT NULL,    -- durasi dalam hari
  icon TEXT,                         -- nama icon (lucide)
  color TEXT,                        -- warna untuk UI
  benefits TEXT[],                   -- list benefit
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 6. LISTING BOOSTS
-- ==============================
CREATE TABLE IF NOT EXISTS listing_boosts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  boost_feature_id UUID NOT NULL REFERENCES boost_features(id),
  user_credit_id UUID REFERENCES user_credits(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  credits_spent INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 7. REGISTRATION BONUS TRACKER
-- ==============================
CREATE TABLE IF NOT EXISTS registration_bonus_tracker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_given INTEGER DEFAULT 0,     -- jumlah bonus yang sudah diberikan
  max_bonus INTEGER DEFAULT 500,     -- maksimal 500 pendaftar
  bonus_amount INTEGER DEFAULT 500,  -- jumlah kredit bonus
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- 8. CREDIT USAGE LOG
-- ==============================
CREATE TABLE IF NOT EXISTS credit_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_credit_id UUID REFERENCES user_credits(id),
  listing_id UUID REFERENCES car_listings(id),
  action TEXT NOT NULL CHECK (action IN (
    'create_listing',
    'extend_listing',
    'boost_listing',
    'renew_boost'
  )),
  credits_used INTEGER NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INDEXES
-- ==============================
CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_dealer ON user_credits(dealer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_credit ON credit_transactions(user_credit_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_dealer ON payments(dealer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_listing_boosts_listing ON listing_boosts(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_boosts_active ON listing_boosts(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_credit_usage_listing ON credit_usage_log(listing_id);

-- ==============================
-- ROW LEVEL SECURITY
-- ==============================
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_bonus_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_log ENABLE ROW LEVEL SECURITY;

-- Credit Packages: Public read
CREATE POLICY "Public can view active credit packages" ON credit_packages
  FOR SELECT USING (is_active = TRUE);

-- User Credits: User owns their credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM dealers WHERE dealers.id = user_credits.dealer_id AND dealers.owner_id = auth.uid()
  ));

CREATE POLICY "System can manage credits" ON user_credits
  FOR ALL USING (true);

-- Credit Transactions: User owns their transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_credits WHERE user_credits.id = credit_transactions.user_credit_id
    AND (user_credits.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM dealers WHERE dealers.id = user_credits.dealer_id AND dealers.owner_id = auth.uid()
    ))
  ));

-- Payments: User owns their payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM dealers WHERE dealers.id = payments.dealer_id AND dealers.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM dealers WHERE dealers.id = payments.dealer_id AND dealers.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM dealers WHERE dealers.id = payments.dealer_id AND dealers.owner_id = auth.uid()
  ));

-- Boost Features: Public read
CREATE POLICY "Public can view active boost features" ON boost_features
  FOR SELECT USING (is_active = TRUE);

-- Listing Boosts: User owns their boosts
CREATE POLICY "Users can view own boosts" ON listing_boosts
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM car_listings WHERE car_listings.id = listing_boosts.listing_id
    AND (car_listings.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM dealers WHERE dealers.id = car_listings.dealer_id AND dealers.owner_id = auth.uid()
    ))
  ));

CREATE POLICY "System can manage boosts" ON listing_boosts
  FOR ALL USING (true);

-- Admin policies (for all tables)
CREATE POLICY "Admins can view all credit data" ON user_credits
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can manage all credit data" ON user_credits
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can view all payments" ON payments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can manage all transactions" ON credit_transactions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- ==============================
-- TRIGGERS FOR UPDATED_AT
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boost_features_updated_at
  BEFORE UPDATE ON boost_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_boosts_updated_at
  BEFORE UPDATE ON listing_boosts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registration_bonus_tracker_updated_at
  BEFORE UPDATE ON registration_bonus_tracker
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- FUNCTIONS
-- ==============================

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_invoice_number TEXT;
BEGIN
  v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('invoice_seq')::TEXT, 4, '0');
  RETURN v_invoice_number;
END;
$$ language 'plpgsql';

-- Create sequence for invoice number
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- ==============================
-- SEED DATA: CREDIT PACKAGES (USER)
-- ==============================
INSERT INTO credit_packages (id, name, description, price, credits, bonus_credits, is_for_dealer, is_popular, is_active, display_order) VALUES
('cp-0001-0000-0000-000000000001', 'Starter', 'Paket hemat untuk mulai berjualan', 50000, 50, 0, FALSE, FALSE, TRUE, 1),
('cp-0001-0000-0000-000000000002', 'Basic', 'Paket populer untuk penjual aktif', 100000, 100, 10, FALSE, TRUE, TRUE, 2),
('cp-0001-0000-0000-000000000003', 'Standard', 'Paket terbaik untuk hasil maksimal', 250000, 250, 30, FALSE, FALSE, TRUE, 3),
('cp-0001-0000-0000-000000000004', 'Premium', 'Paket premium dengan bonus besar', 500000, 500, 75, FALSE, TRUE, TRUE, 4),
('cp-0001-0000-0000-000000000005', 'Ultimate', 'Paket terlengkap untuk serius berjualan', 1000000, 1000, 200, FALSE, FALSE, TRUE, 5);

-- ==============================
-- SEED DATA: CREDIT PACKAGES (DEALER)
-- ==============================
INSERT INTO credit_packages (id, name, description, price, credits, bonus_credits, is_for_dealer, is_popular, is_active, display_order) VALUES
('cp-0002-0000-0000-000000000001', 'Dealer Starter', 'Paket hemat untuk dealer pemula', 200000, 250, 50, TRUE, FALSE, TRUE, 1),
('cp-0002-0000-0000-000000000002', 'Dealer Pro', 'Paket profesional untuk dealer aktif', 500000, 700, 150, TRUE, TRUE, TRUE, 2),
('cp-0002-0000-0000-000000000003', 'Dealer Enterprise', 'Paket enterprise untuk dealer besar', 1000000, 1500, 500, TRUE, FALSE, TRUE, 3),
('cp-0002-0000-0000-000000000004', 'Dealer Unlimited', 'Paket unlimited untuk dealer premium', 2500000, 4000, 1500, TRUE, TRUE, TRUE, 4);

-- ==============================
-- SEED DATA: BOOST FEATURES
-- ==============================
INSERT INTO boost_features (id, name, slug, description, credit_cost, duration_days, icon, color, benefits, is_active, display_order) VALUES
('bf-0001-0000-0000-000000000001', 'Highlight', 'highlight', 'Tampilkan iklan Anda dengan background highlight yang menonjol', 3, 7, 'Sparkles', 'amber', ARRAY['Background kuning highlight', 'Lebih mudah dilihat', 'Cocok untuk iklan prioritas'], TRUE, 1),
('bf-0002-0000-0000-000000000002', 'Top Search', 'top-search', 'Prioritaskan iklan Anda di hasil pencarian teratas', 5, 7, 'ArrowUp', 'blue', ARRAY['Muncul di posisi teratas', 'Maksimal 10 iklan per halaman', 'Visibilitas meningkat 3x'], TRUE, 2),
('bf-0003-0000-0000-000000000003', 'Featured', 'featured', 'Tampilkan iklan di halaman utama sebagai iklan pilihan', 10, 14, 'Star', 'purple', ARRAY['Muncul di halaman utama', 'Badge Featured eksklusif', 'Durasi lebih lama 14 hari', 'Eksposur maksimal'], TRUE, 3);

-- ==============================
-- SEED DATA: REGISTRATION BONUS TRACKER
-- ==============================
INSERT INTO registration_bonus_tracker (id, total_given, max_bonus, bonus_amount, is_active) VALUES
('rb-0001-0000-0000-000000000001', 0, 500, 500, TRUE);

-- ==============================
-- VIEWS FOR EASY QUERYING
-- ==============================

-- View: Active listing boosts with details
CREATE OR REPLACE VIEW v_active_boosts AS
SELECT 
  lb.id,
  lb.listing_id,
  lb.boost_feature_id,
  bf.name as boost_name,
  bf.slug as boost_slug,
  bf.color,
  lb.credits_spent,
  lb.starts_at,
  lb.ends_at,
  lb.auto_renew,
  lb.is_active,
  cl.title as listing_title,
  cl.slug as listing_slug
FROM listing_boosts lb
JOIN boost_features bf ON bf.id = lb.boost_feature_id
JOIN car_listings cl ON cl.id = lb.listing_id
WHERE lb.is_active = TRUE AND lb.ends_at > NOW();

-- View: User credit summary
CREATE OR REPLACE VIEW v_user_credit_summary AS
SELECT 
  uc.id,
  uc.user_id,
  uc.dealer_id,
  uc.balance,
  uc.total_earned,
  uc.total_spent,
  p.full_name as user_name,
  p.email,
  d.name as dealer_name,
  CASE 
    WHEN uc.dealer_id IS NOT NULL THEN 'dealer'
    ELSE 'user'
  END as owner_type
FROM user_credits uc
LEFT JOIN profiles p ON p.id = uc.user_id
LEFT JOIN dealers d ON d.id = uc.dealer_id;

-- View: Payment with details
CREATE OR REPLACE VIEW v_payment_details AS
SELECT 
  p.id,
  p.invoice_number,
  p.amount,
  p.credits_awarded,
  p.payment_method,
  p.va_number,
  p.status,
  p.paid_at,
  p.verified_at,
  p.proof_url,
  p.created_at,
  p.expires_at,
  cp.name as package_name,
  cp.is_for_dealer,
  prof.full_name as user_name,
  prof.email as user_email,
  d.name as dealer_name,
  verifier.full_name as verified_by_name
FROM payments p
LEFT JOIN credit_packages cp ON cp.id = p.package_id
LEFT JOIN profiles prof ON prof.id = p.user_id
LEFT JOIN dealers d ON d.id = p.dealer_id
LEFT JOIN profiles verifier ON verifier.id = p.verified_by;
