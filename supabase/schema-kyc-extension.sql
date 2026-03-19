-- ==============================================================
-- KYC & LOCATION EXTENSION SCHEMA
-- Run this in Supabase SQL Editor after schema-complete.sql
-- ==============================================================

-- ==============================
-- DISTRICTS TABLE (Kecamatan)
-- ==============================
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- VILLAGES TABLE (Kelurahan/Desa)
-- ==============================
CREATE TABLE IF NOT EXISTS villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  postal_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- KYC VERIFICATIONS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Personal Data
  full_name TEXT NOT NULL,
  ktp_number TEXT UNIQUE,
  phone_number TEXT,
  
  -- Location (matching idn-area-data structure)
  province_id UUID REFERENCES provinces(id),
  city_id UUID REFERENCES cities(id),
  district_id UUID REFERENCES districts(id),
  village_id UUID REFERENCES villages(id),
  full_address TEXT,
  
  -- Documents
  ktp_image_url TEXT,
  selfie_image_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'not_submitted' 
    CHECK (status IN ('not_submitted', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  -- Review Info
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INDEXES
-- ==============================
CREATE INDEX IF NOT EXISTS idx_districts_city ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_villages_district ON villages(district_id);
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(status);

-- ==============================
-- ROW LEVEL SECURITY
-- ==============================
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Public read policies for location data
CREATE POLICY "Public can view districts" ON districts
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view villages" ON villages
  FOR SELECT USING (is_active = TRUE);

-- KYC policies
CREATE POLICY "Users can view own KYC" ON kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC" ON kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC" ON kyc_verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all KYC
CREATE POLICY "Admins can view all KYC" ON kyc_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin')
    )
  );

-- Admin can update KYC status
CREATE POLICY "Admins can update KYC status" ON kyc_verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin')
    )
  );
