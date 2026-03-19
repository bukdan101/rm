-- ==============================================================
-- SEED INSPECTION CATEGORIES & 160 ITEMS
-- ==============================================================

-- Seed Inspection Categories
INSERT INTO inspection_categories (id, name, description, icon, display_order) VALUES
('cat-engine', 'Engine', 'Sistem mesin kendaraan', 'engine', 1),
('cat-transmission', 'Transmission', 'Sistem transmisi dan persneling', 'settings', 2),
('cat-brake', 'Brake', 'Sistem pengereman', 'disc', 3),
('cat-suspension', 'Suspension', 'Sistem suspensi dan peredam kejut', 'activity', 4),
('cat-steering', 'Steering', 'Sistem kemudi', 'navigation', 5),
('cat-exterior', 'Exterior', 'Kondisi eksterior kendaraan', 'car', 6),
('cat-interior', 'Interior', 'Kondisi interior kabin', 'grid', 7),
('cat-electrical', 'Electrical', 'Sistem kelistrikan', 'zap', 8),
('cat-safety', 'Safety', 'Fitur keselamatan', 'shield', 9),
('cat-wheels', 'Wheels & Tires', 'Kondisi ban dan velg', 'circle', 10),
('cat-underbody', 'Underbody', 'Kondisi bawah kendaraan', 'layers', 11),
('cat-body', 'Body Structure', 'Struktur bodi kendaraan', 'box', 12),
('cat-features', 'Features', 'Fitur tambahan', 'star', 13),
('cat-test', 'Road Test', 'Pengujian jalan', 'play', 14);

-- Update inspection categories with total items count
UPDATE inspection_categories SET total_items = 15 WHERE id = 'cat-engine';
UPDATE inspection_categories SET total_items = 10 WHERE id = 'cat-transmission';
UPDATE inspection_categories SET total_items = 10 WHERE id = 'cat-brake';
UPDATE inspection_categories SET total_items = 10 WHERE id = 'cat-suspension';
UPDATE inspection_categories SET total_items = 5 WHERE id = 'cat-steering';
UPDATE inspection_categories SET total_items = 15 WHERE id = 'cat-exterior';
UPDATE inspection_categories SET total_items = 10 WHERE id = 'cat-interior';
UPDATE inspection_categories SET total_items = 10 WHERE id = 'cat-electrical';
UPDATE inspection_categories SET total_items = 5 WHERE id = 'cat-safety';
UPDATE inspection_categories SET total_items = 6 WHERE id = 'cat-wheels';
UPDATE inspection_categories SET total_items = 4 WHERE id = 'cat-underbody';
UPDATE inspection_categories SET total_items = 5 WHERE id = 'cat-body';
UPDATE inspection_categories SET total_items = 55 WHERE id = 'cat-features';
UPDATE inspection_categories SET total_items = 10 WHERE id = 'cat-test';

-- Seed 160 Inspection Items
INSERT INTO inspection_items (category_id, name, description, display_order, is_critical) VALUES
-- ENGINE (1-15)
('cat-engine', 'Engine Start', 'Mesin dapat menyala dengan mudah saat distarter', 1, true),
('cat-engine', 'Engine Idle', 'Putaran mesin stabil saat idle', 2, false),
('cat-engine', 'Engine Noise', 'Tidak ada suara berisik abnormal dari mesin', 3, true),
('cat-engine', 'Engine Oil Level', 'Level oli mesin normal', 4, true),
('cat-engine', 'Engine Oil Leak', 'Tidak ada kebocoran oli mesin', 5, true),
('cat-engine', 'Radiator Condition', 'Kondisi radiator baik', 6, true),
('cat-engine', 'Radiator Coolant Level', 'Level coolant radiator normal', 7, true),
('cat-engine', 'Cooling Fan', 'Kipas pendingin berfungsi dengan baik', 8, false),
('cat-engine', 'Drive Belt', 'V-belt/serpentine belt kondisi baik', 9, false),
('cat-engine', 'Battery Condition', 'Aki dalam kondisi baik', 10, true),
('cat-engine', 'Air Filter', 'Filter udara bersih', 11, false),
('cat-engine', 'Fuel Pump', 'Pompa bensin berfungsi normal', 12, true),
('cat-engine', 'Spark Plug', 'Busi dalam kondisi baik', 13, false),
('cat-engine', 'Engine Mounting', 'Engine mounting tidak rusak', 14, false),
('cat-engine', 'Turbo Condition', 'Turbo berfungsi normal (jika ada)', 15, false),

