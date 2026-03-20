-- ==============================
-- SEED CAR COLORS
-- ==============================

INSERT INTO car_colors (name, hex_code, is_metallic) VALUES
('Putih', '#FFFFFF', false),
('Putih Metalik', '#F5F5F5', true),
('Hitam', '#000000', false),
('Hitam Metalik', '#1a1a1a', true),
('Silver', '#C0C0C0', true),
('Abu-Abu', '#808080', false),
('Abu-Abu Metalik', '#696969', true),
('Merah', '#FF0000', false),
('Merah Metalik', '#B22222', true),
('Biru', '#0000FF', false),
('Biru Metalik', '#1E90FF', true),
('Biru Tua', '#00008B', false),
('Biru Tua Metalik', '#191970', true),
('Coklat', '#8B4513', false),
('Coklat Metalik', '#A0522D', true),
('Hijau', '#228B22', false),
('Hijau Metalik', '#2E8B57', true),
('Gold', '#FFD700', true),
('Champagne', '#F7E7CE', true),
('Beige', '#F5F5DC', false),
('Orange', '#FF8C00', false),
('Kuning', '#FFFF00', false),
('Burgundy', '#800020', true),
('Bronze', '#CD7F32', true),
('Tosca', '#40E0D0', false),
('Navy', '#000080', true),
('Maroon', '#800000', false),
('Gunmetal', '#2C3539', true),
('Graphite', '#383838', true),
('Copper', '#B87333', true);

-- ==============================
-- SEED BRANDS
-- ==============================

INSERT INTO brands (name) VALUES
('Toyota'),
('Honda'),
('Suzuki'),
('Daihatsu'),
('Mitsubishi'),
('Nissan'),
('Mazda'),
('Subaru'),
('Isuzu'),
('Hyundai'),
('Kia'),
('Wuling'),
('Chery'),
('BMW'),
('Mercedes-Benz'),
('Audi'),
('Volkswagen'),
('Volvo'),
('Peugeot'),
('Renault'),
('Ford'),
('Chevrolet'),
('Jeep'),
('Tesla'),
('Lexus'),
('Infiniti'),
('Acura'),
('Mini'),
('Land Rover'),
('Jaguar'),
('Porsche'),
('Maserati'),
('Bentley'),
('Rolls-Royce'),
('Ferrari'),
('Lamborghini'),
('McLaren'),
('Aston Martin'),
('Bugatti'),
('Genesis'),
('BYD'),
('MG'),
('DFSK'),
('Hino'),
('UD Trucks');

-- ==============================
-- SEED CAR MODELS
-- ==============================

-- Toyota Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Avanza' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Innova' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Fortuner' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Alphard' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Vellfire' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Agya' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Calya' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Camry' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Corolla' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Yaris' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Vios' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Rush' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Land Cruiser' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Prado' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Hilux' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Hiace' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Raize' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Veloz' FROM brands WHERE name = 'Toyota';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Kijang' FROM brands WHERE name = 'Toyota';

-- Honda Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Brio' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'HR-V' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'CR-V' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'City' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Civic' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Accord' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Jazz' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Mobilio' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'BR-V' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Odyssey' FROM brands WHERE name = 'Honda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'WR-V' FROM brands WHERE name = 'Honda';

-- Suzuki Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Ertiga' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'XL7' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Carry' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Ignis' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Baleno' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Swift' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'SX4' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Jimny' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'APV' FROM brands WHERE name = 'Suzuki';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Dzire' FROM brands WHERE name = 'Suzuki';

-- Daihatsu Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Xenia' FROM brands WHERE name = 'Daihatsu';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Terios' FROM brands WHERE name = 'Daihatsu';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Ayla' FROM brands WHERE name = 'Daihatsu';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Sigra' FROM brands WHERE name = 'Daihatsu';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Gran Max' FROM brands WHERE name = 'Daihatsu';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Luxio' FROM brands WHERE name = 'Daihatsu';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Sirion' FROM brands WHERE name = 'Daihatsu';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Rocky' FROM brands WHERE name = 'Daihatsu';

-- Mitsubishi Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Xpander' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Pajero' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Triton' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Lancer' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Mirage' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Outlander' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Eclipse Cross' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Colt' FROM brands WHERE name = 'Mitsubishi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Delica' FROM brands WHERE name = 'Mitsubishi';

