-- ==============================================================
-- SEED INDONESIA LOCATIONS
-- ==============================================================

-- Countries
INSERT INTO countries (id, code, name, phone_code, currency_code, currency_name) VALUES
('country-id', 'ID', 'Indonesia', '+62', 'IDR', 'Indonesian Rupiah');

-- Provinces Indonesia
INSERT INTO provinces (id, country_id, code, name) VALUES
('prov-aceh', 'country-id', '11', 'Aceh'),
('prov-sumut', 'country-id', '12', 'Sumatera Utara'),
('prov-sumbar', 'country-id', '13', 'Sumatera Barat'),
('prov-riau', 'country-id', '14', 'Riau'),
('prov-jambi', 'country-id', '15', 'Jambi'),
('prov-sumsel', 'country-id', '16', 'Sumatera Selatan'),
('prov-bengkulu', 'country-id', '17', 'Bengkulu'),
('prov-lampung', 'country-id', '18', 'Lampung'),
('prov-babel', 'country-id', '19', 'Kepulauan Bangka Belitung'),
('prov-kepri', 'country-id', '21', 'Kepulauan Riau'),
('prov-dki', 'country-id', '31', 'DKI Jakarta'),
('prov-jabar', 'country-id', '32', 'Jawa Barat'),
('prov-jateng', 'country-id', '33', 'Jawa Tengah'),
('prov-diy', 'country-id', '34', 'DI Yogyakarta'),
('prov-jatim', 'country-id', '35', 'Jawa Timur'),
('prov-banten', 'country-id', '36', 'Banten'),
('prov-bali', 'country-id', '51', 'Bali'),
('prov-ntb', 'country-id', '52', 'Nusa Tenggara Barat'),
('prov-ntt', 'country-id', '53', 'Nusa Tenggara Timur'),
('prov-kalbar', 'country-id', '61', 'Kalimantan Barat'),
('prov-kalteng', 'country-id', '62', 'Kalimantan Tengah'),
('prov-kalsel', 'country-id', '63', 'Kalimantan Selatan'),
('prov-kaltim', 'country-id', '64', 'Kalimantan Timur'),
('prov-kalut', 'country-id', '65', 'Kalimantan Utara'),
('prov-sulut', 'country-id', '71', 'Sulawesi Utara'),
('prov-sulteng', 'country-id', '72', 'Sulawesi Tengah'),
('prov-sulsel', 'country-id', '73', 'Sulawesi Selatan'),
('prov-sultra', 'country-id', '74', 'Sulawesi Tenggara'),
('prov-gorontalo', 'country-id', '75', 'Gorontalo'),
('prov-sulbar', 'country-id', '76', 'Sulawesi Barat'),
('prov-maluku', 'country-id', '81', 'Maluku'),
('prov-malut', 'country-id', '82', 'Maluku Utara'),
('prov-papua', 'country-id', '91', 'Papua'),
('prov-papbar', 'country-id', '92', 'Papua Barat');

-- Major Cities (Kota/Kabupaten)
INSERT INTO cities (id, province_id, name, type, latitude, longitude) VALUES
-- DKI Jakarta
('city-jakpus', 'prov-dki', 'Jakarta Pusat', 'kota', -6.1751, 106.8650),
('city-jakut', 'prov-dki', 'Jakarta Utara', 'kota', -6.1384, 106.8419),
('city-jakbar', 'prov-dki', 'Jakarta Barat', 'kota', -6.1618, 106.7392),
('city-jaksel', 'prov-dki', 'Jakarta Selatan', 'kota', -6.2615, 106.8106),
('city-jaktim', 'prov-dki', 'Jakarta Timur', 'kota', -6.2256, 106.9006),

-- Jawa Barat
('city-bandung', 'prov-jabar', 'Bandung', 'kota', -6.9175, 107.6191),
('city-bogor', 'prov-jabar', 'Bogor', 'kota', -6.5950, 106.8167),
('city-depok', 'prov-jabar', 'Depok', 'kota', -6.4025, 106.7942),
('city-bekasi', 'prov-jabar', 'Bekasi', 'kota', -6.2349, 106.9896),
('city-cimahi', 'prov-jabar', 'Cimahi', 'kota', -6.8841, 107.5413),
('city-sukabumi', 'prov-jabar', 'Sukabumi', 'kota', -6.9222, 106.9270),
('city-tasik', 'prov-jabar', 'Tasikmalaya', 'kota', -7.3274, 108.2208),
('city-garut', 'prov-jabar', 'Garut', 'kabupaten', -7.2275, 107.9089),
('city-karawang', 'prov-jabar', 'Karawang', 'kabupaten', -6.3227, 107.3376),
('city-purwakarta', 'prov-jabar', 'Purwakarta', 'kabupaten', -6.5576, 107.4458),
('city-subang', 'prov-jabar', 'Subang', 'kabupaten', -6.5640, 107.7609),

