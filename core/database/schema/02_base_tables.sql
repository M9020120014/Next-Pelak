-- ============================================================================
-- ماژول: جداول پایه
-- توضیحات: جداول پایه سیستم شامل roles, profile_images, page_sections, page_types, languages
-- این جداول باید قبل از جداول دیگر ساخته شوند چون سایر جداول به آن‌ها وابسته هستند
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول: roles
-- توضیحات: نقش‌های کاربران سیستم
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."roles" (
  -- شناسه یکتای نقش (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".roles_id_seq'::regclass),
  
  -- عنوان نقش
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- توضیحات نقش
  "description" text COLLATE "pg_catalog"."default",
  
  -- شماره ترتیب برای مرتب‌سازی
  "num" int4,
  
  -- وضعیت فعال/غیرفعال بودن نقش (Default: true)
  "is_active" bool DEFAULT true,
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pelak"."roles" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع نقش‌های فعال
CREATE INDEX "idx_roles_is_active" ON "pelak"."roles" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- جدول: profile_images
-- توضیحات: تصاویر پروفایل پیش‌فرض برای کاربران
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."profile_images" (
  -- شناسه یکتای تصویر (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".profile_images_id_seq'::regclass),
  
  -- عنوان تصویر
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- توضیحات تصویر
  "description" text COLLATE "pg_catalog"."default",
  
  -- URL یا مسیر تصویر
  "image_url" text COLLATE "pg_catalog"."default",
  
  -- شماره ترتیب برای مرتب‌سازی
  "num" int4,
  
  -- وضعیت فعال/غیرفعال بودن تصویر (Default: true)
  "is_active" bool DEFAULT true,
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "profile_images_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pelak"."profile_images" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع تصاویر فعال
CREATE INDEX "idx_profile_images_is_active" ON "pelak"."profile_images" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- جدول: page_sections
-- توضیحات: بخش‌های صفحات سایت (دسته‌بندی صفحات)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."page_sections" (
  -- شناسه یکتای بخش (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".page_sections_id_seq'::regclass),
  
  -- عنوان بخش
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- توضیحات بخش
  "description" text COLLATE "pg_catalog"."default",
  
  -- شماره ترتیب برای مرتب‌سازی
  "num" int4,
  
  -- وضعیت فعال/غیرفعال بودن بخش (Default: true)
  "is_active" bool DEFAULT true,
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pelak"."page_sections" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع بخش‌های فعال
CREATE INDEX "idx_page_sections_is_active" ON "pelak"."page_sections" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- جدول: page_types
-- توضیحات: انواع صفحات سایت (مقاله، خبر، و غیره)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."page_types" (
  -- شناسه یکتای نوع صفحه (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".page_types_id_seq'::regclass),
  
  -- عنوان نوع صفحه
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- توضیحات نوع صفحه
  "description" text COLLATE "pg_catalog"."default",
  
  -- شماره ترتیب برای مرتب‌سازی
  "num" int4,
  
  -- وضعیت فعال/غیرفعال بودن نوع صفحه (Default: true)
  "is_active" bool DEFAULT true,
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "page_types_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pelak"."page_types" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع انواع صفحات فعال
CREATE INDEX "idx_page_types_is_active" ON "pelak"."page_types" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- جدول: languages
-- توضیحات: زبان‌های سیستم (فارسی، انگلیسی و غیره)
-- ----------------------------------------------------------------------------
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
CREATE INDEX "idx_languages_is_active" ON "pelak"."languages" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع بر اساس کد زبان
CREATE INDEX "idx_languages_code" ON "pelak"."languages" USING btree (
  "code" "pg_catalog"."text_ops" ASC NULLS LAST
);

