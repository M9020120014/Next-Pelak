-- ============================================================================
-- Module: Reset and Recreate Project Schema
-- Description: This file drops all schemas and recreates them
-- ⚠️ Warning: This file will delete all existing data!
-- ============================================================================
-- ----------------------------------------------------------------------------
-- Drop project schema (if exists)
-- ----------------------------------------------------------------------------
DROP SCHEMA IF EXISTS "project" CASCADE;

-- ----------------------------------------------------------------------------
-- Drop pelak schema (if exists)
-- ----------------------------------------------------------------------------
DROP SCHEMA IF EXISTS "pelak" CASCADE;

-- ----------------------------------------------------------------------------
-- Recreate pelak schema
-- ----------------------------------------------------------------------------
CREATE SCHEMA "pelak";

-- Set pelak schema owner
ALTER SCHEMA "pelak" OWNER TO "pelak_admin";

-- Grant necessary permissions
GRANT USAGE ON SCHEMA "pelak" TO "pelak_admin";
GRANT ALL ON SCHEMA "pelak" TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Recreate project schema
-- ----------------------------------------------------------------------------
CREATE SCHEMA "project";

-- Set project schema owner
ALTER SCHEMA "project" OWNER TO "pelak_admin";

-- Grant necessary permissions
GRANT USAGE ON SCHEMA "project" TO "pelak_admin";
GRANT ALL ON SCHEMA "project" TO "pelak_admin";

-- ============================================================================
-- ✅ All schemas and data have been dropped and recreated!
-- ============================================================================