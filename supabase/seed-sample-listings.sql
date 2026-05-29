-- ==============================================================
-- SAMPLE LISTINGS DATA
-- Run after schema-quick.sql and seed-data.sql
-- ==============================================================

-- Create sample user profiles (these will be created automatically when users sign up via Supabase Auth)
-- We'll create some sample profiles for demo purposes
INSERT INTO profiles (id, name, phone, role, email_verified, phone_verified) VALUES
('user-demo-1', 'Demo User', '081234567890', 'user', true, true),
('user-demo-2', 'Ahmad Rizki', '082345678901', 'user', true, true),
('user-demo-3', 'Budi Santoso', '083456789012', 'dealer', true, true);

-- Create sample dealer
INSERT INTO dealers (id, owner_id, name, slug, description, phone, email, city, rating, review_count, total_listings, verified) VALUES
('dealer-1', 'user-demo-3', 'Auto Prima Motor', 'auto-prima-motor', 'Dealer mobil terpercaya di Jakarta dengan koleksi mobil berkualitas', '02112345678', 'info@autoprimamotor.com', 'Jakarta Selatan', 4.8, 156, 45, true);

-- Create sample car listings
INSERT INTO car_listings (id, listing_number, user_id, dealer_id, brand_id, model_id, variant_id, year, exterior_color_id, interior_color_id, fuel, transmission, body_type, engine_capacity, seat_count, mileage, transaction_type, condition, price_cash, price_credit, city, province, status, title, description, slug, view_count, favorite_count, published_at) VALUES
-- Toyota Alphard 2021
('listing-1', 'CL-001ALP', 'user-demo-3', 'dealer-1', 'brand-toyota', 'model-alphard', 'var-alphard-1', 2021, 'color-putih-metalik', 'color-beige', 'bensin', 'automatic', 'mpv', 2500, 7, 45120, 'jual', 'istimewa', 749000000, 675000000, 'Jakarta Selatan', 'DKI Jakarta', 'active', 'Toyota Alphard 2.5 G 2021 - Kondisi Istimewa', 'Toyota Alphard 2.5 G 2021 dengan kondisi istimewa. Pemilik pertama, service record lengkap di bengkel resmi Toyota. Interior bersih, exterior mulus tanpa penyok. Fitur lengkap: captain seat, sunroof, ambient light, JBL audio system.', 'toyota-alphard-2-5-g-2021-cl-001alp', 1250, 45, now()),

-- Toyota Fortuner 2022
('listing-2', 'CL-002FRT', 'user-demo-3', 'dealer-1', 'brand-toyota', 'model-fortuner', 'var-fortuner-3', 2022, 'color-hitam-metalik', 'color-hitam', 'diesel', 'automatic', 'suv', 2400, 7, 28500, 'jual', 'istimewa', 685000000, 620000000, 'Jakarta Utara', 'DKI Jakarta', 'active', 'Toyota Fortuner 2.4 VRZ AT 2022 - Low KM', 'Fortuner VRZ 2022 dengan KM rendah. Full original, tidak pernah kecelakaan. Dilengkapi dengan sensor depan belakang, camera 360, wireless charging.', 'toyota-fortuner-2-4-vrz-2022-cl-002frt', 890, 32, now()),

-- Honda HR-V 2021
('listing-3', 'CL-003HRV', 'user-demo-1', null, 'brand-honda', 'model-hrv', 'var-hrv-3', 2021, 'color-merah-metalik', 'color-hitam', 'bensin', 'automatic', 'suv', 1500, 5, 42500, 'jual', 'sedang', 395000000, 358000000, 'Tangerang', 'Banten', 'active', 'Honda HR-V RS 2021 - Kondisi Standar', 'Honda HR-V RS 2021 dengan kondisi sedang. Ada beberapa bekas gesekan minor di bumper. Mesin prima, AC dingin. Service record di Honda.', 'honda-hr-v-rs-2021-cl-003hrv', 456, 18, now()),