-- TRANSMISSION (16-25)
('cat-transmission', 'Transmission Shift', 'Perpindahan gigi halus', 16, true),
('cat-transmission', 'Transmission Oil', 'Level oli transmisi normal', 17, true),
('cat-transmission', 'Clutch Condition', 'Kopling tidak slip (manual)', 18, true),
('cat-transmission', 'Gearbox Noise', 'Tidak ada suara abnormal pada gearbox', 19, false),
('cat-transmission', 'Drive Shaft', 'Drive shaft kondisi baik', 20, true),
('cat-transmission', 'Differential', 'Differential berfungsi normal', 21, false),
('cat-transmission', 'CV Joint', 'CV Joint tidak berbunyi', 22, true),
('cat-transmission', 'Transmission Mount', 'Transmission mounting kondisi baik', 23, false),
('cat-transmission', 'Propeller Shaft', 'Propeller shaft kondisi baik (4WD)', 24, false),
('cat-transmission', 'Transmission Leak', 'Tidak ada kebocoran transmisi', 25, true),

-- BRAKE (26-35)
('cat-brake', 'Brake Pad Front', 'Kampas rem depan masih tebal', 26, true),
('cat-brake', 'Brake Pad Rear', 'Kampas rem belakang masih tebal', 27, true),
('cat-brake', 'Brake Disc', 'Disc brake tidak aus', 28, true),
('cat-brake', 'Brake Fluid', 'Level minyak rem normal', 29, true),
('cat-brake', 'Brake Hose', 'Selang rem tidak bocor', 30, true),
('cat-brake', 'Brake Caliper', 'Caliper rem berfungsi normal', 31, true),
('cat-brake', 'ABS System', 'Sistem ABS berfungsi', 32, true),
('cat-brake', 'Hand Brake', 'Rem tangan berfungsi baik', 33, false),
('cat-brake', 'Brake Booster', 'Brake booster berfungsi', 34, false),
('cat-brake', 'Brake Performance', 'Performa pengereman optimal', 35, true),

-- SUSPENSION (36-45)
('cat-suspension', 'Front Shock Absorber', 'Shock absorber depan berfungsi', 36, false),
('cat-suspension', 'Rear Shock Absorber', 'Shock absorber belakang berfungsi', 37, false),
('cat-suspension', 'Spring Condition', 'Per kondisi baik', 38, false),
('cat-suspension', 'Lower Arm', 'Lower arm tidak rusak', 39, true),
('cat-suspension', 'Ball Joint', 'Ball joint tidak longgar', 40, true),
('cat-suspension', 'Stabilizer Link', 'Stabilizer link kondisi baik', 41, false),
('cat-suspension', 'Suspension Bushings', 'Bushings suspensi tidak aus', 42, false),
('cat-suspension', 'Suspension Noise', 'Tidak ada suara abnormal suspensi', 43, false),
('cat-suspension', 'Wheel Bearing', 'Wheel bearing kondisi baik', 44, false),
('cat-suspension', 'Wheel Alignment', 'Wheel alignment sesuai', 45, false),

-- STEERING (46-50)
('cat-steering', 'Steering Wheel', 'Setir tidak bergetar', 46, false),
('cat-steering', 'Steering Rack', 'Steering rack kondisi baik', 47, true),
('cat-steering', 'Power Steering Pump', 'Pompa power steering berfungsi', 48, false),
('cat-steering', 'Steering Fluid', 'Level oli power steering normal', 49, false),
('cat-steering', 'Steering Column', 'Steering column tidak longgar', 50, true),

