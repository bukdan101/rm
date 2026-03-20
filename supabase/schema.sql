-- ==============================
-- EXTENSION
-- ==============================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- ENUM
-- ==============================

-- Drop existing types if they exist (for clean re-run)
DROP TYPE IF EXISTS fuel_type CASCADE;
DROP TYPE IF EXISTS transmission_type CASCADE;
DROP TYPE IF EXISTS body_type CASCADE;
DROP TYPE IF EXISTS vehicle_transaction_type CASCADE;
DROP TYPE IF EXISTS vehicle_condition CASCADE;
DROP TYPE IF EXISTS inspection_status CASCADE;

CREATE TYPE fuel_type AS ENUM (
    'bensin',
    'diesel',
    'electric',
    'hybrid',
    'petrol_hybrid'
);

CREATE TYPE transmission_type AS ENUM (
    'automatic',
    'manual'
);

CREATE TYPE body_type AS ENUM (
    'sedan',
    'suv',
    'mpv',
    'hatchback',
    'pickup',
    'van'
);

CREATE TYPE vehicle_transaction_type AS ENUM (
    'jual',
    'beli',
    'rental'
);

CREATE TYPE vehicle_condition AS ENUM (
    'baru',
    'bekas',
    'sedang',
    'istimewa'
);

CREATE TYPE inspection_status AS ENUM (
    'baik',
    'sedang',
    'perlu_perbaikan',
    'istimewa'
);

-- ==============================
-- USERS
-- ==============================

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- BRANDS
-- ==============================

DROP TABLE IF EXISTS brands CASCADE;
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR MODELS
-- ==============================

DROP TABLE IF EXISTS car_models CASCADE;
CREATE TABLE car_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR VARIANTS
-- ==============================

DROP TABLE IF EXISTS car_variants CASCADE;
CREATE TABLE car_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES car_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR COLORS
-- ==============================

DROP TABLE IF EXISTS car_colors CASCADE;
CREATE TABLE car_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex_code TEXT,
    is_metallic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR LISTINGS
-- ==============================

DROP TABLE IF EXISTS car_listings CASCADE;
CREATE TABLE car_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    model_id UUID REFERENCES car_models(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES car_variants(id) ON DELETE SET NULL,
    year INT,
    exterior_color_id UUID REFERENCES car_colors(id) ON DELETE SET NULL,
    interior_color_id UUID REFERENCES car_colors(id) ON DELETE SET NULL,
    fuel fuel_type DEFAULT 'bensin',
    transmission transmission_type DEFAULT 'automatic',
    body_type body_type DEFAULT 'sedan',
    engine_capacity INT,
    seat_count INT,
    mileage INT,
    transaction_type vehicle_transaction_type DEFAULT 'jual',
    condition vehicle_condition DEFAULT 'bekas',
    price_cash BIGINT,
    price_credit BIGINT,
    description TEXT,
    city TEXT,
    province TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR IMAGES
-- ==============================

DROP TABLE IF EXISTS car_images CASCADE;
CREATE TABLE car_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR DOCUMENTS
-- ==============================

DROP TABLE IF EXISTS car_documents CASCADE;
CREATE TABLE car_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE UNIQUE,
    license_plate TEXT,
    sell_with_plate BOOLEAN DEFAULT false,
    stnk_status TEXT,
    bpkb_status TEXT,
    ownership_type TEXT,
    registration_date DATE,
    previous_owners INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR FEATURES
-- ==============================

DROP TABLE IF EXISTS car_features CASCADE;
CREATE TABLE car_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE UNIQUE,
    sunroof BOOLEAN DEFAULT false,
    cruise_control BOOLEAN DEFAULT false,
    rear_camera BOOLEAN DEFAULT false,
    keyless_start BOOLEAN DEFAULT false,
    service_book BOOLEAN DEFAULT false,
    airbag BOOLEAN DEFAULT false,
    abs BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- CAR INSPECTION HEADER
-- ==============================

DROP TABLE IF EXISTS car_inspections CASCADE;
CREATE TABLE car_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE,
    inspector_name TEXT,
    inspection_place TEXT,
    inspection_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    total_points INT DEFAULT 160,
    passed_points INT,
    accident_free BOOLEAN DEFAULT true,
    flood_free BOOLEAN DEFAULT true,
    fire_free BOOLEAN DEFAULT true,
    risk_level TEXT DEFAULT 'low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- MASTER INSPECTION ITEMS
-- ==============================

DROP TABLE IF EXISTS inspection_items CASCADE;
CREATE TABLE inspection_items (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    display_order INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- INSPECTION RESULTS
-- ==============================

DROP TABLE IF EXISTS inspection_results CASCADE;
CREATE TABLE inspection_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES car_inspections(id) ON DELETE CASCADE,
    item_id INT REFERENCES inspection_items(id) ON DELETE CASCADE,
    status inspection_status DEFAULT 'baik',
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- RENTAL PRICES
-- ==============================

DROP TABLE IF EXISTS car_rental_prices CASCADE;
CREATE TABLE car_rental_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_listing_id UUID REFERENCES car_listings(id) ON DELETE CASCADE UNIQUE,
    price_per_day BIGINT,
    price_per_week BIGINT,
    price_per_month BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================
-- INDEX FOR PERFORMANCE
-- ==============================

CREATE INDEX idx_car_brand ON car_listings(brand_id);
CREATE INDEX idx_car_model ON car_listings(model_id);
CREATE INDEX idx_car_year ON car_listings(year);
CREATE INDEX idx_car_price ON car_listings(price_cash);
CREATE INDEX idx_car_city ON car_listings(city);
CREATE INDEX idx_car_transaction ON car_listings(transaction_type);
CREATE INDEX idx_car_condition ON car_listings(condition);
CREATE INDEX idx_car_status ON car_listings(status);
CREATE INDEX idx_inspection_results ON inspection_results(inspection_id);
CREATE INDEX idx_inspection_items_category ON inspection_items(category);

-- ==============================
-- ENABLE RLS (Row Level Security)
-- ==============================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_rental_prices ENABLE ROW LEVEL SECURITY;

-- ==============================
-- RLS POLICIES (Allow all for now - customize as needed)
-- ==============================

CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON brands FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_models FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_models FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_variants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_variants FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_colors FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_colors FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_listings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON car_listings FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON car_images FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_features FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_features FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_inspections FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_inspections FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON inspection_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON inspection_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON inspection_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON inspection_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON car_rental_prices FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON car_rental_prices FOR INSERT WITH CHECK (true);
