-- ============================================================================
-- ماژول: توابع احراز هویت و مدیریت کاربران
-- توضیحات: توابع مربوط به ثبت‌نام، ورود، مدیریت توکن‌ها و امنیت
-- ============================================================================

-- ----------------------------------------------------------------------------
-- تابع: auth_register_user
-- توضیحات: ثبت کاربر جدید یا به‌روزرسانی OTP secret برای کاربر موجود
-- 
-- پارامترها:
--   p_mobile: شماره موبایل کاربر
--   p_otp_secret: کلید مخفی OTP برای تایید
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر با شماره موبایل داده شده
--   2. اگر کاربر وجود دارد: به‌روزرسانی otp_secret و بازگشت پیام
--   3. اگر کاربر وجود ندارد: ایجاد کاربر جدید با userpassword='hasNoPassword'
-- 
-- مقادیر بازگشتی:
--   موفق (کاربر جدید): {success: true, title: "User Created", message: "...", user_id: ...}
--   موفق (کاربر موجود): {success: true, title: "User Exists", message: "..."}
--   خطا: {success: false, title: "Registration Failed", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_register_user('09123456789', 'abc123xyz');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_register_user"("p_mobile" varchar, "p_otp_secret" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- چک وجود کاربر با این موبایل
  PERFORM id FROM pelak.users WHERE mobile = p_mobile;

  IF FOUND THEN
    -- به‌روزرسانی OTP secret برای کاربر موجود
    UPDATE pelak.users
    SET otp_secret = p_otp_secret
    WHERE mobile = p_mobile;
    
    RETURN json_build_object(
      'success', true,
      'title', 'User Exists',
      'message', 'کاربر قبلاً ثبت شده است.'
    );
  END IF;

  -- ساخت کاربر جدید (فقط با موبایل، بدون پسورد در این مرحله)
  INSERT INTO pelak.users (
    mobile, register_date, userpassword, otp_secret
  ) VALUES (
    p_mobile, NOW(), 'hasNoPassword', p_otp_secret
  ) RETURNING id INTO v_user_id;

  RETURN json_build_object(
    'success', true,
    'title', 'User Created',
    'message', 'کاربر با موفقیت ساخته شد.',
    'user_id', v_user_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Registration Failed',
    'message', 'خطا در ثبت کاربر. لطفاً دوباره تلاش کنید.'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- تابع: auth_set_password
-- توضیحات: تنظیم رمز عبور برای کاربری که OTP را تایید کرده است
-- 
-- پارامترها:
--   p_mobile: شماره موبایل کاربر
--   p_new_password: رمز عبور جدید (plain text)
--   p_otp_secret: کلید OTP برای تایید
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر با mobile و otp_secret
--   2. Hash کردن رمز عبور با bcrypt
--   3. به‌روزرسانی userpassword و null کردن otp_secret
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Password Updated", message: "..."}
--   خطا: {success: false, title: "User Not Found" | "Password Update Failed", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_set_password('09123456789', 'MySecurePassword123', 'abc123xyz');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_set_password"("p_mobile" varchar, "p_new_password" varchar, "p_otp_secret" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_hashed_password TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pelak.users WHERE mobile = p_mobile AND otp_secret = p_otp_secret) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل یافت نشد.'
    );
  END IF;

  -- Hash کردن رمز عبور با bcrypt
  v_hashed_password := crypt(p_new_password, gen_salt('bf'));

  UPDATE pelak.users
  SET userpassword = v_hashed_password,
      otp_secret = null,
      password_changed_at = NOW()
  WHERE mobile = p_mobile;

  RETURN json_build_object(
    'success', true,
    'title', 'Password Updated',
    'message', 'رمز عبور با موفقیت تغییر کرد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Password Update Failed',
    'message', 'خطا در تغییر رمز عبور.'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- تابع: auth_login
-- توضیحات: ورود کاربر به سیستم و ایجاد refresh token جدید
-- در صورت وجود توکن قدیمی برای همان دستگاه، آن را به تاریخچه منتقل می‌کند
-- 
-- پارامترها:
--   p_mobile: شماره موبایل کاربر
--   p_password: رمز عبور (plain text)
--   p_idevice: شناسه یکتای دستگاه
-- 
-- منطق کاری:
--   1. بررسی قفل بودن حساب (locked_until > NOW())
--   2. بررسی اعتبارات (mobile, password, is_active)
--   3. در صورت ورود ناموفق: افزایش failed_attempt و قفل بعد از 5 تلاش
--   4. در صورت ورود موفق: انتقال توکن قدیمی به تاریخچه و ایجاد توکن جدید
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Login Successful", user_id, mobile, firstname, lastname, refresh_token}
--   خطا: {success: false, title: "Account Locked" | "Login Failed" | "Login Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_login('09123456789', 'MyPassword123', 'device-fingerprint-123');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_login"(
  "p_mobile" varchar,
  "p_password" varchar,
  "p_idevice" text
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_user pelak.users%ROWTYPE;
  v_refresh_token TEXT;
  v_token_hash TEXT;
  v_old_token pelak.refresh_tokens%ROWTYPE;
BEGIN
  -- چک قفل بودن حساب
  IF EXISTS (
    SELECT 1 FROM pelak.users 
    WHERE mobile = p_mobile 
    AND locked_until IS NOT NULL 
    AND locked_until > NOW()
  ) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Account Locked',
      'message', 'حساب شما موقتاً قفل شده است. بعداً تلاش کنید.'
    );
  END IF;

  -- بررسی اعتبارات
  SELECT * INTO v_user
  FROM pelak.users
  WHERE mobile = p_mobile
    AND is_active = true
    AND userpassword != 'hasNoPassword'
    AND userpassword = crypt(p_password, userpassword);

  IF NOT FOUND THEN
    -- افزایش تلاش ناموفق (فقط اگر کاربر وجود داشته باشد)
    UPDATE pelak.users
    SET failed_attempt = failed_attempt + 1
    WHERE mobile = p_mobile;

    -- قفل بعد از ۵ تلاش ناموفق (15 دقیقه)
    UPDATE pelak.users
    SET locked_until = NOW() + INTERVAL '15 minutes'
    WHERE mobile = p_mobile
      AND failed_attempt + 1 >= 5;

    RETURN json_build_object(
      'success', false,
      'title', 'Login Failed',
      'message', 'شماره موبایل یا رمز عبور اشتباه است.'
    );
  END IF;

  -- موفقیت: ریست تلاش‌ها
  UPDATE pelak.users
  SET failed_attempt = 0, 
      last_login = NOW(),
      locked_until = NULL  -- باز کردن قفل احتمالی
  WHERE id = v_user.id;

  -- بررسی وجود توکن قدیمی برای همین user_id و idevice
  SELECT * INTO v_old_token
  FROM pelak.refresh_tokens
  WHERE user_id = v_user.id
    AND idevice = p_idevice
    AND expires_at > NOW()
    AND revoked_at IS NULL
  LIMIT 1;

  -- اگر توکن قدیمی وجود دارد، آن را به تاریخچه منتقل کن
  IF FOUND THEN
    INSERT INTO pelak.refresh_tokens_history (
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
    ) VALUES (
      v_old_token.id,
      v_old_token.token_hash,
      v_old_token.user_id,
      v_old_token.idevice,
      v_old_token.expires_at,
      v_old_token.created_at,
      NULL, -- revoked_at (چون login جدید است)
      v_old_token.last_used_at,
      v_old_token.last_used_ip,
      NOW()  -- archived_at
    );

    -- حذف توکن قدیمی
    DELETE FROM pelak.refresh_tokens WHERE id = v_old_token.id;
  END IF;

  -- ساخت refresh token جدید
  v_refresh_token := gen_random_uuid()::TEXT;
  v_token_hash := encode(digest(v_refresh_token, 'sha256'), 'hex');

  INSERT INTO pelak.refresh_tokens (token_hash, user_id, idevice, expires_at)
  VALUES (v_token_hash, v_user.id, p_idevice, NOW() + INTERVAL '7 days');

  RETURN json_build_object(
    'success', true,
    'title', 'Login Successful',
    'message', 'ورود با موفقیت انجام شد.',
    'user_id', v_user.id,
    'mobile', v_user.mobile,
    'firstname', v_user.firstname,
    'lastname', v_user.lastname,
    'profile_image_id', v_user.profile_image_id,
    'profile_image_url', v_user.profile_image_url,
    'role_id', v_user.role_id,
    'refresh_token', v_refresh_token
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Login Error',
    'message', 'خطای سرور در ورود.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: auth_refresh_token
-- توضیحات: تمدید refresh token و ایجاد توکن جدید (Token Rotation)
-- با ردیابی IP و انتقال توکن قدیمی به تاریخچه
-- 
-- پارامترها:
--   p_refresh_token: Refresh token فعلی (UUID)
--   p_idevice: شناسه یکتای دستگاه
--   p_ip: IP آدرس کاربر (اختیاری، می‌تواند 'unknown' باشد)
-- 
-- منطق کاری:
--   1. محاسبه hash توکن
--   2. بررسی اعتبار توکن
--   3. در صورت نامعتبر: حذف تمام توکن‌های کاربر (theft detection)
--   4. در صورت معتبر: انتقال توکن قدیمی به تاریخچه و ایجاد توکن جدید
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Token Refreshed", refresh_token, user_id, mobile, firstname, lastname, valid: true}
--   خطا: {success: false, title: "Invalid Token", message: "...", valid: false}
-- 
-- مثال استفاده:
--   SELECT auth_refresh_token('550e8400-e29b-41d4-a716-446655440000', 'device-1', '192.168.1.100');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_refresh_token"(
  "p_refresh_token" text,
  "p_idevice" text,
  "p_ip" text DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_token_hash TEXT;
  v_record pelak.refresh_tokens%ROWTYPE;
  v_new_token TEXT;
  v_new_hash TEXT;
  v_user_record pelak.users%ROWTYPE;
  v_ip_inet inet;
BEGIN
  -- محاسبه hash توکن
  v_token_hash := encode(digest(p_refresh_token, 'sha256'), 'hex');

  -- پیدا کردن توکن فعال
  SELECT * INTO v_record
  FROM pelak.refresh_tokens
  WHERE token_hash = v_token_hash
    AND idevice = p_idevice
    AND expires_at > NOW()
    AND revoked_at IS NULL;

  IF NOT FOUND THEN
    -- تشخیص theft: حذف همه توکن‌های کاربر
    DELETE FROM pelak.refresh_tokens
    WHERE user_id = (
      SELECT user_id FROM pelak.refresh_tokens 
      WHERE token_hash = v_token_hash LIMIT 1
    );

    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Token',
      'message', 'توکن نامعتبر یا منقضی شده است. لطفاً دوباره وارد شوید.',
      'valid', false
    );
  END IF;

  -- تبدیل IP به inet (اگر معتبر باشد)
  IF p_ip IS NOT NULL AND p_ip != 'unknown' THEN
    BEGIN
      v_ip_inet := p_ip::inet;
    EXCEPTION WHEN OTHERS THEN
      v_ip_inet := NULL;
    END;
  ELSE
    v_ip_inet := NULL;
  END IF;

  -- انتقال توکن قدیمی به تاریخچه (rotation)
  INSERT INTO pelak.refresh_tokens_history (
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
  ) VALUES (
    v_record.id,
    v_record.token_hash,
    v_record.user_id,
    v_record.idevice,
    v_record.expires_at,
    v_record.created_at,
    NULL, -- revoked_at (چون rotation است نه revoke)
    NOW(), -- last_used_at
    v_ip_inet, -- last_used_ip
    NOW()  -- archived_at
  );

  -- حذف توکن قدیمی از جدول فعال
  DELETE FROM pelak.refresh_tokens WHERE id = v_record.id;

  -- ساخت توکن جدید
  v_new_token := gen_random_uuid()::TEXT;
  v_new_hash := encode(digest(v_new_token, 'sha256'), 'hex');

  -- درج توکن جدید
  INSERT INTO pelak.refresh_tokens (
    token_hash, 
    user_id, 
    idevice, 
    expires_at,
    last_used_at,
    last_used_ip
  ) VALUES (
    v_new_hash, 
    v_record.user_id, 
    p_idevice, 
    NOW() + INTERVAL '7 days',
    NOW(),
    v_ip_inet
  );

  -- دریافت اطلاعات کاربر
  SELECT * INTO v_user_record
  FROM pelak.users
  WHERE id = v_record.user_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Token Refreshed',
    'message', 'توکن با موفقیت تمدید شد.',
    'refresh_token', v_new_token,
    'user_id', v_record.user_id,
    'mobile', v_user_record.mobile,
    'firstname', v_user_record.firstname,
    'lastname', v_user_record.lastname,
    'profile_image_id', v_user_record.profile_image_id,
    'profile_image_url', v_user_record.profile_image_url,
    'role_id', v_user_record.role_id,
    'valid', true
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: auth_revoke_token
-- توضیحات: انتقال refresh token از جدول فعال به تاریخچه هنگام logout
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
--   p_idevice: شناسه یکتای دستگاه
-- 
-- منطق کاری:
--   1. پیدا کردن refresh token فعال برای user_id و idevice
--   2. انتقال توکن به تاریخچه با revoked_at = NOW()
--   3. حذف توکن از جدول فعال
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Token Revoked", message: "..."}
--   خطا: {success: false, title: "Token Not Found" | "Revoke Failed", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_revoke_token(1, 'device-fingerprint-123');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_revoke_token"(
  "p_user_id" int4,
  "p_idevice" text
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_token_record pelak.refresh_tokens%ROWTYPE;
BEGIN
  -- پیدا کردن refresh token فعال برای این user_id و idevice
  SELECT * INTO v_token_record
  FROM pelak.refresh_tokens
  WHERE user_id = p_user_id
    AND idevice = p_idevice
    AND expires_at > NOW()
    AND revoked_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Token Not Found',
      'message', 'توکن فعالی برای این دستگاه یافت نشد.'
    );
  END IF;

  -- انتقال توکن به تاریخچه
  INSERT INTO pelak.refresh_tokens_history (
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
  ) VALUES (
    v_token_record.id,
    v_token_record.token_hash,
    v_token_record.user_id,
    v_token_record.idevice,
    v_token_record.expires_at,
    v_token_record.created_at,
    NOW(), -- revoked_at
    v_token_record.last_used_at,
    v_token_record.last_used_ip,
    NOW()  -- archived_at
  );

  -- حذف توکن از جدول فعال
  DELETE FROM pelak.refresh_tokens WHERE id = v_token_record.id;

  RETURN json_build_object(
    'success', true,
    'title', 'Token Revoked',
    'message', 'توکن با موفقیت لغو شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Revoke Failed',
    'message', 'خطا در لغو توکن. لطفاً دوباره تلاش کنید.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: auth_revoke_all_tokens
-- توضیحات: تمام توکن‌های فعال یک کاربر را لغو می‌کند (Logout از همه دستگاه‌ها)
-- 
-- پارامترها:
--   p_mobile: شماره موبایل کاربر
-- 
-- منطق کاری:
--   1. پیدا کردن user_id بر اساس شماره موبایل
--   2. حذف تمام refresh tokenهای این کاربر
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Logged Out Everywhere", message: "..."}
--   خطا: {success: false, title: "User Not Found" | "Revoke Failed", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_revoke_all_tokens('09123456789');
-- 
-- نکته: این تابع توکن‌ها را به تاریخچه منتقل نمی‌کند، فقط حذف می‌کند
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_revoke_all_tokens"("p_mobile" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- پیدا کردن user_id بر اساس موبایل
  SELECT id INTO v_user_id
  FROM pelak.users
  WHERE mobile = p_mobile;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل یافت نشد.'
    );
  END IF;

  -- حذف تمام refresh tokenهای این کاربر
  DELETE FROM pelak.refresh_tokens WHERE user_id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Logged Out Everywhere',
    'message', 'از تمام دستگاه‌ها با موفقیت خارج شدید.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Revoke Failed',
    'message', 'خطا در خروج از دستگاه‌ها. لطفاً دوباره تلاش کنید.'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- تابع: auth_check_idevice_refresh_token
-- توضیحات: بررسی وجود refresh token معتبر برای idevice
-- 
-- پارامترها:
--   p_idevice: شناسه یکتای دستگاه
-- 
-- منطق کاری:
--   1. بررسی وجود refresh token فعال برای این idevice
--   2. بازگشت وضعیت معتبر بودن
-- 
-- مقادیر بازگشتی:
--   معتبر: {success: true, valid: true, title: "Token Valid", message: "..."}
--   نامعتبر: {success: false, valid: false, title: "Token Not Found" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_check_idevice_refresh_token('device-fingerprint-123');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_check_idevice_refresh_token"("p_idevice" text)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_token_exists BOOLEAN;
BEGIN
  -- بررسی وجود refresh token فعال برای این idevice
  -- توجه: expires_at و NOW() هر دو timestamptz هستند، بنابراین مقایسه درست کار می‌کند
  -- اگر expires_at <= NOW() باشد، توکن منقضی شده و معتبر نیست
  SELECT EXISTS(
    SELECT 1 
    FROM pelak.refresh_tokens
    WHERE idevice = p_idevice
      AND expires_at > NOW()  -- بررسی انقضای توکن: باید در آینده باشد
      AND revoked_at IS NULL   -- بررسی لغو نشدن توکن
  ) INTO v_token_exists;

  IF v_token_exists THEN
    RETURN json_build_object(
      'success', true,
      'valid', true,
      'title', 'Token Valid',
      'message', 'توکن معتبر است.'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'valid', false,
      'title', 'Token Not Found',
      'message', 'توکن معتبری برای این دستگاه یافت نشد.'
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'valid', false,
    'title', 'Error',
    'message', 'خطا در بررسی توکن.'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- تابع: auth_cleanup_expired_tokens
-- توضیحات: انتقال توکن‌های منقضی شده به تاریخچه (برای اجرای دوره‌ای)
-- این تابع باید به صورت دوره‌ای اجرا شود (مثلاً هر ساعت)
-- 
-- پارامترها:
--   هیچ پارامتری ندارد
-- 
-- منطق کاری:
--   1. انتقال تمام توکن‌های منقضی شده به refresh_tokens_history
--   2. حذف توکن‌های منتقل شده از refresh_tokens
--   3. بازگشت تعداد توکن‌های منتقل شده
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Cleanup Completed", message: "...", moved_count: ...}
--   خطا: {success: false, title: "Cleanup Failed", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_cleanup_expired_tokens();
-- 
-- تنظیم Cron Job:
--   با pg_cron: SELECT cron.schedule('cleanup-expired-tokens', '0 * * * *', $$SELECT auth_cleanup_expired_tokens();$$);
--   یا با سیستم cron خارجی: 0 * * * * psql -U htni_admin -d dbname -c "SELECT auth_cleanup_expired_tokens();"
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_cleanup_expired_tokens"()
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_moved_count INTEGER := 0;
BEGIN
  -- انتقال تمام توکن‌های منقضی شده به تاریخچه
  WITH moved_tokens AS (
    INSERT INTO pelak.refresh_tokens_history (
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
      NOW() -- archived_at
    FROM pelak.refresh_tokens
    WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_moved_count FROM moved_tokens;

  -- حذف توکن‌های منتقل شده از جدول فعال
  DELETE FROM pelak.refresh_tokens
  WHERE expires_at < NOW();

  RETURN json_build_object(
    'success', true,
    'title', 'Cleanup Completed',
    'message', format('تعداد %s توکن منقضی شده به تاریخچه منتقل شد.', v_moved_count),
    'moved_count', v_moved_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Cleanup Failed',
    'message', 'خطا در پاکسازی توکن‌های منقضی شده.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: user_update_name
-- توضیحات: ویرایش نام و نام خانوادگی کاربر
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
--   p_firstname: نام جدید (nullable)
--   p_lastname: نام خانوادگی جدید (nullable)
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر
--   2. به‌روزرسانی نام و نام خانوادگی
--   3. به‌روزرسانی updated_at
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Name Updated", message: "..."}
--   خطا: {success: false, title: "User Not Found" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT user_update_name(1, 'علی', 'احمدی');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."user_update_name"(
  "p_user_id" int4,
  "p_firstname" varchar DEFAULT NULL,
  "p_lastname" varchar DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
BEGIN
  -- بررسی وجود کاربر
  IF NOT EXISTS (SELECT 1 FROM pelak.users WHERE id = p_user_id AND is_active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربر یافت نشد یا غیرفعال است.'
    );
  END IF;

  -- به‌روزرسانی نام و نام خانوادگی
  UPDATE pelak.users
  SET firstname = COALESCE(p_firstname, firstname),
      lastname = COALESCE(p_lastname, lastname),
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Name Updated',
    'message', 'نام و نام خانوادگی با موفقیت به‌روزرسانی شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در به‌روزرسانی نام و نام خانوادگی.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: user_update_profile_image
-- توضیحات: ویرایش تصویر پروفایل کاربر
-- تصویر می‌تواند از لیست سلکتور pelak انتخاب شود یا از URL خارجی باشد
-- فقط یکی از profile_image_id یا profile_image_url باید مقدار داشته باشد
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
--   p_profile_image_id: شناسه تصویر از سلکتور pelak (nullable)
--   p_profile_image_url: URL تصویر از سامانه خارجی (nullable)
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر
--   2. اعتبارسنجی: فقط یکی از دو پارامتر باید مقدار داشته باشد
--   3. بررسی وجود selector در صورت استفاده از profile_image_id
--   4. به‌روزرسانی تصویر پروفایل
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Profile Image Updated", message: "..."}
--   خطا: {success: false, title: "User Not Found" | "Invalid Parameters" | "Selector Not Found" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT user_update_profile_image(1, 5, NULL); -- استفاده از selector
--   SELECT user_update_profile_image(1, NULL, 'https://example.com/image.jpg'); -- استفاده از URL
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."user_update_profile_image"(
  "p_user_id" int4,
  "p_profile_image_id" int4 DEFAULT NULL,
  "p_profile_image_url" text DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_both_null BOOLEAN;
  v_both_set BOOLEAN;
BEGIN
  -- بررسی وجود کاربر
  IF NOT EXISTS (SELECT 1 FROM pelak.users WHERE id = p_user_id AND is_active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربر یافت نشد یا غیرفعال است.'
    );
  END IF;

  -- بررسی اینکه هر دو null نباشند
  v_both_null := (p_profile_image_id IS NULL AND p_profile_image_url IS NULL);
  -- بررسی اینکه هر دو set نباشند
  v_both_set := (p_profile_image_id IS NOT NULL AND p_profile_image_url IS NOT NULL);

  IF v_both_null THEN
    -- اگر هر دو null باشند، تصویر را حذف می‌کنیم
    UPDATE pelak.users
    SET profile_image_id = NULL,
        profile_image_url = NULL,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN json_build_object(
      'success', true,
      'title', 'Profile Image Removed',
      'message', 'تصویر پروفایل با موفقیت حذف شد.'
    );
  END IF;

  IF v_both_set THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Parameters',
      'message', 'فقط یکی از profile_image_id یا profile_image_url باید مقدار داشته باشد.'
    );
  END IF;

  -- اگر از selector استفاده می‌شود، بررسی وجود آن
  IF p_profile_image_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pelak.selector WHERE id = p_profile_image_id) THEN
      RETURN json_build_object(
        'success', false,
        'title', 'Selector Not Found',
        'message', 'سلکتور تصویر پروفایل یافت نشد.'
      );
    END IF;

    -- به‌روزرسانی با selector
    UPDATE pelak.users
    SET profile_image_id = p_profile_image_id,
        profile_image_url = NULL,
        updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    -- به‌روزرسانی با URL
    UPDATE pelak.users
    SET profile_image_id = NULL,
        profile_image_url = p_profile_image_url,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Profile Image Updated',
    'message', 'تصویر پروفایل با موفقیت به‌روزرسانی شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در به‌روزرسانی تصویر پروفایل.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: user_get_display_name
-- توضیحات: دریافت نام نمایشی کاربر
-- اگر کاربر نام و نام خانوادگی نداشته باشد، "کاربر جدید {user_id}" برمی‌گرداند
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر
--   2. بررسی وجود نام و نام خانوادگی
--   3. بازگشت نام کامل یا "کاربر جدید {user_id}"
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, display_name: "..."}
--   خطا: {success: false, title: "User Not Found" | "Error", display_name: null}
-- 
-- مثال استفاده:
--   SELECT user_get_display_name(1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."user_get_display_name"("p_user_id" int4)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_firstname varchar(50);
  v_lastname varchar(50);
  v_display_name text;
BEGIN
  -- دریافت نام و نام خانوادگی کاربر
  SELECT firstname, lastname INTO v_firstname, v_lastname
  FROM pelak.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربر یافت نشد.',
      'display_name', NULL::text
    );
  END IF;

  -- ساخت نام نمایشی
  IF v_firstname IS NOT NULL AND v_firstname != '' AND v_lastname IS NOT NULL AND v_lastname != '' THEN
    v_display_name := v_firstname || ' ' || v_lastname;
  ELSIF v_firstname IS NOT NULL AND v_firstname != '' THEN
    v_display_name := v_firstname;
  ELSIF v_lastname IS NOT NULL AND v_lastname != '' THEN
    v_display_name := v_lastname;
  ELSE
    v_display_name := 'کاربر جدید ' || p_user_id::text;
  END IF;

  RETURN json_build_object(
    'success', true,
    'display_name', v_display_name
  );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Error',
      'message', 'خطا در دریافت نام نمایشی.',
      'display_name', NULL::text
    );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: auth_check_user_exists
-- توضیحات: بررسی وجود کاربر بر اساس شماره موبایل و وضعیت پسورد
-- 
-- پارامترها:
--   p_mobile: شماره موبایل کاربر
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر با شماره موبایل داده شده
--   2. بررسی اینکه آیا کاربر پسورد تنظیم کرده است یا نه
--   3. بازگشت وضعیت وجود کاربر و وضعیت پسورد
-- 
-- مقادیر بازگشتی:
--   کاربر موجود با پسورد: {success: true, exists: true, has_password: true}
--   کاربر موجود بدون پسورد: {success: true, exists: true, has_password: false}
--   کاربر وجود ندارد: {success: true, exists: false, has_password: false}
--   خطا: {success: false, title: "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT auth_check_user_exists('09123456789');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."auth_check_user_exists"("p_mobile" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_user_exists BOOLEAN;
  v_has_password BOOLEAN;
BEGIN
  -- بررسی وجود کاربر و وضعیت پسورد
  SELECT EXISTS(
    SELECT 1 FROM pelak.users 
    WHERE mobile = p_mobile AND is_active = true
  ) INTO v_user_exists;

  IF v_user_exists THEN
    -- بررسی اینکه آیا کاربر پسورد تنظیم کرده است
    SELECT EXISTS(
      SELECT 1 FROM pelak.users 
      WHERE mobile = p_mobile 
        AND is_active = true
        AND userpassword != 'hasNoPassword'
        AND userpassword IS NOT NULL
    ) INTO v_has_password;

    RETURN json_build_object(
      'success', true,
      'exists', true,
      'has_password', v_has_password
    );
  ELSE
    RETURN json_build_object(
      'success', true,
      'exists', false,
      'has_password', false
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در بررسی وجود کاربر.',
    'exists', false,
    'has_password', false
  );
END;
$BODY$
  LANGUAGE plpgsql STABLE SECURITY DEFINER
  COST 100;

