-- ==============================================================
-- DEALER REGISTRATION SCHEMA
-- For dealer onboarding with business legality documents
-- ==============================================================

-- ==============================
-- DEALER REGISTRATIONS TABLE
-- ==============================
CREATE TABLE IF NOT EXISTS dealer_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dealer Info
  dealer_name TEXT NOT NULL,
  dealer_slug TEXT UNIQUE,
  dealer_phone TEXT,
  dealer_email TEXT,
  dealer_description TEXT,
  dealer_logo_url TEXT,
  
  -- Address
  province_id UUID REFERENCES provinces(id),
  city_id UUID REFERENCES cities(id),
  district_id UUID REFERENCES districts(id),
  village_id UUID REFERENCES villages(id),
  full_address TEXT,
  postal_code TEXT,
  
  -- Owner KYC (Data Pemilik)
  owner_name TEXT NOT NULL,
  owner_ktp_number TEXT,
  owner_phone TEXT,
  owner_ktp_url TEXT,          -- Foto KTP
  owner_selfie_url TEXT,        -- Selfie dengan KTP
  
  -- Business Documents (Legalitas Usaha)
  -- NPWP (WAJIB)
  npwp_number TEXT NOT NULL,
  npwp_document_url TEXT NOT NULL,  -- File PDF NPWP
  
  -- NIB (WAJIB)
  nib_number TEXT NOT NULL,
  nib_document_url TEXT NOT NULL,   -- File PDF NIB
  
  -- SIUP (OPSIONAL)
  siup_number TEXT,
  siup_document_url TEXT,
  
  -- Surat Keterangan Domisili (OPSIONAL)
  domicile_letter_url TEXT,
  
  -- Additional Documents (JSONB for flexibility)
  additional_documents JSONB DEFAULT '[]',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('draft', 'pending', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Review Info
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
-- INDEXES
-- ==============================
CREATE INDEX IF NOT EXISTS idx_dealer_reg_user ON dealer_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reg_status ON dealer_registrations(status);
CREATE INDEX IF NOT EXISTS idx_dealer_reg_slug ON dealer_registrations(dealer_slug);

-- ==============================
-- ROW LEVEL SECURITY
-- ==============================
ALTER TABLE dealer_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view own registration
CREATE POLICY "Users can view own dealer registration" ON dealer_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own registration
CREATE POLICY "Users can insert own dealer registration" ON dealer_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own registration (draft/pending only)
CREATE POLICY "Users can update own dealer registration" ON dealer_registrations
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('draft', 'pending', 'rejected'));

-- Admins can view all registrations
CREATE POLICY "Admins can view all dealer registrations" ON dealer_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin')
    )
  );

-- Admins can update all registrations
CREATE POLICY "Admins can update all dealer registrations" ON dealer_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin')
    )
  );

-- ==============================
-- TRIGGER FOR UPDATED_AT
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dealer_registrations_updated_at
  BEFORE UPDATE ON dealer_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- FUNCTION TO GENERATE SLUG
-- ==============================
CREATE OR REPLACE FUNCTION generate_dealer_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dealer_name IS NOT NULL AND NEW.dealer_slug IS NULL THEN
    NEW.dealer_slug := lower(regexp_replace(NEW.dealer_name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.dealer_slug := regexp_replace(NEW.dealer_slug, '^-+|-+$', '', 'g');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_slug_on_insert
  BEFORE INSERT ON dealer_registrations
  FOR EACH ROW
  EXECUTE FUNCTION generate_dealer_slug();