-- Mitsubishi Xpander 2021
('listing-4', 'CL-004XPX', 'user-demo-2', null, 'brand-mitsubishi', 'model-xpander', 'var-xpander-3', 2021, 'color-putih', 'color-hitam', 'bensin', 'automatic', 'mpv', 1500, 7, 58200, 'jual', 'bekas', 278000000, 252000000, 'Bekasi', 'Jawa Barat', 'active', 'Mitsubishi Xpander Exceed 2021 - Siap Pakai', 'Xpander Exceed 2021. KM 58rb, pemilik pribadi. Fitur: keyless, push start, rear camera, touchscreen. Kondisi standar, siap pakai.', 'mitsubishi-xpander-exceed-2021-cl-004xpx', 324, 12, now()),

-- Toyota Innova 2020
('listing-5', 'CL-005INV', 'user-demo-3', 'dealer-1', 'brand-toyota', 'model-innova', 'var-innova-4', 2020, 'color-silver', 'color-abu-abu', 'bensin', 'automatic', 'mpv', 2000, 7, 78000, 'jual', 'bekas', 285000000, 258000000, 'Depok', 'Jawa Barat', 'active', 'Toyota Innova G AT 2020 - Terawat', 'Innova G 2020 kondisi baik, terawat. Service berkala di bengkel resmi Toyota. Kapasitas 7 penumpang, cocok untuk keluarga.', 'toyota-innova-g-2020-cl-005inv', 567, 23, now()),

-- BMW 320i 2020
('listing-6', 'CL-006BMW', 'user-demo-3', 'dealer-1', 'brand-bmw', 'model-320i', 'var-320i-1', 2020, 'color-biru-metalik', 'color-hitam', 'bensin', 'automatic', 'sedan', 2000, 5, 35800, 'jual', 'istimewa', 575000000, 520000000, 'Jakarta Pusat', 'DKI Jakarta', 'active', 'BMW 320i Sport Line 2020 - Pristine Condition', 'BMW 320i 2020 Sport Line. Full option, M Sport package. KM rendah, condition pristine. Head up display, Harman Kardon audio, panoramic roof.', 'bmw-320i-sport-2020-cl-006bmw', 432, 28, now()),

-- Mazda CX-5 2021
('listing-7', 'CL-007CX5', 'user-demo-2', null, 'brand-mazda', 'model-cx5', 'var-cx5-3', 2021, 'color-merah-metalik', 'color-hitam', 'bensin', 'automatic', 'suv', 2500, 5, 46500, 'jual', 'sedang', 458000000, 415000000, 'Bandung', 'Jawa Barat', 'active', 'Mazda CX-5 2.5 KSK 2021 - Soul Red Crystal', 'Mazda CX-5 2.5 KSK 2021 dalam warna Soul Red Crystal. Fitur: i-Activsense, HUD, Bose audio. Ada minor scratch di sisi kanan.', 'mazda-cx-5-2-5-ksk-2021-cl-007cx5', 389, 15, now()),

-- Toyota Avanza 2022
('listing-8', 'CL-008AVZ', 'user-demo-1', null, 'brand-toyota', 'model-avanza', 'var-avanza-4', 2022, 'color-abu-metalik', 'color-hitam', 'bensin', 'automatic', 'mpv', 1500, 7, 25600, 'jual', 'istimewa', 268000000, 242000000, 'Bogor', 'Jawa Barat', 'active', 'Toyota Avanza G CVT 2022 - KM Rendah', 'Avanza G CVT 2022 dengan KM sangat rendah. Pemilik pertama, condition istimewa. Fitur: 7 airbag, VSC, HSA.', 'toyota-avanza-g-cvt-2022-cl-008avz', 567, 29, now()),

-- Honda CR-V 2021
('listing-9', 'CL-009CRV', 'user-demo-3', 'dealer-1', 'brand-honda', 'model-crv', 'var-crv-1', 2021, 'color-putih-metalik', 'color-hitam', 'bensin', 'automatic', 'suv', 1500, 7, 52300, 'jual', 'bekas', 425000000, 385000000, 'Jakarta Barat', 'DKI Jakarta', 'active', 'Honda CR-V Turbo 2021 - 7 Seater', 'CR-V Turbo 2021 variant 7 seater. Full original paint. Honda Sensing, wireless charger, walk away auto lock.', 'honda-cr-v-turbo-2021-cl-009crv', 678, 34, now()),