-- EXTERIOR (51-65)
('cat-exterior', 'Front Bumper', 'Bumper depan kondisi baik', 51, false),
('cat-exterior', 'Rear Bumper', 'Bumper belakang kondisi baik', 52, false),
('cat-exterior', 'Hood', 'Kap mesin tidak penyok', 53, false),
('cat-exterior', 'Front Left Door', 'Pintu depan kiri kondisi baik', 54, false),
('cat-exterior', 'Front Right Door', 'Pintu depan kanan kondisi baik', 55, false),
('cat-exterior', 'Rear Left Door', 'Pintu belakang kiri kondisi baik', 56, false),
('cat-exterior', 'Rear Right Door', 'Pintu belakang kanan kondisi baik', 57, false),
('cat-exterior', 'Roof', 'Atap tidak penyok', 58, false),
('cat-exterior', 'Front Fender Left', 'Fender depan kiri kondisi baik', 59, false),
('cat-exterior', 'Front Fender Right', 'Fender depan kanan kondisi baik', 60, false),
('cat-exterior', 'Rear Quarter Panel Left', 'Panel quarter kiri kondisi baik', 61, false),
('cat-exterior', 'Rear Quarter Panel Right', 'Panel quarter kanan kondisi baik', 62, false),
('cat-exterior', 'Paint Condition', 'Cat tidak pudar', 63, false),
('cat-exterior', 'Rust Check', 'Tidak ada karat berat', 64, true),
('cat-exterior', 'Windshield', 'Kaca depan tidak retak', 65, true),

-- INTERIOR (66-75)
('cat-interior', 'Dashboard', 'Dashboard tidak retak', 66, false),
('cat-interior', 'Steering Condition', 'Kulit setir tidak aus', 67, false),
('cat-interior', 'Seat Condition', 'Jok tidak robek', 68, false),
('cat-interior', 'Seat Belt', 'Sabuk pengaman berfungsi', 69, true),
('cat-interior', 'Interior Trim', 'Trim interior lengkap', 70, false),
('cat-interior', 'Carpet Condition', 'Karpet bersih tidak lembab', 71, false),
('cat-interior', 'Door Trim', 'Trim pintu kondisi baik', 72, false),
('cat-interior', 'AC Cooling', 'AC dingin', 73, true),
('cat-interior', 'AC Blower', 'Blower AC berfungsi', 74, false),
('cat-interior', 'AC Filter', 'Filter AC bersih', 75, false),

-- ELECTRICAL (76-85)
('cat-electrical', 'Headlight', 'Lampu depan menyala', 76, true),
('cat-electrical', 'Tail Light', 'Lampu belakang menyala', 77, true),
('cat-electrical', 'Turn Signal', 'Lampu sein berfungsi', 78, true),
('cat-electrical', 'Fog Lamp', 'Lampu kabut berfungsi (jika ada)', 79, false),
('cat-electrical', 'Hazard Light', 'Lampu hazard berfungsi', 80, true),
('cat-electrical', 'Power Window', 'Power window berfungsi semua', 81, false),
('cat-electrical', 'Central Lock', 'Central lock berfungsi', 82, false),
('cat-electrical', 'Horn', 'Klakson berbunyi', 83, false),
('cat-electrical', 'Wiper Motor', 'Wiper berfungsi', 84, false),
('cat-electrical', 'Rear Defogger', 'Rear defogger berfungsi', 85, false),

-- SAFETY (86-90)
('cat-safety', 'Airbag System', 'Sistem airbag aktif', 86, true),
('cat-safety', 'ABS Warning', 'Tidak ada warning ABS', 87, true),
('cat-safety', 'Seat Belt Lock', 'Pengunci sabuk berfungsi', 88, true),
('cat-safety', 'Parking Sensor', 'Parking sensor berfungsi (jika ada)', 89, false),
('cat-safety', 'Rear Camera', 'Kamera belakang berfungsi (jika ada)', 90, false),

-- WHEELS (91-96)
('cat-wheels', 'Front Tire', 'Ban depan masih bagus', 91, true),
('cat-wheels', 'Rear Tire', 'Ban belakang masih bagus', 92, true),
('cat-wheels', 'Spare Tire', 'Ban cadangan ada', 93, false),
('cat-wheels', 'Wheel Rim', 'Velg tidak bengkok', 94, false),
('cat-wheels', 'Wheel Alignment', 'Spoor/stuur sesuai', 95, false),
('cat-wheels', 'Wheel Balance', 'Balance roda baik', 96, false),

