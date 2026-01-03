-- ============================================================================
-- Migration Script: ایجاد جدول languages و اضافه کردن Foreign Key
-- توضیحات: این اسکریپت جدول languages را ایجاد می‌کند، داده‌های اولیه را درج می‌کند
-- و Foreign Key constraint را به جدول page اضافه می‌کند
-- 
-- نحوه اجرا:
--   psql -U htni_admin -d your_database -f migrate_add_language_table.sql
-- 
-- توجه: این اسکریپت باید بعد از اجرای schema files اجرا شود
-- ============================================================================

\echo '============================================================================'
\echo 'شروع Migration: ایجاد جدول languages و اضافه کردن Foreign Key...'
\echo '============================================================================'

-- ============================================================================
-- مرحله 1: ایجاد Sequence (اگر وجود ندارد)
-- ============================================================================
\echo ''
\echo '--- ایجاد Sequence برای languages ---'

CREATE SEQUENCE IF NOT EXISTS "pelak"."languages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."languages_id_seq" OWNER TO "htni_admin";

-- ============================================================================
-- مرحله 2: ایجاد جدول languages
-- ============================================================================
\echo ''
\echo '--- ایجاد جدول languages ---'

CREATE TABLE IF NOT EXISTS "pelak"."languages" (
  -- شناسه یکتای زبان (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".languages_id_seq'::regclass),
  
  -- کد زبان (مثلاً fa, en) - Unique
  "code" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- عنوان زبان
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- توضیحات زبان
  "description" text COLLATE "pg_catalog"."default",
  
  -- شماره ترتیب برای مرتب‌سازی
  "num" int4,
  
  -- وضعیت فعال/غیرفعال بودن زبان (Default: true)
  "is_active" bool DEFAULT true,
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "languages_pkey" PRIMARY KEY ("id"),
  
  -- Unique Constraint: هر کد زبان فقط یک بار می‌تواند وجود داشته باشد
  CONSTRAINT "languages_code_key" UNIQUE ("code")
);

ALTER TABLE "pelak"."languages" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع زبان‌های فعال
CREATE INDEX IF NOT EXISTS "idx_languages_is_active" ON "pelak"."languages" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع بر اساس کد زبان
CREATE INDEX IF NOT EXISTS "idx_languages_code" ON "pelak"."languages" USING btree (
  "code" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ============================================================================
-- مرحله 3: درج داده‌های اولیه
-- ============================================================================
\echo ''
\echo '--- درج داده‌های اولیه (فارسی و انگلیسی) ---'

-- درج زبان فارسی (id=1)
INSERT INTO "pelak"."languages" (id, code, title, description, num, is_active, created_at, updated_at)
VALUES (
  1,
  'fa',
  'فارسی',
  'زبان فارسی',
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  num = EXCLUDED.num,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- درج زبان انگلیسی (id=2)
INSERT INTO "pelak"."languages" (id, code, title, description, num, is_active, created_at, updated_at)
VALUES (
  2,
  'en',
  'English',
  'English language',
  2,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  num = EXCLUDED.num,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- مرحله 4: به‌روزرسانی Sequence
-- ============================================================================
\echo ''
\echo '--- به‌روزرسانی Sequence ---'

DO $$
DECLARE
  v_max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM pelak.languages;
  IF v_max_id > 0 THEN
    PERFORM setval('pelak.languages_id_seq', v_max_id);
    RAISE NOTICE 'Sequence languages_id_seq به % تنظیم شد.', v_max_id;
  END IF;
END $$;

-- ============================================================================
-- مرحله 5: تبدیل مقادیر قدیمی lang (اگر 0 یا مقادیر نامعتبر وجود دارد)
-- ============================================================================
\echo ''
\echo '--- بررسی و تبدیل مقادیر قدیمی lang ---'

-- تبدیل 0 به 1 (فارسی) - در صورت وجود
UPDATE pelak.page
SET lang = 1
WHERE lang = 0;

-- تبدیل مقادیر نامعتبر (NULL یا مقادیر غیر از 1 و 2) به NULL
-- این کار برای جلوگیری از خطا در Foreign Key constraint
UPDATE pelak.page
SET lang = NULL
WHERE lang IS NOT NULL AND lang NOT IN (1, 2);

-- ============================================================================
-- مرحله 6: اضافه کردن Foreign Key constraint
-- ============================================================================
\echo ''
\echo '--- اضافه کردن Foreign Key constraint به page.lang ---'

-- حذف constraint قبلی اگر وجود دارد
ALTER TABLE "pelak"."page" 
  DROP CONSTRAINT IF EXISTS "page_lang_fkey";

-- اضافه کردن Foreign Key constraint جدید
ALTER TABLE "pelak"."page"
  ADD CONSTRAINT "page_lang_fkey" 
  FOREIGN KEY ("lang") 
  REFERENCES "pelak"."languages" ("id") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

\echo ''
\echo '============================================================================'
\echo 'Migration با موفقیت انجام شد!'
\echo '============================================================================'
\echo ''
\echo 'خلاصه تغییرات:'
\echo '  1. جدول languages ایجاد شد'
\echo '  2. داده‌های اولیه درج شدند (fa=1, en=2)'
\echo '  3. Foreign Key constraint به page.lang اضافه شد'
\echo '  4. مقادیر قدیمی lang تبدیل شدند (0 → 1)'
\echo ''
\echo 'توجه: لطفاً داده‌های موجود را بررسی کنید و در صورت نیاز:'
\echo '  1. مقادیر lang در جدول page را بررسی کنید'
\echo '  2. اگر زبان‌های دیگری نیاز دارید، آن‌ها را به جدول languages اضافه کنید'
\echo '============================================================================'