-- Nissan Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'X-Trail' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Serena' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Grand Livina' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'March' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Juke' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Navara' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Teana' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Sylphy' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Leaf' FROM brands WHERE name = 'Nissan';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Kicks' FROM brands WHERE name = 'Nissan';

-- Mazda Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'CX-5' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'CX-8' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'CX-30' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'CX-9' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Mazda3' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Mazda6' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Mazda2' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'MX-5' FROM brands WHERE name = 'Mazda';
INSERT INTO car_models (brand_id, name)
SELECT id, 'BT-50' FROM brands WHERE name = 'Mazda';

-- Hyundai Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Starex' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Tucson' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Santa Fe' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Creta' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Ioniq' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Kona' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Palisade' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Accent' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Elantra' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Sonata' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Veloster' FROM brands WHERE name = 'Hyundai';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Staria' FROM brands WHERE name = 'Hyundai';

-- Kia Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Carnival' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Sorento' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Sportage' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Rio' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Picanto' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Seltos' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Carens' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'K5' FROM brands WHERE name = 'Kia';
INSERT INTO car_models (brand_id, name)
SELECT id, 'K9' FROM brands WHERE name = 'Kia';

-- Wuling Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Almaz' FROM brands WHERE name = 'Wuling';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Cortez' FROM brands WHERE name = 'Wuling';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Confero' FROM brands WHERE name = 'Wuling';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Formo' FROM brands WHERE name = 'Wuling';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Airtek' FROM brands WHERE name = 'Wuling';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Alvez' FROM brands WHERE name = 'Wuling';

-- BMW Models
INSERT INTO car_models (brand_id, name)
SELECT id, '320i' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, '520i' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, '730i' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'X1' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'X3' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'X5' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'X7' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, '320d' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, '530i' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, '740i' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'M3' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'M5' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'X4' FROM brands WHERE name = 'BMW';
INSERT INTO car_models (brand_id, name)
SELECT id, 'X6' FROM brands WHERE name = 'BMW';

-- Mercedes-Benz Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'C200' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'E200' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'S300' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'GLA' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'GLC' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'GLE' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'GLS' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'A-Class' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'B-Class' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'C300' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'E300' FROM brands WHERE name = 'Mercedes-Benz';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Maybach' FROM brands WHERE name = 'Mercedes-Benz';

-- Audi Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'A3' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'A4' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'A5' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'A6' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'A8' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Q3' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Q5' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Q7' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Q8' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'TT' FROM brands WHERE name = 'Audi';
INSERT INTO car_models (brand_id, name)
SELECT id, 'R8' FROM brands WHERE name = 'Audi';

-- Volkswagen Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Golf' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Passat' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Tiguan' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Polo' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Jetta' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Touran' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Caravelle' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Amarok' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'T-Roc' FROM brands WHERE name = 'Volkswagen';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Teramont' FROM brands WHERE name = 'Volkswagen';

-- Lexus Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'ES300h' FROM brands WHERE name = 'Lexus';
INSERT INTO car_models (brand_id, name)
SELECT id, 'RX300' FROM brands WHERE name = 'Lexus';
INSERT INTO car_models (brand_id, name)
SELECT id, 'LX570' FROM brands WHERE name = 'Lexus';
INSERT INTO car_models (brand_id, name)
SELECT id, 'NX300' FROM brands WHERE name = 'Lexus';
INSERT INTO car_models (brand_id, name)
SELECT id, 'UX200' FROM brands WHERE name = 'Lexus';
INSERT INTO car_models (brand_id, name)
SELECT id, 'GX460' FROM brands WHERE name = 'Lexus';
INSERT INTO car_models (brand_id, name)
SELECT id, 'LS500' FROM brands WHERE name = 'Lexus';
INSERT INTO car_models (brand_id, name)
SELECT id, 'LM300' FROM brands WHERE name = 'Lexus';

-- Jeep Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Wrangler' FROM brands WHERE name = 'Jeep';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Grand Cherokee' FROM brands WHERE name = 'Jeep';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Compass' FROM brands WHERE name = 'Jeep';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Cherokee' FROM brands WHERE name = 'Jeep';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Renegade' FROM brands WHERE name = 'Jeep';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Gladiator' FROM brands WHERE name = 'Jeep';

-- Land Rover Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Range Rover' FROM brands WHERE name = 'Land Rover';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Range Rover Sport' FROM brands WHERE name = 'Land Rover';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Range Rover Evoque' FROM brands WHERE name = 'Land Rover';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Discovery' FROM brands WHERE name = 'Land Rover';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Defender' FROM brands WHERE name = 'Land Rover';