-- Banten
('city-tangerang', 'prov-banten', 'Tangerang', 'kota', -6.1783, 106.6318),
('city-tangerang-sel', 'prov-banten', 'Tangerang Selatan', 'kota', -6.2884, 106.7227),
('city-serang', 'prov-banten', 'Serang', 'kota', -6.1200, 106.1500),
('city-cilegon', 'prov-banten', 'Cilegon', 'kota', -6.0186, 106.0169),

-- Jawa Tengah
('city-semarang', 'prov-jateng', 'Semarang', 'kota', -6.9666, 110.4196),
('city-solo', 'prov-jateng', 'Surakarta', 'kota', -7.5697, 110.5944),
('city-pemalang', 'prov-jateng', 'Pemalang', 'kabupaten', -6.8931, 109.3875),
('city-pekalongan', 'prov-jateng', 'Pekalongan', 'kota', -6.8880, 109.6744),

-- Jawa Timur
('city-surabaya', 'prov-jatim', 'Surabaya', 'kota', -7.2575, 112.7521),
('city-malang', 'prov-jatim', 'Malang', 'kota', -7.9666, 112.6326),
('city-sidoarjo', 'prov-jatim', 'Sidoarjo', 'kabupaten', -7.4478, 112.7183),
('city-gresik', 'prov-jatim', 'Gresik', 'kabupaten', -7.2585, 112.6547),

-- DI Yogyakarta
('city-yogya', 'prov-diy', 'Yogyakarta', 'kota', -7.7971, 110.3608),
('city-sleman', 'prov-diy', 'Sleman', 'kabupaten', -7.7005, 110.3292),

-- Bali
('city-dps', 'prov-bali', 'Denpasar', 'kota', -8.6500, 115.2167),
('city-badung', 'prov-bali', 'Badung', 'kabupaten', -8.4167, 115.1833),

-- Sumatera Utara
('city-medan', 'prov-sumut', 'Medan', 'kota', 3.5952, 98.6722),

-- Sumatera Selatan
('city-palembang', 'prov-sumsel', 'Palembang', 'kota', -2.9909, 104.7566),

-- Riau
('city-pekanbaru', 'prov-riau', 'Pekanbaru', 'kota', 0.5071, 101.4478),

-- Kalimantan Timur
('city-balikpapan', 'prov-kaltim', 'Balikpapan', 'kota', -1.2654, 116.8312),
('city-samarinda', 'prov-kaltim', 'Samarinda', 'kota', -0.5022, 117.1536),

-- Sulawesi Selatan
('city-makassar', 'prov-sulsel', 'Makassar', 'kota', -5.1477, 119.4327);

-- ==============================================================
-- SEED NOTIFICATION TEMPLATES
-- ==============================================================

