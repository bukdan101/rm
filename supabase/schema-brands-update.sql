-- Update brands table with additional columns
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_brands_display_order ON brands(display_order);

-- Seed all 34 brands with logos
INSERT INTO brands (name, logo, website_url, display_order, is_active) VALUES
('Toyota', '/brands/toyota.png', 'https://www.toyota.astra.co.id/', 1, true),
('Honda', '/brands/honda.png', 'https://www.honda-indonesia.com/', 2, true),
('BMW', '/brands/bmw.png', 'https://www.bmw.co.id/', 3, true),
('Mercedes-Benz', '/brands/mercedes-benz.png', 'https://www.mercedes-benz.co.id/', 4, true),
('Hyundai', '/brands/hyundai.png', 'https://www.hyundai.com/id/', 5, true),
('Mitsubishi', '/brands/mitsubishi.png', 'https://www.mitsubishi-motors.co.id/', 6, true),
('Suzuki', '/brands/suzuki.png', 'https://www.suzuki.co.id/', 7, true),
('Daihatsu', '/brands/daihatsu.png', 'https://www.astra-daihatsu.id/', 8, true),
('Nissan', '/brands/nissan.png', 'https://www.nissan.co.id/', 9, true),
('Mazda', '/brands/mazda.png', 'https://www.mazda.co.id/', 10, true),
('Ford', '/brands/ford.png', 'https://www.ford.co.id/', 11, true),
('Wuling', '/brands/wuling.png', 'https://wulingmotors.id/', 12, true),
('Audi', '/brands/audi.png', 'https://www.audi.co.id/', 13, true),
('Lexus', '/brands/lexus.png', 'https://www.lexus.co.id/', 14, true),
('Chery', '/brands/chery.png', 'https://www.chery.co.id/', 15, true),
('BYD', '/brands/byd.png', 'https://www.byd.com/id', 16, true),
('Kia', '/brands/kia.png', 'https://www.kia.com/id/', 17, true),
('Volkswagen', '/brands/volkswagen.png', 'https://www.volkswagen.co.id/', 18, true),
('MINI', '/brands/mini.png', 'https://www.mini.co.id/', 19, true),
('Porsche', '/brands/porsche.png', 'https://www.porsche.com/indonesia/', 20, true),
('Land Rover', '/brands/land-rover.png', 'https://www.landrover.co.id/', 21, true),
('Jeep', '/brands/jeep.png', 'https://www.jeep.co.id/', 22, true),
('GAC', '/brands/gac.png', 'https://www.gacmotor.co.id/', 23, true),
('Geely', '/brands/geely.png', 'https://www.geely.co.id/', 24, true),
('Chevrolet', '/brands/chevrolet.png', 'https://www.chevrolet.co.id/', 25, true),
('GWM', '/brands/gwm.svg', 'https://www.gwm.com/global/', 26, true),
('MG', '/brands/mg.png', 'https://www.mg.co.id/', 27, true),
('Subaru', '/brands/subaru.png', 'https://www.subaru.co.id/', 28, true),
('Isuzu', '/brands/isuzu.png', 'https://www.isuzu-astra.com/', 29, true),
('Peugeot', '/brands/peugeot.png', 'https://www.peugeot.co.id/', 30, true),
('Ferrari', '/brands/ferrari.png', 'https://www.ferrari.com/', 31, true),
('Tesla', '/brands/tesla.png', 'https://www.tesla.com/', 32, true),
('Maxus', '/brands/maxus.png', 'https://www.maxus.id/', 33, true),
('Citroen', '/brands/citroen.png', 'https://www.citroen.co.id/', 34, true)
ON CONFLICT (name) DO UPDATE SET
  logo = EXCLUDED.logo,
  website_url = EXCLUDED.website_url,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