-- Tesla Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Model 3' FROM brands WHERE name = 'Tesla';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Model S' FROM brands WHERE name = 'Tesla';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Model X' FROM brands WHERE name = 'Tesla';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Model Y' FROM brands WHERE name = 'Tesla';

-- Porsche Models
INSERT INTO car_models (brand_id, name)
SELECT id, '911' FROM brands WHERE name = 'Porsche';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Cayenne' FROM brands WHERE name = 'Porsche';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Macan' FROM brands WHERE name = 'Porsche';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Panamera' FROM brands WHERE name = 'Porsche';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Taycan' FROM brands WHERE name = 'Porsche';

-- Ford Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Ranger' FROM brands WHERE name = 'Ford';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Everest' FROM brands WHERE name = 'Ford';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Explorer' FROM brands WHERE name = 'Ford';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Escape' FROM brands WHERE name = 'Ford';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Focus' FROM brands WHERE name = 'Ford';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Mustang' FROM brands WHERE name = 'Ford';
INSERT INTO car_models (brand_id, name)
SELECT id, 'F-150' FROM brands WHERE name = 'Ford';

-- Volvo Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'XC60' FROM brands WHERE name = 'Volvo';
INSERT INTO car_models (brand_id, name)
SELECT id, 'XC90' FROM brands WHERE name = 'Volvo';
INSERT INTO car_models (brand_id, name)
SELECT id, 'S60' FROM brands WHERE name = 'Volvo';
INSERT INTO car_models (brand_id, name)
SELECT id, 'S90' FROM brands WHERE name = 'Volvo';
INSERT INTO car_models (brand_id, name)
SELECT id, 'V60' FROM brands WHERE name = 'Volvo';

-- Jaguar Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'XE' FROM brands WHERE name = 'Jaguar';
INSERT INTO car_models (brand_id, name)
SELECT id, 'XF' FROM brands WHERE name = 'Jaguar';
INSERT INTO car_models (brand_id, name)
SELECT id, 'XJ' FROM brands WHERE name = 'Jaguar';
INSERT INTO car_models (brand_id, name)
SELECT id, 'F-Pace' FROM brands WHERE name = 'Jaguar';
INSERT INTO car_models (brand_id, name)
SELECT id, 'F-Type' FROM brands WHERE name = 'Jaguar';

-- Chery Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Tiggo 8 Pro' FROM brands WHERE name = 'Chery';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Tiggo 7 Pro' FROM brands WHERE name = 'Chery';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Tiggo 5x' FROM brands WHERE name = 'Chery';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Omoda 5' FROM brands WHERE name = 'Chery';

-- MG Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'ZS' FROM brands WHERE name = 'MG';
INSERT INTO car_models (brand_id, name)
SELECT id, 'HS' FROM brands WHERE name = 'MG';
INSERT INTO car_models (brand_id, name)
SELECT id, 'RX5' FROM brands WHERE name = 'MG';
INSERT INTO car_models (brand_id, name)
SELECT id, 'MG4' FROM brands WHERE name = 'MG';

-- BYD Models
INSERT INTO car_models (brand_id, name)
SELECT id, 'Atto 3' FROM brands WHERE name = 'BYD';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Dolphin' FROM brands WHERE name = 'BYD';
INSERT INTO car_models (brand_id, name)
SELECT id, 'Seal' FROM brands WHERE name = 'BYD';
INSERT INTO car_models (brand_id, name)
SELECT id, 'M6' FROM brands WHERE name = 'BYD';

-- ==============================
-- SEED CAR VARIANTS
-- ==============================

-- Toyota Avanza Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.3 E MT' FROM car_models WHERE name = 'Avanza';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.3 E CVT' FROM car_models WHERE name = 'Avanza';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 G MT' FROM car_models WHERE name = 'Avanza';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 G CVT' FROM car_models WHERE name = 'Avanza';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 S MT' FROM car_models WHERE name = 'Avanza';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 S CVT' FROM car_models WHERE name = 'Avanza';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Veloz 1.5 CVT' FROM car_models WHERE name = 'Avanza';

-- Toyota Innova Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 V MT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 V AT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 G MT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 G AT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 E MT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 E AT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 X MT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 X AT' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Zenix Hybrid 2.0' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Zenix Hybrid 2.0 Q' FROM car_models WHERE name = 'Innova';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Zenix Hybrid 2.0 V' FROM car_models WHERE name = 'Innova';