-- UNDERBODY (97-100)
('cat-underbody', 'Chassis Frame', 'Chassis tidak rusak', 97, true),
('cat-underbody', 'Exhaust Pipe', 'Knalpot tidak bocor', 98, false),
('cat-underbody', 'Fuel Tank', 'Tangki bensin tidak bocor', 99, true),
('cat-underbody', 'Underbody Rust', 'Underbody bebas karat berat', 100, true),

-- BODY STRUCTURE (101-105)
('cat-body', 'Front Frame', 'Frame depan tidak penyok', 101, true),
('cat-body', 'Rear Frame', 'Frame belakang baik', 102, true),
('cat-body', 'Side Frame', 'Frame samping tidak rusak', 103, true),
('cat-body', 'Impact Damage', 'Tidak ada bekas tabrakan berat', 104, true),
('cat-body', 'Structural Weld', 'Tidak ada las bekas kecelakaan', 105, true),

-- ADDITIONAL FEATURES (106-150)
('cat-features', 'Key Condition', 'Kunci kondisi baik', 106, false),
('cat-features', 'Remote Key', 'Remote kunci berfungsi (jika ada)', 107, false),
('cat-features', 'Infotainment System', 'Head unit berfungsi', 108, false),
('cat-features', 'Navigation System', 'Navigasi berfungsi (jika ada)', 109, false),
('cat-features', 'USB Port', 'Port USB berfungsi', 110, false),
('cat-features', 'Bluetooth', 'Bluetooth terkoneksi', 111, false),
('cat-features', 'Speaker', 'Semua speaker berfungsi', 112, false),
('cat-features', 'Sunroof', 'Sunroof berfungsi (jika ada)', 113, false),
('cat-features', 'Cruise Control', 'Cruise control berfungsi (jika ada)', 114, false),
('cat-features', 'Driver Assist', 'Driver assist berfungsi (jika ada)', 115, false),
('cat-features', 'Lane Assist', 'Lane assist aktif (jika ada)', 116, false),
('cat-features', 'Adaptive Cruise', 'Adaptive cruise berfungsi (jika ada)', 117, false),
('cat-features', 'Auto Brake', 'Auto brake berfungsi (jika ada)', 118, false),
('cat-features', 'Parking Brake Electric', 'Parking brake elektrik berfungsi', 119, false),
('cat-features', 'Interior Light', 'Lampu kabin berfungsi', 120, false),
('cat-features', 'Door Lock', 'Kunci pintu berfungsi semua', 121, false),
('cat-features', 'Seat Adjuster', 'Pengatur jok berfungsi', 122, false),
('cat-features', 'Seat Heater', 'Heater jok berfungsi (jika ada)', 123, false),
('cat-features', 'Seat Ventilation', 'Ventilasi jok berfungsi (jika ada)', 124, false),
('cat-features', 'Rear Seat Condition', 'Jok belakang kondisi baik', 125, false),
('cat-features', 'Third Row Seat', 'Jok baris ketiga (jika ada)', 126, false),
('cat-features', 'Roof Rack', 'Roof rack kondisi baik (jika ada)', 127, false),
('cat-features', 'Tow Hook', 'Tow hook tersedia', 128, false),
('cat-features', 'Fuel Cap', 'Tutup bensin ada', 129, false),
('cat-features', 'Trunk Lock', 'Kunci bagasi berfungsi', 130, false),
('cat-features', 'Trunk Carpet', 'Karpet bagasi ada', 131, false),
('cat-features', 'Spare Tools', 'Alat-alat cadangan lengkap', 132, false),
('cat-features', 'Jack Tools', 'Dongkrak tersedia', 133, false),
('cat-features', 'Owner Manual', 'Buku manual ada', 134, false),
('cat-features', 'Service Book', 'Buku service ada', 135, false),
('cat-features', 'Emission Test', 'Emisi sesuai standar', 136, false),
('cat-features', 'OBD Scan', 'Tidak ada error code', 137, true),
('cat-features', 'Battery Voltage', 'Tegangan aki normal (12.6V)', 138, false),
('cat-features', 'Engine Compression', 'Kompresi mesin baik', 139, true),
('cat-features', 'Engine Smoke', 'Tidak ada asap berlebih', 140, true),
('cat-features', 'Fuel Consumption', 'Konsumsi BBM normal', 141, false),
('cat-features', 'Acceleration Test', 'Akselerasi responsif', 142, false),
('cat-features', 'Braking Distance', 'Jarak pengereman normal', 143, true),
('cat-features', 'Steering Response', 'Respon setir presisi', 144, false),
('cat-features', 'Suspension Comfort', 'Suspensi nyaman', 145, false),
('cat-features', 'Noise Level', 'Suara mesin halus', 146, false),
('cat-features', 'Vibration Level', 'Getaran minimal', 147, false),
('cat-features', 'Interior Smell', 'Tidak ada bau apek', 148, false),
('cat-features', 'Water Leak', 'Tidak ada kebocoran air', 149, true),
('cat-features', 'Electrical Error', 'Tidak ada error listrik', 150, true),