-- Daihatsu Xenia 2021
('listing-10', 'CL-010XEN', 'user-demo-1', null, 'brand-daihatsu', 'model-xenia', 'var-xenia-3', 2021, 'color-silver', 'color-hitam', 'bensin', 'automatic', 'mpv', 1500, 7, 55400, 'jual', 'bekas', 185000000, 168000000, 'Serang', 'Banten', 'active', 'Daihatsu Xenia R CVT 2021 - Standar', 'Xenia R CVT 2021 dengan kondisi standar. KM 55rb. Fitur: rear camera, dual airbag, ABS. Cocok untuk keluarga.', 'daihatsu-xenia-r-cvt-2021-cl-010xen', 234, 8, now()),

-- Mercedes GLC 2021
('listing-11', 'CL-011GLC', 'user-demo-3', 'dealer-1', 'brand-mercedes', 'model-glc', 'var-glc-1', 2021, 'color-hitam-metalik', 'color-hitam', 'bensin', 'automatic', 'suv', 2000, 5, 28900, 'jual', 'istimewa', 895000000, 810000000, 'Jakarta Selatan', 'DKI Jakarta', 'active', 'Mercedes-Benz GLC 200 2021 - AMG Line', 'GLC 200 2021 AMG Line. Full option dengan Burmester sound system, ambient lighting, 360 camera, keyless-go. Condition istimewa.', 'mercedes-glc-200-2021-cl-011glc', 345, 21, now()),

-- Toyota Raize 2023
('listing-12', 'CL-012RAZ', 'user-demo-2', null, 'brand-toyota', 'model-raize', null, 2023, 'color-putih', 'color-hitam', 'bensin', 'automatic', 'suv', 1000, 5, 12500, 'jual', 'baru', 235000000, 212000000, 'Jakarta Timur', 'DKI Jakarta', 'active', 'Toyota Raize 1.0 T CVT 2023 - Baru', 'Raize T CVT 2023 dengan KM sangat rendah. Kondisi seperti baru. Turbo engine, modern design, cocok untuk city car.', 'toyota-raize-t-2023-cl-012raz', 789, 42, now());

