-- =====================================================
-- FIX SCHEMA FOR ADMIN PAGES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Ensure user_tokens table exists with correct columns
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Balance
    balance INTEGER DEFAULT 0,
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,  -- For admin page compatibility
    total_bonus INTEGER DEFAULT 0,
    
    -- Timestamps
    last_purchase_at TIMESTAMPTZ,
    last_usage_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0),
    CONSTRAINT chk_user_or_dealer CHECK (user_id IS NOT NULL OR dealer_id IS NOT NULL)
);

-- 2. Add missing columns if they don't exist
DO $$
BEGIN
    -- Add total_spent column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_tokens' AND column_name = 'total_spent'
    ) THEN
        ALTER TABLE user_tokens ADD COLUMN total_spent INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Ensure dealers table exists
CREATE TABLE IF NOT EXISTS dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tokens_user ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_dealer ON user_tokens(dealer_id);

-- 5. Enable RLS
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- 6. Create policies
DO $$
BEGIN
    -- Policy for user_tokens
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_tokens' AND policyname = 'Public can view user tokens'
    ) THEN
        CREATE POLICY "Public can view user tokens" ON user_tokens FOR SELECT USING (true);
    END IF;
    
    -- Policy for dealers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'dealers' AND policyname = 'Public can view dealers'
    ) THEN
        CREATE POLICY "Public can view dealers" ON dealers FOR SELECT USING (is_active = TRUE);
    END IF;
END $$;

-- 7. Insert sample user_tokens for demo user if not exists
INSERT INTO user_tokens (user_id, balance, total_purchased, total_spent, total_used)
SELECT 
    p.id, 
    100,  -- 100 tokens balance
    200,  -- 200 tokens purchased
    100,  -- 100 tokens spent (in IDR)
    100   -- 100 tokens used
FROM profiles p
WHERE p.id = 'demo-user-001'
AND NOT EXISTS (SELECT 1 FROM user_tokens WHERE user_id = 'demo-user-001')
ON CONFLICT DO NOTHING;

-- 8. Update total_spent from total_used for existing records
UPDATE user_tokens SET total_spent = total_used WHERE total_spent = 0 OR total_spent IS NULL;

-- Done!
SELECT 'Admin schema fixed successfully!' AS message;