-- ROAD TEST (151-160)
('cat-test', 'Engine Start Test', 'Mesin menyala dengan mudah', 151, true),
('cat-test', 'Idle Stability', 'Idle stabil saat mesin panas', 152, false),
('cat-test', 'Transmission Shift Test', 'Perpindahan gigi halus saat jalan', 153, true),
('cat-test', 'Acceleration Performance', 'Akselerasi normal tanpa tersendat', 154, false),
('cat-test', 'Brake Performance Test', 'Rem berfungsi optimal saat jalan', 155, true),
('cat-test', 'Steering Feel', 'Setir stabil dan responsif', 156, true),
('cat-test', 'Suspension Test', 'Suspensi bekerja baik saat jalan', 157, false),
('cat-test', 'AC Performance Test', 'AC dingin saat mesin panas', 158, false),
('cat-test', 'Noise Test', 'Tidak ada suara abnormal saat jalan', 159, false),
('cat-test', 'Final Road Test', 'Kendaraan layak jalan', 160, true);

-- ==============================================================
-- SEED FEATURE CATEGORIES & ITEMS
-- ==============================================================

-- Feature Categories
INSERT INTO feature_categories (id, name, icon, display_order) VALUES
('feat-safety', 'Keselamatan', 'shield', 1),
('feat-comfort', 'Kenyamanan', 'heart', 2),
('feat-entertainment', 'Hiburan', 'music', 3),
('feat-exterior', 'Eksterior', 'sun', 4),
('feat-performance', 'Performa', 'zap', 5);

-- Feature Groups
INSERT INTO feature_groups (id, category_id, name, display_order) VALUES
-- Safety Groups
('fg-airbag', 'feat-safety', 'Airbag', 1),
('fg-brake', 'feat-safety', 'Rem', 2),
('fg-assist', 'feat-safety', 'Bantuan Pengemudi', 3),
-- Comfort Groups
('fg-seat', 'feat-comfort', 'Jok', 1),
('fg-climate', 'feat-comfort', 'AC & Iklim', 2),
('fg-storage', 'feat-comfort', 'Penyimpanan', 3),
-- Entertainment Groups
('fg-audio', 'feat-entertainment', 'Audio', 1),
('fg-connectivity', 'feat-entertainment', 'Konektivitas', 2),
('fg-nav', 'feat-entertainment', 'Navigasi', 3),
-- Exterior Groups
('fg-lighting', 'feat-exterior', 'Lampu', 1),
('fg-wheels', 'feat-exterior', 'Roda', 2),
('fg-accessories', 'feat-exterior', 'Aksesoris', 3),
-- Performance Groups  
('fg-engine', 'feat-performance', 'Mesin', 1),
('fg-trans', 'feat-performance', 'Transmisi', 2),
('fg-drive', 'feat-performance', 'Penggerak', 3);

