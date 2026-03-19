-- ==============================================================
-- PART 1: DROP ALL EXISTING TABLES - COMPLETE VERSION
-- Run this FIRST in Supabase SQL Editor
-- ==============================================================

-- Drop all tables in correct order (reverse dependency)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Disable foreign key checks
    EXECUTE 'SET session_replication_role = replica';
    
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all enums
    FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
    
    -- Re-enable foreign key checks
    EXECUTE 'SET session_replication_role = origin';
END $$;

-- Drop extension and recreate
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

SELECT 'All tables and types dropped! Now run Part 2.' as message;