-- Toyota Fortuner Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '2.4 G 4x2 MT' FROM car_models WHERE name = 'Fortuner';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.4 G 4x2 AT' FROM car_models WHERE name = 'Fortuner';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.4 V 4x2 AT' FROM car_models WHERE name = 'Fortuner';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.4 VRZ 4x2 AT' FROM car_models WHERE name = 'Fortuner';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.8 V 4x4 AT' FROM car_models WHERE name = 'Fortuner';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.8 VRZ 4x4 AT' FROM car_models WHERE name = 'Fortuner';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GR-S 2.8 4x4 AT' FROM car_models WHERE name = 'Fortuner';

-- Toyota Alphard Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '2.5 X' FROM car_models WHERE name = 'Alphard';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.5 G' FROM car_models WHERE name = 'Alphard';
INSERT INTO car_variants (model_id, name)
SELECT id, '3.5 Q' FROM car_models WHERE name = 'Alphard';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.5 Hybrid' FROM car_models WHERE name = 'Alphard';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.5 Hybrid Executive Lounge' FROM car_models WHERE name = 'Alphard';

-- Honda HR-V Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 S MT' FROM car_models WHERE name = 'HR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 S CVT' FROM car_models WHERE name = 'HR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 E CVT' FROM car_models WHERE name = 'HR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 SE CVT' FROM car_models WHERE name = 'HR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 RS CVT' FROM car_models WHERE name = 'HR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e:HEV RS' FROM car_models WHERE name = 'HR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e:HEV SE' FROM car_models WHERE name = 'HR-V';

-- Honda CR-V Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 S AT' FROM car_models WHERE name = 'CR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 E AT' FROM car_models WHERE name = 'CR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 SE AT' FROM car_models WHERE name = 'CR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 Turbo AT' FROM car_models WHERE name = 'CR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e:HEV RS' FROM car_models WHERE name = 'CR-V';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e:HEV SE' FROM car_models WHERE name = 'CR-V';

-- Mitsubishi Xpander Variants
INSERT INTO car_variants (model_id, name)
SELECT id, 'GLS MT' FROM car_models WHERE name = 'Xpander';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GLS AT' FROM car_models WHERE name = 'Xpander';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Exceed AT' FROM car_models WHERE name = 'Xpander';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Sport MT' FROM car_models WHERE name = 'Xpander';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Sport AT' FROM car_models WHERE name = 'Xpander';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Cross MT' FROM car_models WHERE name = 'Xpander';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Cross AT' FROM car_models WHERE name = 'Xpander';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Cross Exceed AT' FROM car_models WHERE name = 'Xpander';

-- Suzuki Ertiga Variants
INSERT INTO car_variants (model_id, name)
SELECT id, 'GL MT' FROM car_models WHERE name = 'Ertiga';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GL AT' FROM car_models WHERE name = 'Ertiga';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GX MT' FROM car_models WHERE name = 'Ertiga';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GX AT' FROM car_models WHERE name = 'Ertiga';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Sport MT' FROM car_models WHERE name = 'Ertiga';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Sport AT' FROM car_models WHERE name = 'Ertiga';

-- Suzuki XL7 Variants
INSERT INTO car_variants (model_id, name)
SELECT id, 'GL MT' FROM car_models WHERE name = 'XL7';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GL AT' FROM car_models WHERE name = 'XL7';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GX MT' FROM car_models WHERE name = 'XL7';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GX AT' FROM car_models WHERE name = 'XL7';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Alpha MT' FROM car_models WHERE name = 'XL7';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Alpha AT' FROM car_models WHERE name = 'XL7';

-- Daihatsu Xenia Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 M MT' FROM car_models WHERE name = 'Xenia';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 X MT' FROM car_models WHERE name = 'Xenia';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.3 R MT' FROM car_models WHERE name = 'Xenia';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.3 R CVT' FROM car_models WHERE name = 'Xenia';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 R MT' FROM car_models WHERE name = 'Xenia';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 R CVT' FROM car_models WHERE name = 'Xenia';

-- Daihatsu Sigra Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 D MT' FROM car_models WHERE name = 'Sigra';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 M MT' FROM car_models WHERE name = 'Sigra';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 X MT' FROM car_models WHERE name = 'Sigra';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 X AT' FROM car_models WHERE name = 'Sigra';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.2 R MT' FROM car_models WHERE name = 'Sigra';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.2 R CVT' FROM car_models WHERE name = 'Sigra';