-- Feature Items (Key features)
INSERT INTO feature_items (id, group_id, name, description, display_order) VALUES
-- Airbag Features
('fi-airbag-driver', 'fg-airbag', 'Airbag Pengemudi', 'Airbag untuk pengemudi', 1),
('fi-airbag-passenger', 'fg-airbag', 'Airbag Penumpang', 'Airbag untuk penumpang depan', 2),
('fi-airbag-side', 'fg-airbag', 'Airbag Samping', 'Airbag untuk samping', 3),
('fi-airbag-curtain', 'fg-airbag', 'Airbag Curtain', 'Airbag tirai', 4),
('fi-airbag-knee', 'fg-airbag', 'Airbag Lutut', 'Airbag lutut pengemudi', 5),

-- Brake Features
('fi-abs', 'fg-brake', 'ABS', 'Anti-lock Braking System', 1),
('fi-ebd', 'fg-brake', 'EBD', 'Electronic Brake Distribution', 2),
('fi-ba', 'fg-brake', 'Brake Assist', 'Bantuan pengereman darurat', 3),
('fi-esp', 'fg-brake', 'ESP/VSC', 'Electronic Stability Program', 4),
('fi-hsa', 'fg-brake', 'Hill Start Assist', 'Bantuan start di tanjakan', 5),

-- Driver Assist
('fi-camera-rear', 'fg-assist', 'Kamera Mundur', 'Kamera belakang', 1),
('fi-camera-360', 'fg-assist', 'Kamera 360', 'Kamera around view', 2),
('fi-sensor-front', 'fg-assist', 'Sensor Depan', 'Parking sensor depan', 3),
('fi-sensor-rear', 'fg-assist', 'Sensor Belakang', 'Parking sensor belakang', 4),
('fi-blind-spot', 'fg-assist', 'Blind Spot Monitor', 'Monitor titik buta', 5),
('fi-lane-departure', 'fg-assist', 'Lane Departure Warning', 'Peringatan keluar jalur', 6),
('fi-adaptive-cruise', 'fg-assist', 'Adaptive Cruise Control', 'Kendali kecepatan adaptif', 7),
('fi-auto-brake', 'fg-assist', 'Autonomous Emergency Braking', 'Pengereman otomatis darurat', 8),
('fi-auto-park', 'fg-assist', 'Auto Park', 'Parkir otomatis', 9),
('fi-tpms', 'fg-assist', 'TPMS', 'Tire Pressure Monitoring System', 10),

-- Seat Features
('fi-leather-seat', 'fg-seat', 'Jok Kulit', 'Jok berbahan kulit', 1),
('fi-seat-heater', 'fg-seat', 'Heated Seat', 'Jok dengan pemanas', 2),
('fi-seat-ventilated', 'fg-seat', 'Ventilated Seat', 'Jok dengan ventilasi', 3),
('fi-power-seat', 'fg-seat', 'Power Seat', 'Jok elektrik', 4),
('fi-memory-seat', 'fg-seat', 'Memory Seat', 'Jok dengan memori', 5),
('fi-fold-seat', 'fg-seat', 'Foldable Rear Seat', 'Jok belakang bisa dilipat', 6),

-- Climate Features
('fi-ac-manual', 'fg-climate', 'AC Manual', 'AC manual', 1),
('fi-ac-auto', 'fg-climate', 'AC Auto', 'AC otomatis', 2),
('fi-dual-zone', 'fg-climate', 'Dual Zone AC', 'AC dual zone', 3),
('fi-rear-ac', 'fg-climate', 'Rear AC', 'AC belakang', 4),
('fi-air-purifier', 'fg-climate', 'Air Purifier', 'Penyaring udara', 5),

-- Audio Features
('fi-speaker-std', 'fg-audio', 'Speaker Standard', 'Speaker standar', 1),
('fi-speaker-premium', 'fg-audio', 'Speaker Premium', 'Speaker premium', 2),
('fi-subwoofer', 'fg-audio', 'Subwoofer', 'Subwoofer', 3),
('fi-amplifier', 'fg-audio', 'Amplifier', 'Amplifier eksternal', 4),

