-- ============================================================================
-- ماژول: توابع اطلاعات تکمیلی کاربر
-- توضیحات: توابع مربوط به تکمیل اطلاعات تکمیلی کاربر در 4 مرحله
-- ============================================================================

-- ----------------------------------------------------------------------------
-- تابع: user_additional_info_stage1
-- توضیحات: تکمیل مرحله 1 اطلاعات تکمیلی کاربر
-- مرحله 1 شامل: کد ملی، تاریخ تولد، جنسیت، وضعیت تاهل، کشور، استان، شهر
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
--   p_nationalcode: کد ملی (char(10))
--   p_birthday: تاریخ تولد (varchar(10))
--   p_gender: جنسیت (bool: true = مرد, false = زن)
--   p_married: وضعیت تاهل (bool: true = متاهل, false = مجرد)
--   p_countryid: شناسه کشور (int4, FK → htni.selector)
--   p_provinceid: شناسه استان (int4, FK → htni.selector)
--   p_cityid: شناسه شهر (int4, FK → htni.selector)
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر
--   2. بررسی وجود selectorها در صورت نیاز
--   3. ایجاد یا به‌روزرسانی رکورد اطلاعات تکمیلی
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Stage 1 Completed", message: "..."}
--   خطا: {success: false, title: "User Not Found" | "Selector Not Found" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT user_additional_info_stage1(1, '1234567890', '1990-01-01', true, false, 80001, 1, 5);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."user_additional_info_stage1"(
  "p_user_id" int4,
  "p_nationalcode" char(10) DEFAULT NULL,
  "p_birthday" varchar(10) DEFAULT NULL,
  "p_gender" bool DEFAULT NULL,
  "p_married" bool DEFAULT NULL,
  "p_countryid" int4 DEFAULT NULL,
  "p_provinceid" int4 DEFAULT NULL,
  "p_cityid" int4 DEFAULT NULL
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

  -- بررسی وجود selectorها در صورت نیاز
  IF p_countryid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM htni.selector WHERE id = p_countryid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'کشور انتخابی یافت نشد.'
    );
  END IF;

  IF p_provinceid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM htni.selector WHERE id = p_provinceid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'استان انتخابی یافت نشد.'
    );
  END IF;

  IF p_cityid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM htni.selector WHERE id = p_cityid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'شهر انتخابی یافت نشد.'
    );
  END IF;

  -- ایجاد یا به‌روزرسانی رکورد اطلاعات تکمیلی
  INSERT INTO htni.user_additional_info (
    user_id,
    nationalcode,
    birthday,
    gender,
    married,
    countryid,
    provinceid,
    cityid,
    updated_at
  ) VALUES (
    p_user_id,
    p_nationalcode,
    p_birthday,
    p_gender,
    p_married,
    COALESCE(p_countryid, 80001),
    p_provinceid,
    p_cityid,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nationalcode = COALESCE(EXCLUDED.nationalcode, htni.user_additional_info.nationalcode),
    birthday = COALESCE(EXCLUDED.birthday, htni.user_additional_info.birthday),
    gender = COALESCE(EXCLUDED.gender, htni.user_additional_info.gender),
    married = COALESCE(EXCLUDED.married, htni.user_additional_info.married),
    countryid = COALESCE(EXCLUDED.countryid, htni.user_additional_info.countryid),
    provinceid = COALESCE(EXCLUDED.provinceid, htni.user_additional_info.provinceid),
    cityid = COALESCE(EXCLUDED.cityid, htni.user_additional_info.cityid),
    updated_at = NOW();

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 1 Completed',
    'message', 'مرحله 1 اطلاعات تکمیلی با موفقیت ثبت شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در ثبت مرحله 1 اطلاعات تکمیلی.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: user_additional_info_stage2
-- توضیحات: تکمیل مرحله 2 اطلاعات تکمیلی کاربر
-- مرحله 2 شامل: شغل، انگیزه، نحوه آشنایی، نوع همکاری
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
--   p_job: شغل (text)
--   p_motivation: انگیزه (text)
--   p_howknown: نحوه آشنایی (varchar(150))
--   p_collaboration: نوع همکاری (varchar(100))
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر
--   2. بررسی وجود رکورد اطلاعات تکمیلی (باید مرحله 1 تکمیل شده باشد)
--   3. به‌روزرسانی فیلدهای مرحله 2
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Stage 2 Completed", message: "..."}
--   خطا: {success: false, title: "User Not Found" | "Stage 1 Not Completed" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT user_additional_info_stage2(1, 'مهندس نرم‌افزار', 'علاقه به سیاست', 'اینترنت', 'فعال');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."user_additional_info_stage2"(
  "p_user_id" int4,
  "p_job" text DEFAULT NULL,
  "p_motivation" text DEFAULT NULL,
  "p_howknown" varchar(150) DEFAULT NULL,
  "p_collaboration" varchar(100) DEFAULT NULL
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

  -- بررسی وجود رکورد اطلاعات تکمیلی
  IF NOT EXISTS (SELECT 1 FROM htni.user_additional_info WHERE user_id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Stage 1 Not Completed',
      'message', 'لطفاً ابتدا مرحله 1 را تکمیل کنید.'
    );
  END IF;

  -- به‌روزرسانی فیلدهای مرحله 2
  UPDATE htni.user_additional_info
  SET job = COALESCE(p_job, job),
      motivation = COALESCE(p_motivation, motivation),
      howknown = COALESCE(p_howknown, howknown),
      collaboration = COALESCE(p_collaboration, collaboration),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 2 Completed',
    'message', 'مرحله 2 اطلاعات تکمیلی با موفقیت ثبت شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در ثبت مرحله 2 اطلاعات تکمیلی.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: user_additional_info_stage3
-- توضیحات: تکمیل مرحله 3 اطلاعات تکمیلی کاربر
-- مرحله 3 شامل: مهارت‌ها، مدرک تحصیلی، نوع محل تحصیل، محل تحصیل، رشته تحصیلی
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
--   p_skills: مهارت‌ها (text)
--   p_degreeid: شناسه مدرک تحصیلی (int4, FK → htni.selector)
--   p_studyplacetypeid: شناسه نوع محل تحصیل (int4, FK → htni.selector)
--   p_studyplaceid: شناسه محل تحصیل (int4, FK → htni.selector)
--   p_studyfieldsid: شناسه رشته تحصیلی (int4, FK → htni.selector)
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر
--   2. بررسی وجود رکورد اطلاعات تکمیلی (باید مرحله 1 تکمیل شده باشد)
--   3. بررسی وجود selectorها در صورت نیاز
--   4. به‌روزرسانی فیلدهای مرحله 3
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Stage 3 Completed", message: "..."}
--   خطا: {success: false, title: "User Not Found" | "Stage 1 Not Completed" | "Selector Not Found" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT user_additional_info_stage3(1, 'برنامه‌نویسی، طراحی', 1, 2, 3, 4);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."user_additional_info_stage3"(
  "p_user_id" int4,
  "p_skills" text DEFAULT NULL,
  "p_degreeid" int4 DEFAULT NULL,
  "p_studyplacetypeid" int4 DEFAULT NULL,
  "p_studyplaceid" int4 DEFAULT NULL,
  "p_studyfieldsid" int4 DEFAULT NULL
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

  -- بررسی وجود رکورد اطلاعات تکمیلی
  IF NOT EXISTS (SELECT 1 FROM htni.user_additional_info WHERE user_id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Stage 1 Not Completed',
      'message', 'لطفاً ابتدا مرحله 1 را تکمیل کنید.'
    );
  END IF;

  -- بررسی وجود selectorها در صورت نیاز
  IF p_degreeid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM htni.selector WHERE id = p_degreeid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'مدرک تحصیلی انتخابی یافت نشد.'
    );
  END IF;

  IF p_studyplacetypeid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM htni.selector WHERE id = p_studyplacetypeid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'نوع محل تحصیل انتخابی یافت نشد.'
    );
  END IF;

  IF p_studyplaceid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM htni.selector WHERE id = p_studyplaceid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'محل تحصیل انتخابی یافت نشد.'
    );
  END IF;

  IF p_studyfieldsid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM htni.selector WHERE id = p_studyfieldsid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'رشته تحصیلی انتخابی یافت نشد.'
    );
  END IF;

  -- به‌روزرسانی فیلدهای مرحله 3
  UPDATE htni.user_additional_info
  SET skills = COALESCE(p_skills, skills),
      degreeid = COALESCE(p_degreeid, degreeid),
      studyplacetypeid = COALESCE(p_studyplacetypeid, studyplacetypeid),
      studyplaceid = COALESCE(p_studyplaceid, studyplaceid),
      studyfieldsid = COALESCE(p_studyfieldsid, studyfieldsid),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 3 Completed',
    'message', 'مرحله 3 اطلاعات تکمیلی با موفقیت ثبت شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در ثبت مرحله 3 اطلاعات تکمیلی.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: user_additional_info_stage4
-- توضیحات: تکمیل مرحله 4 اطلاعات تکمیلی کاربر (تایید نهایی)
-- مرحله 4 شامل: رضایت
-- با تایید این مرحله، formdone به NOW() تنظیم می‌شود
-- 
-- پارامترها:
--   p_user_id: شناسه کاربر
--   p_consent: رضایت (bool: true = راضی, false = راضی نیست)
-- 
-- منطق کاری:
--   1. بررسی وجود کاربر
--   2. بررسی وجود رکورد اطلاعات تکمیلی (باید مراحل قبلی تکمیل شده باشند)
--   3. به‌روزرسانی فیلد consent
--   4. در صورت consent = true، تنظیم formdone = NOW()
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Stage 4 Completed", message: "...", form_completed: true/false}
--   خطا: {success: false, title: "User Not Found" | "Stage 1 Not Completed" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT user_additional_info_stage4(1, true);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."user_additional_info_stage4"(
  "p_user_id" int4,
  "p_consent" bool DEFAULT false
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

  -- بررسی وجود رکورد اطلاعات تکمیلی
  IF NOT EXISTS (SELECT 1 FROM htni.user_additional_info WHERE user_id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Stage 1 Not Completed',
      'message', 'لطفاً ابتدا مرحله 1 را تکمیل کنید.'
    );
  END IF;

  -- به‌روزرسانی فیلد consent و formdone
  UPDATE htni.user_additional_info
  SET consent = p_consent,
      formdone = CASE WHEN p_consent = true THEN NOW() ELSE formdone END,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 4 Completed',
    'message', CASE WHEN p_consent = true THEN 'فرم با موفقیت تکمیل شد.' ELSE 'رضایت ثبت شد.' END,
    'form_completed', p_consent
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در ثبت مرحله 4 اطلاعات تکمیلی.'
  );
END;
$BODY$;

