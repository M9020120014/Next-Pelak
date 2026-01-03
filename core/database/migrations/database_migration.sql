-- ============================================================================
-- Migration Script: Transfer expired/revoked tokens to history
-- ============================================================================
-- این اسکریپت توکن‌های منقضی شده یا revoked شده را از جدول فعال به تاریخچه منتقل می‌کند
-- قبل از اجرا، backup از دیتابیس بگیرید

-- بررسی تعداد توکن‌های منقضی شده
SELECT 
  COUNT(*) as expired_count,
  COUNT(CASE WHEN revoked_at IS NOT NULL THEN 1 END) as revoked_count
FROM auth.refresh_tokens
WHERE expires_at < NOW() OR revoked_at IS NOT NULL;

-- انتقال توکن‌های منقضی شده به تاریخچه
INSERT INTO auth.refresh_tokens_history (
  id, 
  token_hash, 
  user_id, 
  idevice, 
  expires_at, 
  created_at, 
  revoked_at, 
  last_used_at, 
  last_used_ip, 
  archived_at
)
SELECT 
  id, 
  token_hash, 
  user_id, 
  idevice, 
  expires_at,
  created_at, 
  revoked_at, 
  last_used_at, 
  last_used_ip, 
  NOW() as archived_at
FROM auth.refresh_tokens
WHERE expires_at < NOW() OR revoked_at IS NOT NULL
ON CONFLICT (id) DO NOTHING; -- جلوگیری از duplicate در صورت اجرای مجدد

-- حذف توکن‌های منتقل شده از جدول فعال
DELETE FROM auth.refresh_tokens
WHERE expires_at < NOW() OR revoked_at IS NOT NULL;

-- بررسی نتیجه
SELECT 
  COUNT(*) as active_tokens_count
FROM auth.refresh_tokens
WHERE expires_at > NOW() AND revoked_at IS NULL;

SELECT 
  COUNT(*) as history_tokens_count
FROM auth.refresh_tokens_history;

