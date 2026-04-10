-- ============================================
-- AutoMarket Indonesia - Schema Initialization
-- Creates 6 PostgreSQL schemas for microservices
-- No Foreign Keys - UUID string references only
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- SCHEMA 1: user_schema
-- Service: user-service (port 8001)
-- Tables: 8
-- ============================================
CREATE SCHEMA IF NOT EXISTS user_schema;

-- ============================================
-- SCHEMA 2: listing_schema
-- Service: listing-service (port 8002)
-- Tables: 17
-- ============================================
CREATE SCHEMA IF NOT EXISTS listing_schema;

-- ============================================
-- SCHEMA 3: interaction_schema
-- Service: interaction-service (port 8003)
-- Tables: 7
-- ============================================
CREATE SCHEMA IF NOT EXISTS interaction_schema;

-- ============================================
-- SCHEMA 4: transaction_schema
-- Service: transaction-service (port 8004)
-- Tables: 15
-- ============================================
CREATE SCHEMA IF NOT EXISTS transaction_schema;

-- ============================================
-- SCHEMA 5: business_schema
-- Service: business-service (port 8005)
-- Tables: 15
-- ============================================
CREATE SCHEMA IF NOT EXISTS business_schema;

-- ============================================
-- SCHEMA 6: system_schema
-- Service: system-service (port 8006)
-- Tables: 14
-- ============================================
CREATE SCHEMA IF NOT EXISTS system_schema;

-- ============================================
-- Grant permissions (all schemas accessible by postgres)
-- ============================================
GRANT ALL ON SCHEMA user_schema TO postgres;
GRANT ALL ON SCHEMA listing_schema TO postgres;
GRANT ALL ON SCHEMA interaction_schema TO postgres;
GRANT ALL ON SCHEMA transaction_schema TO postgres;
GRANT ALL ON SCHEMA business_schema TO postgres;
GRANT ALL ON SCHEMA system_schema TO postgres;

-- ============================================
-- Set default search path per service user
-- (used via DB_SCHEMA env var in GORM)
-- ============================================

-- Done! Schemas are ready for GORM AutoMigrate.
-- Each service connects with search_path set to its schema:
--   user-service       -> SET search_path TO user_schema, public
--   listing-service    -> SET search_path TO listing_schema, public
--   interaction-service -> SET search_path TO interaction_schema, public
--   transaction-service -> SET search_path TO transaction_schema, public
--   business-service   -> SET search_path TO business_schema, public
--   system-service     -> SET search_path TO system_schema, public
