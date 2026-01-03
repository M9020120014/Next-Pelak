-- ============================================================================
-- ماژول: جداول پروژه (شمای htni)
-- توضیحات: جداول مخصوص پروژه شامل سلکتورها و اطلاعات تکمیلی کاربران
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول: selectortype (پروژه)
-- توضیحات: انواع سلکتور مخصوص پروژه (مثل استان، شهر، مدرک تحصیلی و غیره)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "htni"."selectortype" (
  -- شناسه یکتای نوع سلکتور (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"htni".selectortype_id_seq'::regclass),
  
  -- عنوان نوع سلکتور
  "title" varchar(50) COLLATE "pg_catalog"."default",
  
  -- کد کوتاه نوع سلکتور (2 کاراکتر)
  "code" varchar(2) COLLATE "pg_catalog"."default",
  
  -- Primary Key
  CONSTRAINT "selectortype_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "htni"."selectortype" 
  OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- جدول: selector (پروژه)
-- توضیحات: سلکتورها با قابلیت سلسله مراتبی مخصوص پروژه
-- هر سلکتور می‌تواند والد (selectorid) داشته باشد برای ساختار درختی
-- مثال: استان → شهر، مدرک تحصیلی → رشته تحصیلی
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "htni"."selector" (
  -- شناسه یکتای سلکتور (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"htni".selector_id_seq'::regclass),
  
  -- عنوان سلکتور
  "title" varchar(120) COLLATE "pg_catalog"."default",
  
  -- نوع سلکتور (Foreign Key → htni.selectortype.id)
  "type" int4,
  
  -- شناسه سلکتور والد (Foreign Key → htni.selector.id)
  -- NULL = این سلکتور root است (بدون والد)
  "selectorid" int4,
  
  -- متن توضیحات اضافی
  "txt" text COLLATE "pg_catalog"."default",
  
  -- شماره ترتیب برای مرتب‌سازی
  "num" int4,
  
  -- Primary Key
  CONSTRAINT "selector_pkey" PRIMARY KEY ("id"),
  
  -- Foreign Key: سلکتور والد (CASCADE در صورت حذف)
  CONSTRAINT "selector_selectorid_fkey" FOREIGN KEY ("selectorid") REFERENCES "htni"."selector" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: نوع سلکتور (CASCADE در صورت حذف)
  CONSTRAINT "selector_type_fkey" FOREIGN KEY ("type") REFERENCES "htni"."selectortype" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "htni"."selector" 
  OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- جدول: user_additional_info
-- توضیحات: اطلاعات تکمیلی کاربران مخصوص این پروژه
-- این جدول به ازای هر کاربر یک رکورد دارد (one-to-one با users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "htni"."user_additional_info" (
  -- شناسه کاربر (Primary Key, Foreign Key → pelak.users.id)
  -- استفاده از user_id به عنوان Primary Key برای تضمین یکتایی
  "user_id" int4 NOT NULL,
  
  -- کد ملی کاربر
  "nationalcode" char(10) COLLATE "pg_catalog"."default",
  
  -- تاریخ تولد (فرمت: YYYY-MM-DD)
  "birthday" varchar(10) COLLATE "pg_catalog"."default",
  
  -- وضعیت تاهل (true = متاهل, false = مجرد)
  "married" bool,
  
  -- جنسیت (true = مرد, false = زن)
  "gender" bool,
  
  -- شناسه کشور (Foreign Key → htni.selector.id)
  -- پیش‌فرض: 80001 (ایران)
  "countryid" int4 DEFAULT 80001,
  
  -- شناسه استان (Foreign Key → htni.selector.id)
  "provinceid" int4,
  
  -- شناسه شهر (Foreign Key → htni.selector.id)
  "cityid" int4,
  
  -- آدرس محل سکونت
  "address" text COLLATE "pg_catalog"."default",
  
  -- شغل
  "job" text COLLATE "pg_catalog"."default",
  
  -- مهارت‌ها
  "skills" text COLLATE "pg_catalog"."default",
  
  -- گرایش سیاسی
  "political" text COLLATE "pg_catalog"."default",
  
  -- انگیزه
  "motivation" text COLLATE "pg_catalog"."default",
  
  -- نحوه آشنایی
  "howknown" varchar(150) COLLATE "pg_catalog"."default",
  
  -- نوع همکاری
  "collaboration" varchar(100) COLLATE "pg_catalog"."default",
  
  -- شناسه مدرک تحصیلی (Foreign Key → htni.selector.id)
  "degreeid" int4,
  
  -- شناسه محل تحصیل (Foreign Key → htni.selector.id)
  "studyplaceid" int4,
  
  -- شناسه نوع محل تحصیل (Foreign Key → htni.selector.id)
  "studyplacetypeid" int4,
  
  -- شناسه رشته تحصیلی (Foreign Key → htni.selector.id)
  "studyfieldsid" int4,
  
  -- رضایت (Default: false)
  "consent" bool DEFAULT false,
  
  -- زمان تکمیل فرم (NULL = فرم تکمیل نشده)
  "formdone" timestamp(6),
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "user_additional_info_pkey" PRIMARY KEY ("user_id"),
  
  -- Foreign Key: کاربر (CASCADE در صورت حذف کاربر)
  CONSTRAINT "user_additional_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pelak"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: کشور (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "user_additional_info_countryid_fkey" FOREIGN KEY ("countryid") REFERENCES "htni"."selector" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: استان (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "user_additional_info_provinceid_fkey" FOREIGN KEY ("provinceid") REFERENCES "htni"."selector" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: شهر (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "user_additional_info_cityid_fkey" FOREIGN KEY ("cityid") REFERENCES "htni"."selector" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: مدرک تحصیلی (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "user_additional_info_degreeid_fkey" FOREIGN KEY ("degreeid") REFERENCES "htni"."selector" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: محل تحصیل (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "user_additional_info_studyplaceid_fkey" FOREIGN KEY ("studyplaceid") REFERENCES "htni"."selector" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: نوع محل تحصیل (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "user_additional_info_studyplacetypeid_fkey" FOREIGN KEY ("studyplacetypeid") REFERENCES "htni"."selector" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: رشته تحصیلی (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "user_additional_info_studyfieldsid_fkey" FOREIGN KEY ("studyfieldsid") REFERENCES "htni"."selector" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "htni"."user_additional_info" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع بر اساس کاربر (UNIQUE)
CREATE UNIQUE INDEX "idx_user_additional_info_user_id" ON "htni"."user_additional_info" USING btree (
  "user_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع بر اساس استان
CREATE INDEX "idx_user_additional_info_provinceid" ON "htni"."user_additional_info" USING btree (
  "provinceid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع بر اساس شهر
CREATE INDEX "idx_user_additional_info_cityid" ON "htni"."user_additional_info" USING btree (
  "cityid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

