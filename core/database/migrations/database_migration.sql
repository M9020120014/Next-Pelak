-- ============================================================================
-- Migration Script: Transfer expired/revoked tokens to history
-- ============================================================================
-- This script moves expired or revoked tokens from active table to history
-- Before execution, take a backup of the database

-- Check count of expired tokens
SELECT 
  COUNT(*) as expired_count,
  COUNT(CASE WHEN revokedat IS NOT NULL THEN 1 END) as revoked_count
FROM pelak.refreshtoken
WHERE expiresat < NOW() OR revokedat IS NOT NULL;

-- Move expired tokens to history
INSERT INTO pelak.refreshtokenhistory (
  refreshtokenhistoryid, 
  tokenhash, 
  userid, 
  idevice, 
  expiresat, 
  created, 
  revokedat, 
  lastusedat, 
  lastusedip, 
  archivedat
)
SELECT 
  refreshtokenid, 
  tokenhash, 
  userid, 
  idevice, 
  expiresat,
  created, 
  revokedat, 
  lastusedat, 
  lastusedip, 
  NOW() as archivedat
FROM pelak.refreshtoken
WHERE expiresat < NOW() OR revokedat IS NOT NULL
ON CONFLICT (refreshtokenhistoryid) DO NOTHING; -- Prevent duplicates if run multiple times

-- Delete moved tokens from active table
DELETE FROM pelak.refreshtoken
WHERE expiresat < NOW() OR revokedat IS NOT NULL;

-- Check result
SELECT 
  COUNT(*) as active_tokens_count
FROM pelak.refreshtoken
WHERE expiresat > NOW() AND revokedat IS NULL;

SELECT 
  COUNT(*) as history_tokens_count
FROM pelak.refreshtokenhistory;

