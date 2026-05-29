-- ===========================================
-- SEED DATA FOR CARS - AutoMarket
-- Run this AFTER the main schema
-- ===========================================

-- ===========================================
-- 1. BRANDS (Merek Mobil)
-- ===========================================
INSERT INTO brands (name, slug, logo_url, is_active) VALUES
('Toyota', 'toyota', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1200px-Toyota_carlogo.svg.png', true),
('Honda', 'honda', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Honda_logo.svg/1200px-Honda_logo.svg.png', true),
('Mitsubishi', 'mitsubishi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Mitsubishi_Motors_logo.svg/1200px-Mitsubishi_Motors_logo.svg.png', true),
('Suzuki', 'suzuki', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Suzuki_logo_2.svg/1200px-Suzuki_logo_2.svg.png', true),
('Daihatsu', 'daihatsu', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Daihatsu_logo.svg/1200px-Daihatsu_logo.svg.png', true),
('Nissan', 'nissan', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nissan-logo.svg/1200px-Nissan-logo.svg.png', true),
('Mazda', 'mazda', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Mazda_logo.svg/1200px-Mazda_logo.svg.png', true),
('Hyundai', 'hyundai', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Hyundai_Motor_Company_logo.svg/1200px-Hyundai_Motor_Company_logo.svg.png', true),
('Kia', 'kia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/KIA_logo2.svg/1200px-KIA_logo2.svg.png', true),
('BMW', 'bmw', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/1200px-BMW.svg.png', true),
('Mercedes-Benz', 'mercedes-benz', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1200px-Mercedes-Logo.svg.png', true),
('Audi', 'audi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Audi_logo_detail.svg/1200px-Audi_logo_detail.svg.png', true),
('Wuling', 'wuling', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Wuling_Motors_logo.svg/1200px-Wuling_Motors_logo.svg.png', true),
('MG', 'mg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/MG_logo.svg/1200px-MG_logo.svg.png', true),
('Isuzu', 'isuzu', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Isuzu_Motors_logo.svg/1200px-Isuzu_Motors_logo.svg.png', true)
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- 2. CAR MODELS (Model Mobil)
-- ===========================================
INSERT INTO car_models (brand_id, name, slug, body_type, is_active) VALUES
-- Toyota
(1, 'Avanza', 'avanza', 'mpv', true),
(1, 'Innova', 'innova', 'mpv', true),
(1, 'Fortuner', 'fortuner', 'suv', true),
(1, 'Rush', 'rush', 'suv', true),
(1, 'Yaris', 'yaris', 'hatchback', true),
(1, 'Vios', 'vios', 'sedan', true),
(1, 'Camry', 'camry', 'sedan', true),
(1, 'Corolla Altis', 'corolla-altis', 'sedan', true),
(1, 'Hilux', 'hilux', 'pickup', true),
(1, 'Kijang Innova', 'kijang-innova', 'mpv', true),
(1, 'RAV4', 'rav4', 'suv', true),
(1, 'C-HR', 'c-hr', 'suv', true),
(1, 'Alphard', 'alphard', 'mpv', true),
(1, 'Vellfire', 'vellfire', 'mpv', true),
(1, 'Land Cruiser', 'land-cruiser', 'suv', true),
-- Honda
(2, 'Jazz', 'jazz', 'hatchback', true),
(2, 'City', 'city', 'sedan', true),
(2, 'Civic', 'civic', 'sedan', true),
(2, 'Accord', 'accord', 'sedan', true),
(2, 'CR-V', 'cr-v', 'suv', true),
(2, 'HR-V', 'hr-v', 'suv', true),
(2, 'BR-V', 'br-v', 'suv', true),
(2, 'Mobilio', 'mobilio', 'mpv', true),
(2, 'Odyssey', 'odyssey', 'mpv', true),
(2, 'Brio', 'brio', 'hatchback', true),
-- Mitsubishi
(3, 'Xpander', 'xpander', 'mpv', true),
(3, 'Pajero Sport', 'pajero-sport', 'suv', true),
(3, 'Triton', 'triton', 'pickup', true),
(3, 'Outlander', 'outlander', 'suv', true),
(3, 'Eclipse Cross', 'eclipse-cross', 'suv', true),
(3, 'Mirage', 'mirage', 'hatchback', true),
-- Suzuki
(4, 'Ertiga', 'ertiga', 'mpv', true),
(4, 'XL7', 'xl7', 'mpv', true),
(4, 'Jimny', 'jimny', 'suv', true),
(4, 'Vitara', 'vitara', 'suv', true),
(4, 'Swift', 'swift', 'hatchback', true),
(4, 'Baleno', 'baleno', 'hatchback', true),
(4, 'Carry', 'carry', 'pickup', true),
-- Daihatsu
(5, 'Xenia', 'xenia', 'mpv', true),
(5, 'Terios', 'terios', 'suv', true),
(5, 'Rocky', 'rocky', 'suv', true),
(5, 'Ayla', 'ayla', 'hatchback', true),
(5, 'Sigra', 'sigra', 'mpv', true),
(5, 'Gran Max', 'gran-max', 'van', true),
-- Nissan
(6, 'X-Trail', 'x-trail', 'suv', true),
(6, 'Qashqai', 'qashqai', 'suv', true),
(6, 'Navara', 'navara', 'pickup', true),
(6, ' Serena', 'serena', 'mpv', true),
(6, 'March', 'march', 'hatchback', true),
(6, 'Livina', 'livina', 'mpv', true),
-- Hyundai
(8, 'Starex', 'starex', 'van', true),
(8, 'Tucson', 'tucson', 'suv', true),
(8, 'Santa Fe', 'santa-fe', 'suv', true),
(8, 'Creta', 'creta', 'suv', true),
(8, 'Ioniq', 'ioniq', 'hatchback', true),
(8, 'Palisade', 'palisade', 'suv', true),
-- Wuling
(13, 'Almaz', 'almaz', 'suv', true),
(13, 'Cortez', 'cortez', 'mpv', true),
(13, 'Formo', 'formo', 'van', true),
(13, 'Confero', 'confero', 'mpv', true),
-- BMW
(10, '320i', '320i', 'sedan', true),
(10, '530i', '530i', 'sedan', true),
(10, 'X3', 'x3', 'suv', true),
(10, 'X5', 'x5', 'suv', true),
(10, '730Li', '730li', 'sedan', true),
-- Mercedes
(11, 'C200', 'c200', 'sedan', true),
(11, 'E300', 'e300', 'sedan', true),
(11, 'GLC 300', 'glc-300', 'suv', true),
(11, 'S450', 's450', 'sedan', true),
-- Audi
(12, 'A4', 'a4', 'sedan', true),
(12, 'A6', 'a6', 'sedan', true),
(12, 'Q5', 'q5', 'suv', true),
(12, 'Q7', 'q7', 'suv', true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- 3. CAR VARIANTS (Varian)
-- ===========================================
INSERT INTO car_variants (model_id, name, year_start, year_end, transmission_type, fuel_type, engine_cc, is_active) VALUES
-- Toyota Avanza
(1, '1.3 E M/T', 2019, 2023, 'manual', 'bensin', 1298, true),
(1, '1.5 G M/T', 2019, 2023, 'manual', 'bensin', 1496, true),
(1, '1.5 G CVT', 2019, 2023, 'automatic', 'bensin', 1496, true),
(1, '1.5 S CVT', 2019, 2023, 'automatic', 'bensin', 1496, true),
-- Toyota Innova
(2, '2.0 V M/T', 2016, 2023, 'manual', 'bensin', 1998, true),
(2, '2.0 V A/T', 2016, 2023, 'automatic', 'bensin', 1998, true),
(2, '2.0 Q A/T', 2016, 2023, 'automatic', 'bensin', 1998, true),
(2, '2.0 Venturer A/T', 2017, 2023, 'automatic', 'bensin', 1998, true),
-- Toyota Fortuner
(3, '2.4 VRZ 4x2 M/T', 2017, 2023, 'manual', 'diesel', 2393, true),
(3, '2.4 VRZ 4x2 A/T', 2017, 2023, 'automatic', 'diesel', 2393, true),
(3, '2.7 SRZ 4x2 A/T', 2017, 2023, 'automatic', 'bensin', 2694, true),
(3, '2.8 VRZ 4x4 A/T', 2017, 2023, 'automatic', 'diesel', 2755, true),
-- Honda Jazz
(16, '1.5 RS M/T', 2020, 2023, 'manual', 'bensin', 1498, true),
(16, '1.5 RS CVT', 2020, 2023, 'automatic', 'bensin', 1498, true),
(16, '1.5 SE CVT', 2020, 2023, 'automatic', 'bensin', 1498, true),
-- Honda Civic
(18, '1.5 Turbo S', 2020, 2023, 'automatic', 'bensin', 1498, true),
(18, '1.5 Turbo E', 2020, 2023, 'automatic', 'bensin', 1498, true),
(18, '2.0 E', 2020, 2023, 'automatic', 'bensin', 1996, true),
-- Honda CR-V
(20, '1.5 Turbo S', 2020, 2023, 'automatic', 'bensin', 1498, true),
(20, '1.5 Turbo E', 2020, 2023, 'automatic', 'bensin', 1498, true),
(20, '1.5 Turbo Prestige', 2020, 2023, 'automatic', 'bensin', 1498, true),
-- Honda HR-V
(21, '1.5 S CVT', 2022, 2023, 'automatic', 'bensin', 1498, true),
(21, '1.5 E CVT', 2022, 2023, 'automatic', 'bensin', 1498, true),
(21, '1.5 SE CVT', 2022, 2023, 'automatic', 'bensin', 1498, true),
(21, '1.5 RS CVT', 2022, 2023, 'automatic', 'bensin', 1498, true),
-- Mitsubishi Xpander
(26, 'GLS M/T', 2017, 2023, 'manual', 'bensin', 1499, true),
(26, 'GLS A/T', 2017, 2023, 'automatic', 'bensin', 1499, true),
(26, 'Exceed A/T', 2017, 2023, 'automatic', 'bensin', 1499, true),
(26, 'Ultimate A/T', 2019, 2023, 'automatic', 'bensin', 1499, true),
(26, 'Cross 4WD', 2020, 2023, 'automatic', 'bensin', 1499, true),
-- Mitsubishi Pajero Sport
(27, 'GLX 4x2 M/T', 2016, 2023, 'manual', 'diesel', 2442, true),
(27, 'GLX 4x2 A/T', 2016, 2023, 'automatic', 'diesel', 2442, true),
(27, 'Exceed 4x2 A/T', 2016, 2023, 'automatic', 'diesel', 2442, true),
(27, 'Dakar 4x4 A/T', 2016, 2023, 'automatic', 'diesel', 2442, true),
-- Suzuki Ertiga
(32, 'GL M/T', 2018, 2023, 'manual', 'bensin', 1462, true),
(32, 'GX A/T', 2018, 2023, 'automatic', 'bensin', 1462, true),
(32, 'SX Idle Stop A/T', 2018, 2023, 'automatic', 'bensin', 1462, true),
-- Suzuki Jimny
(34, 'JLX M/T', 2018, 2023, 'manual', 'bensin', 1462, true),
(34, 'JLX A/T', 2018, 2023, 'automatic', 'bensin', 1462, true),
-- Daihatsu Xenia
(39, '1.0 M M/T', 2019, 2023, 'manual', 'bensin', 998, true),
(39, '1.3 X M/T', 2019, 2023, 'manual', 'bensin', 1329, true),
(39, '1.3 X CVT', 2019, 2023, 'automatic', 'bensin', 1329, true),
-- Daihatsu Terios
(40, '1.5 R M/T', 2018, 2023, 'manual', 'bensin', 1496, true),
(40, '1.5 R A/T', 2018, 2023, 'automatic', 'bensin', 1496, true),
-- Nissan X-Trail
(44, '2.5 CVT 2WD', 2014, 2023, 'automatic', 'bensin', 2488, true),
(44, '2.5 CVT 4WD', 2014, 2023, 'automatic', 'bensin', 2488, true),
-- Wuling Almaz
(57, '1.5 Turbo EX', 2019, 2023, 'automatic', 'bensin', 1451, true),
(57, '1.5 Turbo RS', 2020, 2023, 'automatic', 'bensin', 1451, true),
-- BMW 320i
(61, 'Sport Line', 2019, 2023, 'automatic', 'bensin', 1998, true),
(61, 'M Sport', 2019, 2023, 'automatic', 'bensin', 1998, true),
-- BMW X5
(64, 'xDrive40i', 2019, 2023, 'automatic', 'bensin', 2998, true),
-- Mercedes C200
(66, 'AMG Line', 2019, 2023, 'automatic', 'bensin', 1496, true),
-- Mercedes GLC 300
(68, '4MATIC AMG Line', 2019, 2023, 'automatic', 'bensin', 1991, true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- 4. PROVINCES & CITIES
-- ===========================================
INSERT INTO provinces (name, slug) VALUES
('DKI Jakarta', 'dki-jakarta'),
('Jawa Barat', 'jawa-barat'),
('Jawa Tengah', 'jawa-tengah'),
('Jawa Timur', 'jawa-timur'),
('Banten', 'banten'),
('DI Yogyakarta', 'di-yogyakarta'),
('Bali', 'bali'),
('Sumatera Utara', 'sumatera-utara'),
('Sulawesi Selatan', 'sulawesi-selatan'),
('Kalimantan Timur', 'kalimantan-timur')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (province_id, name, slug) VALUES
(1, 'Jakarta Selatan', 'jakarta-selatan'),
(1, 'Jakarta Pusat', 'jakarta-pusat'),
(1, 'Jakarta Barat', 'jakarta-barat'),
(1, 'Jakarta Timur', 'jakarta-timur'),
(1, 'Jakarta Utara', 'jakarta-utara'),
(2, 'Bandung', 'bandung'),
(2, 'Bekasi', 'bekasi'),
(2, 'Depok', 'depok'),
(2, 'Bogor', 'bogor'),
(2, 'Cirebon', 'cirebon'),
(3, 'Semarang', 'semarang'),
(3, 'Solo', 'solo'),
(4, 'Surabaya', 'surabaya'),
(4, 'Malang', 'malang'),
(4, 'Sidoarjo', 'sidoarjo'),
(5, 'Tangerang', 'tangerang'),
(5, 'Bekasi', 'bekasi-2'),
(6, 'Yogyakarta', 'yogyakarta'),
(7, 'Denpasar', 'denpasar'),
(8, 'Medan', 'medan')
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- 5. SAMPLE CAR LISTINGS
-- ===========================================
-- Generate UUIDs for listings
DO $$
DECLARE
  listing_id UUID;
  i INTEGER;
  brand_rec RECORD;
  model_rec RECORD;
  variant_rec RECORD;
  city_rec RECORD;
  random_price INTEGER;
  random_year INTEGER;
  random_mileage INTEGER;
  transaction_types TEXT[] := ARRAY['jual', 'jual', 'jual', 'credit', 'rental'];
  conditions TEXT[] := ARRAY['bekas', 'bekas', 'bekas', 'baru'];
  fuels TEXT[] := ARRAY['bensin', 'bensin', 'diesel', 'hybrid', 'listrik'];
  transmissions TEXT[] := ARRAY['automatic', 'automatic', 'manual'];
  body_types TEXT[] := ARRAY['sedan', 'suv', 'mpv', 'hatchback', 'pickup'];
  colors TEXT[] := ARRAY['Putih', 'Hitam', 'Silver', 'Abu-abu', 'Merah', 'Biru', 'Bronze'];
  counter INTEGER := 0;
BEGIN
  -- Create 50 sample listings
  FOR i IN 1..50 LOOP
    -- Get random brand
    SELECT * FROM brands ORDER BY RANDOM() LIMIT 1 INTO brand_rec;
    
    -- Get random model for this brand
    SELECT * FROM car_models WHERE brand_id = brand_rec.id ORDER BY RANDOM() LIMIT 1 INTO model_rec;
    
    -- Get random variant for this model
    SELECT * FROM car_variants WHERE model_id = model_rec.id ORDER BY RANDOM() LIMIT 1 INTO variant_rec;
    
    -- Get random city
    SELECT * FROM cities ORDER BY RANDOM() LIMIT 1 INTO city_rec;
    
    -- Generate random values
    random_year := 2018 + (RANDOM() * 6)::INTEGER;
    random_price := 100000000 + (RANDOM() * 400000000)::INTEGER;
    random_mileage := 10000 + (RANDOM() * 90000)::INTEGER;
    
    counter := counter + 1;
    
    -- Insert listing
    INSERT INTO car_listings (
      listing_number,
      brand_id,
      model_id,
      variant_id,
      year,
      mileage,
      fuel,
      transmission,
      body_type,
      transaction_type,
      condition,
      price_cash,
      price_negotiable,
      city_id,
      province_id,
      city,
      province,
      title,
      description,
      slug,
      status,
      created_at,
      expired_at
    ) VALUES (
      'CL-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0'),
      brand_rec.id,
      model_rec.id,
      variant_rec.id,
      random_year,
      random_mileage,
      fuels[1 + (RANDOM() * 4)::INTEGER],
      transmissions[1 + (RANDOM() * 2)::INTEGER],
      body_types[1 + (RANDOM() * 4)::INTEGER],
      transaction_types[1 + (RANDOM() * 4)::INTEGER],
      conditions[1 + (RANDOM() * 3)::INTEGER],
      random_price,
      true,
      city_rec.id,
      city_rec.province_id,
      city_rec.name,
      (SELECT name FROM provinces WHERE id = city_rec.province_id),
      brand_rec.name || ' ' || model_rec.name || ' ' || random_year || ' ' || variant_rec.name,
      'Mobil ' || brand_rec.name || ' ' || model_rec.name || ' tahun ' || random_year || ' kondisi sangat terawat. Servis rutin di bengkel resmi. Surat-surat lengkap. SIAP BBN. Tidak ada accident. Interior bersih dan wangi.',
      LOWER(REPLACE(brand_rec.name || '-' || model_rec.name || '-' || random_year || '-cl-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0'), ' ', '-')),
      'active',
      NOW() - (RANDOM() * INTERVAL '30 days'),
      NOW() + INTERVAL '90 days'
    ) RETURNING id INTO listing_id;
    
    -- Insert primary image for each listing
    INSERT INTO car_images (car_listing_id, image_url, caption, is_primary, display_order)
    VALUES (
      listing_id,
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
      brand_rec.name || ' ' || model_rec.name,
      true,
      0
    );
    
    -- Insert additional images
    INSERT INTO car_images (car_listing_id, image_url, caption, is_primary, display_order)
    VALUES 
    (listing_id, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', 'Interior', false, 1),
    (listing_id, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', 'Eksterior', false, 2),
    (listing_id, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80', 'Tampak Samping', false, 3);
    
    -- Insert features
    INSERT INTO car_features (car_listing_id, feature_name, feature_category, is_available)
    VALUES
    (listing_id, 'Airbag', 'Safety', true),
    (listing_id, 'ABS', 'Safety', true),
    (listing_id, 'AC', 'Comfort', true),
    (listing_id, 'Power Steering', 'Comfort', true),
    (listing_id, 'Power Window', 'Comfort', true),
    (listing_id, 'Central Lock', 'Safety', true),
    (listing_id, 'Alarm', 'Safety', true);
    
  END LOOP;
  
  RAISE NOTICE 'Inserted % sample car listings', counter;
END $$;

-- ===========================================
-- 6. UPDATE COUNTERS
-- ===========================================
-- Update brand listing counts
UPDATE brands b SET listing_count = (
  SELECT COUNT(*) FROM car_listings cl WHERE cl.brand_id = b.id
);

-- Update model listing counts
UPDATE car_models m SET listing_count = (
  SELECT COUNT(*) FROM car_listings cl WHERE cl.model_id = m.id
);

SELECT 'Seed data completed successfully!' as status;