-- Add images for listings
INSERT INTO car_images (id, car_listing_id, image_url, thumbnail_url, caption, is_primary, display_order) VALUES
-- Alphard images
('img-1-1', 'listing-1', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400', 'Exterior', true, 0),
('img-1-2', 'listing-1', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400', 'Interior', false, 1),

-- Fortuner images
('img-2-1', 'listing-2', 'https://images.unsplash.com/photo-1625231334168-34ae03be15de?w=1200', 'https://images.unsplash.com/photo-1625231334168-34ae03be15de?w=400', 'Exterior', true, 0),
('img-2-2', 'listing-2', 'https://images.unsplash.com/photo-1594912307912-9e0b2c6e3b1e?w=1200', 'https://images.unsplash.com/photo-1594912307912-9e0b2c6e3b1e?w=400', 'Interior', false, 1),

-- HR-V images
('img-3-1', 'listing-3', 'https://images.unsplash.com/photo-1568844293986-8c1a5e37dbbb?w=1200', 'https://images.unsplash.com/photo-1568844293986-8c1a5e37dbbb?w=400', 'Exterior', true, 0),

-- Xpander images
('img-4-1', 'listing-4', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', 'Exterior', true, 0),

-- Innova images
('img-5-1', 'listing-5', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400', 'Exterior', true, 0),

-- BMW images
('img-6-1', 'listing-6', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400', 'Exterior', true, 0),

-- CX-5 images
('img-7-1', 'listing-7', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400', 'Exterior', true, 0),

-- Avanza images
('img-8-1', 'listing-8', 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=1200', 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400', 'Exterior', true, 0),

-- CR-V images
('img-9-1', 'listing-9', 'https://images.unsplash.com/photo-1568844293986-8c1a5e37dbbb?w=1200', 'https://images.unsplash.com/photo-1568844293986-8c1a5e37dbbb?w=400', 'Exterior', true, 0),

-- Xenia images
('img-10-1', 'listing-10', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', 'Exterior', true, 0),

-- GLC images
('img-11-1', 'listing-11', 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=1200', 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400', 'Exterior', true, 0),

-- Raize images
('img-12-1', 'listing-12', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', 'Exterior', true, 0);

-- Add features for listings
INSERT INTO car_features (car_listing_id, sunroof, cruise_control, rear_camera, keyless_start, push_start, service_book, airbag, abs, esp, hill_start, apple_carplay, android_auto, bluetooth, navigation) VALUES
('listing-1', true, true, true, true, true, true, true, true, true, true, true, true, true, true),
('listing-2', false, true, true, true, true, true, true, true, true, true, true, true, true, false),
('listing-3', false, true, true, true, true, true, true, true, true, true, true, true, true, false),
('listing-4', false, false, true, true, true, true, true, true, false, false, false, false, true, false),
('listing-5', false, false, true, false, false, true, true, true, false, false, false, false, true, false),
('listing-6', true, true, true, true, true, true, true, true, true, true, true, true, true, true),
('listing-7', true, true, true, true, true, true, true, true, true, true, true, true, true, true),
('listing-8', false, false, true, true, true, true, true, true, true, true, true, true, true, false),
('listing-9', true, true, true, true, true, true, true, true, true, true, true, true, true, true),
('listing-10', false, false, true, false, false, true, true, true, false, false, false, false, true, false),
('listing-11', true, true, true, true, true, true, true, true, true, true, true, true, true, true),
('listing-12', false, false, true, true, true, false, true, true, true, true, true, true, true, false);

-- Add documents for listings
INSERT INTO car_documents (car_listing_id, license_plate, stnk_status, bpkb_status, ownership_type, previous_owners) VALUES
('listing-1', 'B 1234 KJV', 'valid', 'ada', 'pribadi', 1),
('listing-2', 'B 5678 XYZ', 'valid', 'ada', 'pribadi', 1),
('listing-3', 'B 9012 ABC', 'valid', 'ada', 'pribadi', 1),
('listing-4', 'B 3456 DEF', 'valid', 'ada', 'pribadi', 1),
('listing-5', 'B 7890 GHI', 'valid', 'ada', 'pribadi', 2),
('listing-6', 'B 1122 JKL', 'valid', 'ada', 'pribadi', 1),
('listing-7', 'D 3344 MNO', 'valid', 'ada', 'pribadi', 1),
('listing-8', 'B 5566 PQR', 'valid', 'ada', 'pribadi', 1),
('listing-9', 'B 7788 STU', 'valid', 'ada', 'pribadi', 1),
('listing-10', 'B 9900 VWX', 'valid', 'ada', 'pribadi', 1),
('listing-11', 'B 1357 YZA', 'valid', 'ada', 'pribadi', 1),
('listing-12', 'B 2468 BCD', 'valid', 'ada', 'pribadi', 1);

-- Add sample inspections
INSERT INTO car_inspections (id, car_listing_id, inspector_name, inspection_place, inspection_date, total_points, passed_points, failed_points, inspection_score, accident_free, flood_free, fire_free, risk_level, overall_grade, recommended, certificate_number, status) VALUES
('insp-1', 'listing-1', 'Inspektor A', 'Auto Prima Motor Jakarta', now() - interval '7 days', 160, 155, 5, 96.88, true, true, true, 'low', 'A', true, 'CERT-2024-001', 'completed'),
('insp-2', 'listing-2', 'Inspektor B', 'Auto Prima Motor Jakarta', now() - interval '5 days', 160, 152, 8, 95.00, true, true, true, 'low', 'A', true, 'CERT-2024-002', 'completed'),
('insp-3', 'listing-3', 'Inspektor A', 'Jakarta Auto Check', now() - interval '3 days', 160, 140, 20, 87.50, true, true, true, 'medium', 'B', true, null, 'completed'),
('insp-4', 'listing-4', 'Inspektor C', 'Bekasi Car Inspect', now() - interval '10 days', 160, 138, 22, 86.25, true, true, true, 'medium', 'B', true, null, 'completed'),
('insp-5', 'listing-5', 'Inspektor B', 'Auto Prima Motor Jakarta', now() - interval '4 days', 160, 142, 18, 88.75, true, true, true, 'medium', 'B+', true, 'CERT-2024-003', 'completed'),
('insp-6', 'listing-6', 'Inspektor A', 'Premium Auto Inspect', now() - interval '2 days', 160, 156, 4, 97.50, true, true, true, 'low', 'A+', true, 'CERT-2024-004', 'completed'),
('insp-7', 'listing-7', 'Inspektor C', 'Bandung Car Check', now() - interval '6 days', 160, 145, 15, 90.63, true, true, true, 'low', 'A', true, null, 'completed'),
('insp-8', 'listing-8', 'Inspektor A', 'Auto Prima Motor Jakarta', now() - interval '1 day', 160, 154, 6, 96.25, true, true, true, 'low', 'A', true, 'CERT-2024-005', 'completed'),
('insp-9', 'listing-9', 'Inspektor B', 'Auto Prima Motor Jakarta', now() - interval '8 days', 160, 148, 12, 92.50, true, true, true, 'low', 'A', true, 'CERT-2024-006', 'completed'),
('insp-10', 'listing-10', 'Inspektor C', 'Serang Auto Check', now() - interval '9 days', 160, 135, 25, 84.38, true, true, true, 'medium', 'B', true, null, 'completed'),
('insp-11', 'listing-11', 'Inspektor A', 'Premium Auto Inspect', now() - interval '3 days', 160, 158, 2, 98.75, true, true, true, 'low', 'A+', true, 'CERT-2024-007', 'completed'),
('insp-12', 'listing-12', 'Inspektor B', 'Auto Prima Motor Jakarta', now() - interval '5 days', 160, 157, 3, 98.13, true, true, true, 'low', 'A+', true, 'CERT-2024-008', 'completed');

-- Add sample inspection results for a few critical items
-- This creates partial inspection results for demonstration
INSERT INTO inspection_results (inspection_id, item_id, status, notes)
SELECT 
    'insp-1',
    id,
    CASE 
        WHEN id IN (1, 4, 5, 10, 11, 26, 27, 28, 29, 30, 31, 36, 37, 38, 76, 77, 78, 86, 87, 91, 92, 97, 101, 102, 103, 104, 105, 146, 150) THEN 'baik'
        WHEN id IN (2, 3, 8, 9, 12, 13, 14, 15, 32, 33, 34, 35, 44, 45, 79, 80, 81, 82, 83, 84, 85, 93, 94, 95, 96, 98, 99, 100) THEN 'baik'
        ELSE 'sedang'
    END,
    CASE 
        WHEN id = 1 THEN 'Mesin menyala dengan mudah'
        WHEN id = 4 THEN 'Level oli normal'
        WHEN id = 5 THEN 'Tidak ada kebocoran'
        WHEN id = 26 THEN 'Kampas rem masih 70%'
        WHEN id = 27 THEN 'Kampas rem belakang masih 75%'
        WHEN id = 76 THEN 'Lampu depan LED berfungsi baik'
        WHEN id = 86 THEN 'Semua airbag aktif'
        WHEN id = 91 THEN 'Ban masih 80%'
        WHEN id = 97 THEN 'Chassis dalam kondisi baik'
        WHEN id = 146 THEN 'Mesin menyala dengan mudah saat starter'
        WHEN id = 150 THEN 'Pengereman optimal'
        ELSE null
    END
FROM inspection_items
WHERE id <= 160;
