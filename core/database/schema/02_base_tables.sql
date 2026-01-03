-- ============================================================================
-- ماژول: جداول پایه
-- توضیحات: جداول پایه سیستم شامل selectortype و selector
-- این جداول باید قبل از جداول دیگر ساخته شوند چون سایر جداول به آن‌ها وابسته هستند
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول: selectortype
-- توضیحات: انواع سلکتور (مثل دسته‌بندی‌ها، تگ‌ها، و غیره)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."selectortype" (
  -- شناسه یکتای نوع سلکتور (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".selectortype_id_seq'::regclass),
  
  -- عنوان نوع سلکتور
  "title" varchar(50) COLLATE "pg_catalog"."default",
  
  -- کد کوتاه نوع سلکتور (2 کاراکتر)
  "code" varchar(2) COLLATE "pg_catalog"."default",
  
  -- Primary Key
  CONSTRAINT "selectortype_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pelak"."selectortype" 
  OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- جدول: selector
-- توضیحات: سلکتورها با قابلیت سلسله مراتبی
-- هر سلکتور می‌تواند والد (selectorid) داشته باشد برای ساختار درختی
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."selector" (
  -- شناسه یکتای سلکتور (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".selector_id_seq'::regclass),
  
  -- عنوان سلکتور
  "title" varchar(120) COLLATE "pg_catalog"."default",
  
  -- نوع سلکتور (Foreign Key → selectortype.id)
  "type" int4,
  
  -- شناسه سلکتور والد (Foreign Key → selector.id)
  -- NULL = این سلکتور root است (بدون والد)
  "selectorid" int4,
  
  -- متن توضیحات اضافی
  "txt" text COLLATE "pg_catalog"."default",
  
  -- شماره ترتیب برای مرتب‌سازی
  "num" int4,
  
  -- Primary Key
  CONSTRAINT "selector_pkey" PRIMARY KEY ("id"),
  
  -- Foreign Key: سلکتور والد (CASCADE در صورت حذف)
  CONSTRAINT "selector_selectorid_fkey" FOREIGN KEY ("selectorid") REFERENCES "pelak"."selector" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: نوع سلکتور (CASCADE در صورت حذف)
  CONSTRAINT "selector_type_fkey" FOREIGN KEY ("type") REFERENCES "pelak"."selectortype" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "pelak"."selector" 
  OWNER TO "htni_admin";