-- Connectivity Features
('fi-bluetooth', 'fg-connectivity', 'Bluetooth', 'Koneksi Bluetooth', 1),
('fi-usb', 'fg-connectivity', 'USB Port', 'Port USB', 2),
('fi-aux', 'fg-connectivity', 'AUX Port', 'Port AUX', 3),
('fi-carplay', 'fg-connectivity', 'Apple CarPlay', 'Integrasi iPhone', 4),
('fi-android-auto', 'fg-connectivity', 'Android Auto', 'Integrasi Android', 5),
('fi-wireless-charging', 'fg-connectivity', 'Wireless Charging', 'Charging nirkabel', 6),
('fi-wifi', 'fg-connectivity', 'WiFi Hotspot', 'Hotspot WiFi', 7),

-- Navigation
('fi-nav-built', 'fg-nav', 'Built-in Navigation', 'Navigasi bawaan', 1),
('fi-nav-hud', 'fg-nav', 'Head Up Display', 'Display di kaca depan', 2),
('fi-voice-command', 'fg-nav', 'Voice Command', 'Perintah suara', 3),

-- Lighting
('fi-led-headlamp', 'fg-lighting', 'LED Headlamp', 'Lampu depan LED', 1),
('fi-bi-led', 'fg-lighting', 'Bi-LED Headlamp', 'Lampu depan Bi-LED', 2),
('fi-projector', 'fg-lighting', 'Projector Headlamp', 'Lampu projector', 3),
('fi-auto-light', 'fg-lighting', 'Auto Headlamp', 'Lampu otomatis', 4),
('fi-drl', 'fg-lighting', 'DRL', 'Daytime Running Light', 5),
('fi-fog-lamp', 'fg-lighting', 'Fog Lamp', 'Lampu kabut', 6),
('fi-led-tail', 'fg-lighting', 'LED Tail Lamp', 'Lampu belakang LED', 7),

-- Wheels
('fi-alloy-wheel', 'fg-wheels', 'Alloy Wheel', 'Velg alloy', 1),
('fi-steel-wheel', 'fg-wheels', 'Steel Wheel', 'Velg besi', 2),
('fi-runflat', 'fg-wheels', 'Run Flat Tire', 'Ban run flat', 3),

-- Accessories
('fi-sunroof', 'fg-accessories', 'Sunroof', 'Atap buka', 1),
('fi-panoramic', 'fg-accessories', 'Panoramic Roof', 'Atap panoramic', 2),
('fi-roof-rail', 'fg-accessories', 'Roof Rail', 'Rel atap', 3),
('fi-spoiler', 'fg-accessories', 'Spoiler', 'Spoiler', 4),
('fi-side-step', 'fg-accessories', 'Side Step', 'Langkah samping', 5),
('fi-mudguard', 'fg-accessories', 'Mudguard', 'Pelindung lumpur', 6),

-- Engine Features
('fi-turbo', 'fg-engine', 'Turbocharger', 'Mesin turbo', 1),
('fi-supercharger', 'fg-engine', 'Supercharger', 'Supercharger', 2),
('fi-hybrid', 'fg-engine', 'Hybrid', 'Mesin hybrid', 3),
('fi-electric', 'fg-engine', 'Electric Motor', 'Motor listrik', 4),
('fi-idle-stop', 'fg-engine', 'Idle Stop', 'Engine auto stop', 5),
('fi-eco-mode', 'fg-engine', 'Eco Mode', 'Mode hemat bahan bakar', 6),

-- Transmission
('fi-cvt', 'fg-trans', 'CVT', 'Continuously Variable Transmission', 1),
('fi-dct', 'fg-trans', 'DCT', 'Dual Clutch Transmission', 2),
('fi-paddle-shift', 'fg-trans', 'Paddle Shift', 'Saklar gigi di setir', 3),
('fi-sport-mode', 'fg-trans', 'Sport Mode', 'Mode sport', 4),

-- Drive System
('fi-fwd', 'fg-drive', 'FWD', 'Front Wheel Drive', 1),
('fi-rwd', 'fg-drive', 'RWD', 'Rear Wheel Drive', 2),
('fi-awd', 'fg-drive', 'AWD', 'All Wheel Drive', 3),
('fi-4wd', 'fg-drive', '4WD', 'Four Wheel Drive', 4);