INSERT INTO notification_templates (type, title_template, message_template, variables, channels) VALUES
('listing_created', 'Iklan Berhasil Dibuat', 'Iklan Anda untuk {car_name} telah berhasil dibuat dan sedang dalam proses review.', ARRAY['car_name'], ARRAY['push', 'email']),
('listing_approved', 'Iklan Telah Disetujui', 'Iklan Anda untuk {car_name} telah disetujui dan sekarang aktif.', ARRAY['car_name'], ARRAY['push', 'email']),
('listing_rejected', 'Iklan Ditolak', 'Iklan Anda untuk {car_name} ditolak. Alasan: {reason}', ARRAY['car_name', 'reason'], ARRAY['push', 'email']),
('listing_expired', 'Iklan Kedaluwarsa', 'Iklan Anda untuk {car_name} telah kedaluwarsa. Perbarui sekarang!', ARRAY['car_name'], ARRAY['push', 'email']),
('listing_sold', 'Iklan Terjual', 'Selamat! Iklan Anda untuk {car_name} telah terjual.', ARRAY['car_name'], ARRAY['push', 'email']),
('new_inquiry', 'Pertanyaan Baru', 'Anda menerima pertanyaan baru untuk {car_name} dari {buyer_name}.', ARRAY['car_name', 'buyer_name'], ARRAY['push', 'email', 'sms']),
('new_message', 'Pesan Baru', 'Anda memiliki pesan baru dari {sender_name}.', ARRAY['sender_name'], ARRAY['push']),
('price_drop', 'Penurunan Harga', 'Harga {car_name} telah diturunkan menjadi {new_price}.', ARRAY['car_name', 'new_price'], ARRAY['push']),
('inspection_completed', 'Inspeksi Selesai', 'Inspeksi untuk {car_name} telah selesai dengan skor {score}.', ARRAY['car_name', 'score'], ARRAY['push', 'email']),
('inspection_certificate', 'Sertifikat Inspeksi', 'Sertifikat inspeksi untuk {car_name} telah tersedia.', ARRAY['car_name'], ARRAY['push', 'email']),
('rental_confirmed', 'Rental Dikonfirmasi', 'Booking rental untuk {car_name} telah dikonfirmasi.', ARRAY['car_name'], ARRAY['push', 'email', 'sms']),
('rental_reminder', 'Pengingat Rental', 'Rental Anda untuk {car_name} akan berakhir dalam {days} hari.', ARRAY['car_name', 'days'], ARRAY['push', 'email']),
('order_created', 'Pesanan Baru', 'Pesanan baru untuk {car_name} telah dibuat.', ARRAY['car_name'], ARRAY['push', 'email']),
('payment_received', 'Pembayaran Diterima', 'Pembayaran sebesar {amount} telah diterima.', ARRAY['amount'], ARRAY['push', 'email', 'sms']),
('escrow_released', 'Dana Dilepas', 'Dana sebesar {amount} telah dilepas ke rekening Anda.', ARRAY['amount'], ARRAY['push', 'email', 'sms']),
('review_received', 'Review Baru', '{reviewer_name} memberikan review untuk {car_name}.', ARRAY['reviewer_name', 'car_name'], ARRAY['push']),
('favorite_price_drop', 'Harga Favorit Turun', 'Mobil favorit Anda {car_name} harga turun menjadi {new_price}.', ARRAY['car_name', 'new_price'], ARRAY['push', 'email']);

-- ==============================================================
-- SEED CAR BODY TYPES
-- ==============================================================

INSERT INTO car_body_types (id, name, description, icon_url) VALUES
('body-sedan', 'Sedan', 'Mobil penumpang dengan 4 pintu dan bagasi terpisah', NULL),
('body-suv', 'SUV', 'Sport Utility Vehicle, cocok untuk segala medan', NULL),
('body-mpv', 'MPV', 'Multi Purpose Vehicle, mobil keluarga dengan kapasitas besar', NULL),
('body-hatchback', 'Hatchback', 'Mobil kompak dengan bagasi menyatu', NULL),
('body-pickup', 'Pickup', 'Mobil bak terbuka untuk muatan', NULL),
('body-van', 'Van', 'Mobil box untuk angkutan barang/penumpang', NULL),
('body-coupe', 'Coupe', 'Mobil 2 pintu bergaya sporty', NULL),
('body-convertible', 'Convertible', 'Mobil dengan atap yang bisa dibuka', NULL),
('body-wagon', 'Wagon/Station Wagon', 'Sedan dengan bagasi diperpanjang', NULL);

-- ==============================================================
-- SEED CAR FUEL TYPES
-- ==============================================================

INSERT INTO car_fuel_types (id, name, description, icon_url) VALUES
('fuel-bensin', 'Bensin', 'Mesin bensin konvensional', NULL),
('fuel-diesel', 'Diesel', 'Mesin diesel untuk tenaga dan efisiensi', NULL),
('fuel-electric', 'Listrik', 'Kendaraan listrik murni (EV)', NULL),
('fuel-hybrid', 'Hybrid', 'Kombinasi mesin dan motor listrik', NULL),
('fuel-petrol-hybrid', 'Petrol Hybrid', 'Hybrid dengan mesin bensin', NULL);

-- ==============================================================
-- SEED CAR TRANSMISSIONS
-- ==============================================================

INSERT INTO car_transmissions (id, name, description) VALUES
('trans-manual', 'Manual', 'Transmisi manual dengan kopling'),
('trans-automatic', 'Automatic', 'Transmisi otomatis'),
('trans-cvt', 'CVT', 'Continuously Variable Transmission'),
('trans-dct', 'DCT', 'Dual Clutch Transmission');
