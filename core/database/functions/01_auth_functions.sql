-- ============================================================================
-- Module: Authentication and User Management Functions
-- Description: Functions related to registration, login, token management and security
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_register
-- Description: Register a new user or update OTP secret for existing user
-- 
-- Parameters:
--   p_mobile: User mobile number
--   p_secret: OTP secret key for verification
-- 
-- Logic:
--   1. Check if user exists with the given mobile number
--   2. If user exists: Update otp_secret and return message
--   3. If user does not exist: Create new user with userpassword='hasNoPassword'
-- 
-- Returns:
--   Success (new user): {success: true, title: "User Created", message: "...", userid: ...}
--   Success (existing user): {success: true, title: "User Exists", message: "..."}
--   Error: {success: false, title: "Registration Failed", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_register('09123456789', 'abc123xyz');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_register"("p_mobile" varchar, "p_secret" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_userid INTEGER;
  v_error_message TEXT;
BEGIN
  -- Check if user exists with this mobile number
  PERFORM userid FROM pelak.user WHERE mobile = p_mobile;

  IF FOUND THEN
    -- Update OTP secret for existing user
    UPDATE pelak.user
    SET otpsecret = p_secret
    WHERE mobile = p_mobile;
    
    RETURN json_build_object(
      'success', true,
      'title', 'User Exists',
      'message', 'شماره موبایل تایید شد'
    );
  END IF;

  -- Create new user (only with mobile, no password at this stage)
  BEGIN
    INSERT INTO pelak.user (
      mobile, register, userpassword, otpsecret
    ) VALUES (
      p_mobile, NOW(), 'hasNoPassword', p_secret
    ) RETURNING userid INTO v_userid;

    -- Create record in useradditionalinfo with new userid
    -- Only set userid (exactly the same userid from pelak.user)
    -- Other fields use DEFAULT values or are NULL to be filled later
    -- Use ON CONFLICT to ensure no error if record exists
    BEGIN
      INSERT INTO project.useradditionalinfo (
        userid
      ) VALUES (
        v_userid
      )
      ON CONFLICT (userid) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- If error occurs creating additional_info record, log it but user is created
      -- This error should not cause the entire operation to fail
      v_error_message := SQLERRM;
      -- You can log here or save error message
    END;

    RETURN json_build_object(
      'success', true,
      'title', 'User Created',
      'message', 'شماره موبایل تایید شد',
      'userid', v_userid
    );

  EXCEPTION WHEN OTHERS THEN
    -- Error creating user - this is a serious error
    v_error_message := SQLERRM;
    RETURN json_build_object(
      'success', false,
      'title', 'Registration Failed',
      'message', 'خطا در ثبت کاربر : ' || v_error_message,
      'error_code', SQLSTATE
    );
  END;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_password
-- Description: Set password for user who has verified OTP
-- 
-- Parameters:
--   p_mobile: User mobile number
--   p_password: New password (plain text)
--   p_secret: OTP key for verification
-- 
-- Logic:
--   1. Check if user exists with mobile and otp_secret
--   2. Hash password with bcrypt
--   3. Update userpassword and nullify otp_secret
-- 
-- Returns:
--   Success: {success: true, title: "Password Updated", message: "..."}
--   Error: {success: false, title: "User Not Found" | "Password Update Failed", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_password('09123456789', 'MySecurePassword123', 'abc123xyz');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_password"("p_mobile" varchar, "p_password" varchar, "p_secret" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_hashed_password TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE mobile = p_mobile AND otpsecret = p_secret) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل پیدا نشد'
    );
  END IF;

  -- Hash password with bcrypt
  v_hashed_password := crypt(p_password, gen_salt('bf'));

  UPDATE pelak.user
  SET userpassword = v_hashed_password,
      otpsecret = null,
      passwordchanged = NOW()
  WHERE mobile = p_mobile;

  RETURN json_build_object(
    'success', true,
    'title', 'Password Updated',
    'message', 'رمز عبور تغییر کرد'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Password Update Failed',
    'message', 'خطا در تغییر رمز عبور'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_login
-- Description: User login to system and create new refresh token
-- If old token exists for same device, moves it to history
-- 
-- Parameters:
--   p_mobile: User mobile number
--   p_password: Password (plain text)
--   p_idevice: Unique device identifier
-- 
-- Logic:
--   1. Check if account is locked (locked_until > NOW())
--   2. Verify credentials (mobile, password, is_active)
--   3. On failed login: Increment failed_attempt and lock after 5 attempts
--   4. On successful login: Move old token to history and create new token
-- 
-- Returns:
--   Success: {success: true, title: "Login Successful", userid, mobile, firstname, lastname, refreshtoken}
--   Error: {success: false, title: "Account Locked" | "Login Failed" | "Login Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_login('09123456789', 'MyPassword123', 'device-fingerprint-123');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_login"(
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
  v_user pelak.user%ROWTYPE;
  v_refreshtoken TEXT;
  v_token_hash TEXT;
  v_old_token pelak.refreshtoken%ROWTYPE;
BEGIN
  -- Check if account is locked
  IF EXISTS (
    SELECT 1 FROM pelak.user 
    WHERE mobile = p_mobile 
    AND lockeduntil IS NOT NULL 
    AND lockeduntil > NOW()
  ) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Account Locked',
      'message', 'حساب شما موقتاً قفل شده است. بعداً تلاش کنید'
    );
  END IF;

  -- Verify credentials
  SELECT * INTO v_user
  FROM pelak.user
  WHERE mobile = p_mobile
    AND active = true
    AND userpassword != 'hasNoPassword'
    AND userpassword = crypt(p_password, userpassword);

  IF NOT FOUND THEN
    -- Increment failed attempts (only if user exists)
    UPDATE pelak.user
    SET failedattempt = failedattempt + 1
    WHERE mobile = p_mobile;

    -- Lock after 5 failed attempts (15 minutes)
    UPDATE pelak.user
    SET lockeduntil = NOW() + INTERVAL '15 minutes'
    WHERE mobile = p_mobile
      AND failedattempt + 1 >= 5;

    RETURN json_build_object(
      'success', false,
      'title', 'Login Failed',
      'message', 'شماره موبایل یا رمز عبور اشتباه است'
    );
  END IF;

  -- Success: Reset attempts
  UPDATE pelak.user
  SET failedattempt = 0, 
      lastlogin = NOW(),
      lockeduntil = NULL  -- Unlock if locked
  WHERE userid = v_user.userid;

  -- Check for old token for same userid and idevice
  SELECT * INTO v_old_token
  FROM pelak.refreshtoken
  WHERE userid = v_user.userid
    AND idevice = p_idevice
    AND expiresat > NOW()
    AND revokedat IS NULL
  LIMIT 1;

  -- If old token exists, move it to history
  IF FOUND THEN
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
    ) VALUES (
      v_old_token.refreshtokenid,
      v_old_token.tokenhash,
      v_old_token.userid,
      v_old_token.idevice,
      v_old_token.expiresat,
      v_old_token.created,
      NULL, -- revokedat (because this is a new login)
      v_old_token.lastusedat,
      v_old_token.lastusedip,
      NOW()  -- archivedat
    );

    -- Delete old token
    DELETE FROM pelak.refreshtoken WHERE refreshtokenid = v_old_token.refreshtokenid;
  END IF;

  -- Create new refresh token
  v_refreshtoken := gen_random_uuid()::TEXT;
  v_token_hash := encode(digest(v_refreshtoken, 'sha256'), 'hex');

  INSERT INTO pelak.refreshtoken (tokenhash, userid, idevice, expiresat)
  VALUES (v_token_hash, v_user.userid, p_idevice, NOW() + INTERVAL '7 days');

  RETURN json_build_object(
    'success', true,
    'title', 'Login Successful',
    'message', 'Login successful.',
    'userid', v_user.userid,
    'mobile', v_user.mobile,
    'firstname', v_user.firstname,
    'lastname', v_user.lastname,
    'email', v_user.email,
    'profileimage', v_user.profileimageid,
    'profileurl', v_user.profileimageurl,
    'roleid', v_user.roleid,
    'refreshtoken', v_refreshtoken
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Login Error',
    'message', 'خطا در ورود به سیستم بعدا تلاش کنید'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_refreshtoken
-- Description: Refresh token renewal and create new token (Token Rotation)
-- With IP tracking and moving old token to history
-- 
-- Parameters:
--   p_refreshtoken: Current refresh token (UUID)
--   p_idevice: Unique device identifier
--   p_ip: User IP address (optional, can be 'unknown')
-- 
-- Logic:
--   1. Calculate token hash
--   2. Verify token validity
--   3. If invalid: Delete all user tokens (theft detection)
--   4. If valid: Move old token to history and create new token
-- 
-- Returns:
--   Success: {success: true, title: "Token Refreshed", refreshtoken, userid, mobile, firstname, lastname, valid: true}
--   Error: {success: false, title: "Invalid Token", message: "...", valid: false}
-- 
-- Usage Example:
--   SELECT pelak_auth_refreshtoken('550e8400-e29b-41d4-a716-446655440000', 'device-1', '192.168.1.100');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_refreshtoken"(
  "p_refreshtoken" text,
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
  v_record pelak.refreshtoken%ROWTYPE;
  v_new_token TEXT;
  v_new_hash TEXT;
  v_user_record pelak.user%ROWTYPE;
  v_ip_inet inet;
BEGIN
  -- Calculate token hash
  v_token_hash := encode(digest(p_refreshtoken, 'sha256'), 'hex');

  -- Find active token
  SELECT * INTO v_record
  FROM pelak.refreshtoken
  WHERE tokenhash = v_token_hash
    AND idevice = p_idevice
    AND expiresat > NOW()
    AND revokedat IS NULL;

  IF NOT FOUND THEN
    -- Detect theft: Delete all user tokens
    DELETE FROM pelak.refreshtoken
    WHERE userid = (
      SELECT userid FROM pelak.refreshtoken 
      WHERE tokenhash = v_token_hash LIMIT 1
    );

    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Token',
      'message', 'توکن معتبر نیست یا منقضی شده است. لطفا دوباره وارد شوید',
      'valid', false
    );
  END IF;

  -- Convert IP to inet (if valid)
  IF p_ip IS NOT NULL AND p_ip != 'unknown' THEN
    BEGIN
      v_ip_inet := p_ip::inet;
    EXCEPTION WHEN OTHERS THEN
      v_ip_inet := NULL;
    END;
  ELSE
    v_ip_inet := NULL;
  END IF;

  -- Move old token to history (rotation)
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
  ) VALUES (
    v_record.refreshtokenid,
    v_record.tokenhash,
    v_record.userid,
    v_record.idevice,
    v_record.expiresat,
    v_record.created,
    NULL, -- revokedat (because this is rotation, not revoke)
    NOW(), -- lastusedat
    v_ip_inet, -- lastusedip
    NOW()  -- archivedat
  );

  -- Delete old token from active table
  DELETE FROM pelak.refreshtoken WHERE refreshtokenid = v_record.refreshtokenid;

  -- Create new token
  v_new_token := gen_random_uuid()::TEXT;
  v_new_hash := encode(digest(v_new_token, 'sha256'), 'hex');

  -- Insert new token
  INSERT INTO pelak.refreshtoken (
    tokenhash, 
    userid, 
    idevice, 
    expiresat,
    lastusedat,
    lastusedip
  ) VALUES (
    v_new_hash, 
    v_record.userid, 
    p_idevice, 
    NOW() + INTERVAL '7 days',
    NOW(),
    v_ip_inet
  );

  -- Get user information
  SELECT * INTO v_user_record
  FROM pelak.user
  WHERE userid = v_record.userid;

  RETURN json_build_object(
    'success', true,
    'title', 'Token Refreshed',
    'message', 'Token refreshed successfully.',
    'refreshtoken', v_new_token,
    'userid', v_record.userid,
    'mobile', v_user_record.mobile,
    'firstname', v_user_record.firstname,
    'lastname', v_user_record.lastname,
    'email', v_user_record.email,
    'profileimage', v_user_record.profileimageid,
    'profileurl', v_user_record.profileimageurl,
    'roleid', v_user_record.roleid,
    'valid', true
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_revoketoken
-- Description: Move refresh token from active table to history on logout
-- 
-- Parameters:
--   p_userid: User identifier
--   p_idevice: Unique device identifier
-- 
-- Logic:
--   1. Find active refresh token for userid and idevice
--   2. Move token to history with revoked_at = NOW()
--   3. Delete token from active table
-- 
-- Returns:
--   Success: {success: true, title: "Token Revoked", message: "..."}
--   Error: {success: false, title: "Token Not Found" | "Revoke Failed", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_revoketoken(1, 'device-fingerprint-123');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_revoketoken"(
  "p_userid" int4,
  "p_idevice" text
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_token_record pelak.refreshtoken%ROWTYPE;
BEGIN
  -- Find active refresh token for this userid and idevice
  SELECT * INTO v_token_record
  FROM pelak.refreshtoken
  WHERE userid = p_userid
    AND idevice = p_idevice
    AND expiresat > NOW()
    AND revokedat IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Token Not Found',
      'message', 'توکن فعالی برای این دستگاه پیدا نشد'
    );
  END IF;

  -- Move token to history
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
  ) VALUES (
    v_token_record.refreshtokenid,
    v_token_record.tokenhash,
    v_token_record.userid,
    v_token_record.idevice,
    v_token_record.expiresat,
    v_token_record.created,
    NOW(), -- revokedat
    v_token_record.lastusedat,
    v_token_record.lastusedip,
    NOW()  -- archivedat
  );

  -- Delete token from active table
  DELETE FROM pelak.refreshtoken WHERE refreshtokenid = v_token_record.refreshtokenid;

  RETURN json_build_object(
    'success', true,
    'title', 'Token Revoked',
    'message', 'توکن لغو شد'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Revoke Failed',
    'message', 'خطا در لغو توکن. بعدا تلاش کنید'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_revokeall
-- Description: Revoke all active tokens for a user (Logout from all devices)
-- 
-- Parameters:
--   p_mobile: User mobile number
-- 
-- Logic:
--   1. Find userid based on mobile number
--   2. Delete all refresh tokens for this user
-- 
-- Returns:
--   Success: {success: true, title: "Logged Out Everywhere", message: "..."}
--   Error: {success: false, title: "User Not Found" | "Revoke Failed", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_revokeall('09123456789');
-- 
-- Note: This function does not move tokens to history, only deletes them
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_revokeall"("p_mobile" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_userid INTEGER;
BEGIN
  -- Find userid based on mobile
  SELECT userid INTO v_userid
  FROM pelak.user
  WHERE mobile = p_mobile;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل پیدا نشد'
    );
  END IF;

  -- Delete all refresh tokens for this user
  DELETE FROM pelak.refreshtoken WHERE userid = v_userid;

  RETURN json_build_object(
    'success', true,
    'title', 'Logged Out Everywhere',
    'message', 'از تمام دستگاه‌ها با موفقیت خارج شدید'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Revoke Failed',
    'message', 'خطا در خروج از دستگاه‌ها. بعدا تلاش کنید'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_checkrefreshtoken
-- Description: Check if a valid refresh token exists for idevice
-- 
-- Parameters:
--   p_idevice: Unique device identifier
-- 
-- Logic:
--   1. Check if active refresh token exists for this idevice
--   2. Return validation status
-- 
-- Returns:
--   Valid: {success: true, valid: true, title: "Token Valid", message: "..."}
--   Invalid: {success: false, valid: false, title: "Token Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_checkrefreshtoken('device-fingerprint-123');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_checkrefreshtoken"("p_idevice" text)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_token_exists BOOLEAN;
BEGIN
  -- Check if active refresh token exists for this idevice
  -- Note: expiresat and NOW() are both timestamptz, so comparison works correctly
  -- If expiresat <= NOW(), token is expired and invalid
  SELECT EXISTS(
    SELECT 1 
    FROM pelak.refreshtoken
    WHERE idevice = p_idevice
      AND expiresat > NOW()  -- Check token expiration: must be in future
      AND revokedat IS NULL   -- Check token not revoked
  ) INTO v_token_exists;

  IF v_token_exists THEN
    RETURN json_build_object(
      'success', true,
      'valid', true,
      'title', 'Token Valid',
      'message', 'توکن معتبر است'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'valid', false,
      'title', 'Token Not Found',
      'message', 'توکن معتبری برای این دستگاه پیدا نشد'
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'valid', false,
    'title', 'Error',
    'message', 'خطا در بررسی توکن. بعدا تلاش کنید'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_checkrefreshtoken_mobile
-- Description: Check if a valid refresh token exists for a user by mobile number
-- 
-- Parameters:
--   p_mobile: User mobile number
-- 
-- Logic:
--   1. Find user by mobile number
--   2. Check if user has any active refresh tokens
--   3. Return validation status
-- 
-- Returns:
--   Valid: {success: true, valid: true, title: "Token Valid", message: "..."}
--   Invalid: {success: false, valid: false, title: "User Not Found" | "Token Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_checkrefreshtoken_mobile('09123456789');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_checkrefreshtoken_mobile"("p_mobile" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_userid INTEGER;
  v_token_exists BOOLEAN;
BEGIN
  -- Find user by mobile number
  SELECT userid INTO v_userid
  FROM pelak.user
  WHERE mobile = p_mobile AND active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'valid', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل پیدا نشد'
    );
  END IF;

  -- Check if user has any active refresh tokens
  SELECT EXISTS(
    SELECT 1 
    FROM pelak.refreshtoken
    WHERE userid = v_userid
      AND expiresat > NOW()
      AND revokedat IS NULL
  ) INTO v_token_exists;

  IF v_token_exists THEN
    RETURN json_build_object(
      'success', true,
      'valid', true,
      'title', 'Token Valid',
      'message', 'توکن معتبری برای این کاربر پیدا شد'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'valid', false,
      'title', 'Token Not Found',
      'message', 'توکن معتبری برای این کاربر پیدا نشد'
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'valid', false,
    'title', 'Error',
    'message', 'خطا در بررسی توکن. بعدا تلاش کنید'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_checkrefreshtoken_device_mobile
-- Description: Check if a valid refresh token exists for a user by device ID and mobile number
-- 
-- Parameters:
--   p_idevice: Unique device identifier
--   p_mobile: User mobile number
-- 
-- Logic:
--   1. Find user by mobile number
--   2. Check if user has an active refresh token for the specified device
--   3. Return validation status
-- 
-- Returns:
--   Valid: {success: true, valid: true, title: "Token Valid", message: "..."}
--   Invalid: {success: false, valid: false, title: "User Not Found" | "Token Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_checkrefreshtoken_device_mobile('device-fingerprint-123', '09123456789');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_checkrefreshtoken_device_mobile"(
  "p_idevice" text,
  "p_mobile" varchar
)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_userid INTEGER;
  v_token_exists BOOLEAN;
BEGIN
  -- Find user by mobile number
  SELECT userid INTO v_userid
  FROM pelak.user
  WHERE mobile = p_mobile AND active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'valid', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل پیدا نشد'
    );
  END IF;

  -- Check if user has an active refresh token for the specified device
  SELECT EXISTS(
    SELECT 1 
    FROM pelak.refreshtoken
    WHERE userid = v_userid
      AND idevice = p_idevice
      AND expiresat > NOW()
      AND revokedat IS NULL
  ) INTO v_token_exists;

  IF v_token_exists THEN
    RETURN json_build_object(
      'success', true,
      'valid', true,
      'title', 'Token Valid',
      'message', 'توکن معتبری برای این کاربر و دستگاه پیدا شد'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'valid', false,
      'title', 'Token Not Found',
      'message', 'توکن معتبری برای این کاربر و دستگاه پیدا نشد'
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'valid', false,
    'title', 'Error',
    'message', 'خطا در بررسی توکن. بعدا تلاش کنید'
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- Function: pelak_user_updatename
-- Description: Update user first name and last name
-- 
-- Parameters:
--   p_userid: User identifier
--   p_firstname: New first name (nullable)
--   p_lastname: New last name (nullable)
-- 
-- Logic:
--   1. Check if user exists
--   2. Update first name and last name
--   3. Update updated_at
-- 
-- Returns:
--   Success: {success: true, title: "Name Updated", message: "..."}
--   Error: {success: false, title: "User Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_user_updatename(1, 'Ali', 'Ahmadi');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_user_updatename"(
  "p_userid" int4,
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
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل پیدا نشد'
    );
  END IF;

  -- Update first name and last name
  UPDATE pelak.user
  SET firstname = COALESCE(p_firstname, firstname),
      lastname = COALESCE(p_lastname, lastname),
      updated = NOW()
  WHERE userid = p_userid;

  RETURN json_build_object(
    'success', true,
    'title', 'Name Updated',
    'message', 'نام و نام خانوادگی با موفقیت تغییر کرد'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در تغییر نام و نام خانوادگی. بعدا تلاش کنید'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_user_updateprofile
-- Description: Update user profile image
-- Image can be selected from pelak default image list or from external URL
-- Both profileimage and profileurl fields can have values simultaneously
-- Display priority: profileurl > profileimage > default image
-- 
-- Parameters:
--   p_userid: User identifier
--   p_profileimage: Image identifier from pelak profile_images table (nullable)
--   p_profileurl: Image URL from external system (nullable)
-- 
-- Logic:
--   1. Check if user exists
--   2. Check if image exists in profile_images table if using profileimage
--   3. Update profile image (can update both fields)
-- 
-- Returns:
--   Success: {success: true, title: "Profile Image Updated", message: "..."}
--   Error: {success: false, title: "User Not Found" | "Profile Image Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_user_updateprofile(1, 5, NULL); -- Use default image
--   SELECT pelak_user_updateprofile(1, NULL, 'https://example.com/image.jpg'); -- Use URL
--   SELECT pelak_user_updateprofile(1, 5, 'https://example.com/image.jpg'); -- Use both
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_user_updateprofile"(
  "p_userid" int4,
  "p_profileimage" int4 DEFAULT NULL,
  "p_profileurl" text DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربری با این شماره موبایل پیدا نشد'
    );
  END IF;

  -- If profileimageid provided, check if it exists in userprofile table
  IF p_profileimage IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pelak.userprofile WHERE profileid = p_profileimage AND active = true) THEN
      RETURN json_build_object(
        'success', false,
        'title', 'Profile Image Not Found',
        'message', 'تصویر پروفایل انتخاب شده پیدا نشد'
      );
    END IF;
  END IF;

  -- Update fields
  -- If both are null, set both fields to null (remove image)
  -- If only one has value, update only that one and don't change the other
  -- If both have values, update both
  UPDATE pelak.user
  SET profileimageid = CASE 
      WHEN p_profileimage IS NOT NULL THEN p_profileimage
      WHEN p_profileimage IS NULL AND p_profileurl IS NULL THEN NULL
      ELSE profileimageid  -- If only profileimageurl provided, don't change profileimageid
    END,
    profileimageurl = CASE 
      WHEN p_profileurl IS NOT NULL THEN p_profileurl
      WHEN p_profileimage IS NULL AND p_profileurl IS NULL THEN NULL
      ELSE profileimageurl  -- If only profileimageid provided, don't change profileimageurl
    END,
    updated = NOW()
  WHERE userid = p_userid;

  RETURN json_build_object(
    'success', true,
    'title', 'Profile Image Updated',
    'message', 'تصویر پروفایل با موفقیت تغییر کرد'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در تغییر تصویر پروفایل. بعدا تلاش کنید'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_checkuser
-- Description: Check if user exists based on mobile number and password status
-- 
-- Parameters:
--   p_mobile: User mobile number
-- 
-- Logic:
--   1. Check if user exists with given mobile number
--   2. Check if user has set a password or not
--   3. Return user existence status and password status
-- 
-- Returns:
--   User exists with password: {success: true, exists: true, has_password: true}
--   User exists without password: {success: true, exists: true, has_password: false}
--   User does not exist: {success: true, exists: false, has_password: false}
--   Error: {success: false, title: "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_checkuser('09123456789');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_checkuser"("p_mobile" varchar)
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_user_exists BOOLEAN;
  v_has_password BOOLEAN;
BEGIN
  -- Check user existence and password status
  SELECT EXISTS(
    SELECT 1 FROM pelak.user 
    WHERE mobile = p_mobile AND active = true
  ) INTO v_user_exists;

  IF v_user_exists THEN
    -- Check if user has set a password
    SELECT EXISTS(
      SELECT 1 FROM pelak.user 
      WHERE mobile = p_mobile 
        AND active = true
        AND userpassword != 'hasNoPassword'
        AND userpassword IS NOT NULL
    ) INTO v_has_password;

    RETURN json_build_object(
      'success', true,
    'title', 'Error',
    'message', 'خطا در بررسی وجود کاربر. بعدا تلاش کنید',
      'exists', true,
      'has_password', v_has_password
    );
  ELSE
    RETURN json_build_object(
      'success', true,
    'title', 'Error',
    'message', 'خطا در بررسی وجود کاربر. بعدا تلاش کنید',
      'exists', false,
      'has_password', false
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در بررسی وجود کاربر. بعدا تلاش کنید',
    'exists', false,
    'has_password', false
  );
END;
$BODY$
  LANGUAGE plpgsql STABLE SECURITY DEFINER
  COST 100;

-- ----------------------------------------------------------------------------
-- Function: pelak_auth_archive_inactive_tokens
-- Description: Move expired or revoked refresh tokens from active table to history
-- This function can be called periodically (e.g., via cron job) to clean up inactive tokens
-- 
-- Parameters:
--   None
-- 
-- Logic:
--   1. Find all tokens that are expired (expiresat < NOW()) or revoked (revokedat IS NOT NULL)
--   2. Move them to refreshtokenhistory table
--   3. Delete them from refreshtoken table
--   4. Return count of archived tokens
-- 
-- Returns:
--   Success: {success: true, title: "Tokens Archived", message: "...", archived_count: ...}
--   Error: {success: false, title: "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_auth_archive_inactive_tokens();
-- 
-- Note: This function uses ON CONFLICT to prevent duplicate entries if run multiple times
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_auth_archive_inactive_tokens"()
  RETURNS "pg_catalog"."json" AS $BODY$
DECLARE
  v_archived_count INTEGER := 0;
BEGIN
  -- Move expired or revoked tokens to history
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

  -- Get count of archived tokens
  GET DIAGNOSTICS v_archived_count = ROW_COUNT;

  -- Delete archived tokens from active table
  DELETE FROM pelak.refreshtoken
  WHERE expiresat < NOW() OR revokedat IS NOT NULL;

  RETURN json_build_object(
    'success', true,
    'title', 'Tokens Archived',
    'message', 'توکن‌های غیرفعال به تاریخچه منتقل شد',
    'archived_count', v_archived_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در حذف توکن‌های غیرفعال: ' || SQLERRM
  );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER
  COST 100;

-- ============================================================================
-- ✅ All authentication functions have been created!
-- ============================================================================