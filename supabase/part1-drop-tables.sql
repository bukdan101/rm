-- ==============================================================
-- PART 1: DROP ALL EXISTING TABLES
-- Run this FIRST in Supabase SQL Editor
-- ==============================================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS inspection_results CASCADE;
DROP TABLE IF EXISTS inspection_items CASCADE;
DROP TABLE IF EXISTS car_inspections CASCADE;
DROP TABLE IF EXISTS inspection_categories CASCADE;
DROP TABLE IF EXISTS car_favorites CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS credit_packages CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS car_features CASCADE;
DROP TABLE IF EXISTS car_images CASCADE;
DROP TABLE IF EXISTS car_listings CASCADE;
DROP TABLE IF EXISTS car_colors CASCADE;
DROP TABLE IF EXISTS car_variants CASCADE;
DROP TABLE IF EXISTS car_models CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS user_documents CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_verifications CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS car_fuel_types CASCADE;
DROP TABLE IF EXISTS car_transmissions CASCADE;
DROP TABLE IF EXISTS car_body_types CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

SELECT 'All tables dropped successfully! Now run Part 2.' as message;