-- Nissan X-Trail Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '2.5 MT' FROM car_models WHERE name = 'X-Trail';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.5 CVT' FROM car_models WHERE name = 'X-Trail';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e-Power' FROM car_models WHERE name = 'X-Trail';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e-Power e-4ORCE' FROM car_models WHERE name = 'X-Trail';

-- Mazda CX-5 Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 KSK MT' FROM car_models WHERE name = 'CX-5';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.0 KSK AT' FROM car_models WHERE name = 'CX-5';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.5 KSK AT' FROM car_models WHERE name = 'CX-5';
INSERT INTO car_variants (model_id, name)
SELECT id, '2.2D KSK AT' FROM car_models WHERE name = 'CX-5';

-- Hyundai Creta Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 Active MT' FROM car_models WHERE name = 'Creta';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 Active IVT' FROM car_models WHERE name = 'Creta';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 Style IVT' FROM car_models WHERE name = 'Creta';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 Turbo Style DCT' FROM car_models WHERE name = 'Creta';

-- Wuling Almaz Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 Turbo' FROM car_models WHERE name = 'Almaz';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 Turbo RS' FROM car_models WHERE name = 'Almaz';
INSERT INTO car_variants (model_id, name)
SELECT id, 'HEV' FROM car_models WHERE name = 'Almaz';

-- Kia Seltos Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.4 EX MT' FROM car_models WHERE name = 'Seltos';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.4 EX IVT' FROM car_models WHERE name = 'Seltos';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.6 GT Line DCT' FROM car_models WHERE name = 'Seltos';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.6 GT Line AWD DCT' FROM car_models WHERE name = 'Seltos';

-- BMW X1 Variants
INSERT INTO car_variants (model_id, name)
SELECT id, 'sDrive18i' FROM car_models WHERE name = 'X1';
INSERT INTO car_variants (model_id, name)
SELECT id, 'sDrive20i' FROM car_models WHERE name = 'X1';
INSERT INTO car_variants (model_id, name)
SELECT id, 'xDrive20i' FROM car_models WHERE name = 'X1';

-- Mercedes-Benz GLC Variants
INSERT INTO car_variants (model_id, name)
SELECT id, 'GLC 200' FROM car_models WHERE name = 'GLC';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GLC 300' FROM car_models WHERE name = 'GLC';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GLC 300 4MATIC' FROM car_models WHERE name = 'GLC';
INSERT INTO car_variants (model_id, name)
SELECT id, 'GLC 300e' FROM car_models WHERE name = 'GLC';

-- Toyota Agya Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 E MT' FROM car_models WHERE name = 'Agya';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 G MT' FROM car_models WHERE name = 'Agya';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 G CVT' FROM car_models WHERE name = 'Agya';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.2 TRD MT' FROM car_models WHERE name = 'Agya';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.2 TRD CVT' FROM car_models WHERE name = 'Agya';

-- Toyota Raize Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 G MT' FROM car_models WHERE name = 'Raize';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 G CVT' FROM car_models WHERE name = 'Raize';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 T MT' FROM car_models WHERE name = 'Raize';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.0 T CVT' FROM car_models WHERE name = 'Raize';

-- Honda Brio Variants
INSERT INTO car_variants (model_id, name)
SELECT id, 'Satya E MT' FROM car_models WHERE name = 'Brio';
INSERT INTO car_variants (model_id, name)
SELECT id, 'Satya E CVT' FROM car_models WHERE name = 'Brio';
INSERT INTO car_variants (model_id, name)
SELECT id, 'RS MT' FROM car_models WHERE name = 'Brio';
INSERT INTO car_variants (model_id, name)
SELECT id, 'RS CVT' FROM car_models WHERE name = 'Brio';
INSERT INTO car_variants (model_id, name)
SELECT id, 'RS Honda Sensing CVT' FROM car_models WHERE name = 'Brio';

-- Honda City Variants
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 S MT' FROM car_models WHERE name = 'City';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 S CVT' FROM car_models WHERE name = 'City';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 E CVT' FROM car_models WHERE name = 'City';
INSERT INTO car_variants (model_id, name)
SELECT id, '1.5 SE CVT' FROM car_models WHERE name = 'City';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e:HEV RS' FROM car_models WHERE name = 'City';
INSERT INTO car_variants (model_id, name)
SELECT id, 'e:HEV SE' FROM car_models WHERE name = 'City';
