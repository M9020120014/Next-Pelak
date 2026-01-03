-- ============================================================================
-- ماژول: مدیریت محتوا
-- توضیحات: جداول مربوط به صفحات سایت
-- این جداول به users و selector وابسته هستند و باید بعد از آن‌ها ساخته شوند
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول: page
-- توضیحات: صفحات سایت
-- هر صفحه می‌تواند نویسنده، بخش و نوع داشته باشد
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."page" (
  -- شناسه یکتای صفحه (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".page_id_seq'::regclass),
  
  -- عنوان صفحه
  "title" varchar(200) COLLATE "pg_catalog"."default",
  
  -- توضیحات کوتاه صفحه (برای SEO و preview)
  "description" varchar(300) COLLATE "pg_catalog"."default",
  
  -- کلمات کلیدی (برای SEO)
  "keywords" varchar(100) COLLATE "pg_catalog"."default",
  
  -- محتوای کامل صفحه (HTML یا Markdown)
  "content" text COLLATE "pg_catalog"."default",
  
  -- لینک‌های رسانه (تصاویر، ویدیو و غیره) - JSON یا comma-separated
  "media" text COLLATE "pg_catalog"."default",
  
  -- URL یکتای صفحه (Unique, Not Null)
  -- برای دسترسی به صفحه از طریق URL
  "url" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- تاریخ انتشار
  "published_time" date,
  
  -- تاریخ آخرین ویرایش
  "modified_time" date,
  
  -- شناسه نویسنده (Foreign Key → users.id)
  "authors" int4,
  
  -- شناسه بخش (Foreign Key → selector.id)
  -- برای دسته‌بندی صفحات
  "section_id" int4,
  
  -- شناسه نوع صفحه (Foreign Key → selector.id)
  -- برای تفکیک انواع صفحات (مقاله، خبر، و غیره)
  "type_id" int4,
  
  -- تگ‌های صفحه (comma-separated)
  "tags" varchar(300) COLLATE "pg_catalog"."default",
  
  -- وضعیت صفحه (0 = پیش‌نویس, 1 = منتشر شده, 2 = بایگانی شده)
  "status" int2,
  
  -- زبان صفحه (0 = فارسی, 1 = انگلیسی, و غیره)
  "lang" int2,
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "page_pkey" PRIMARY KEY ("id"),
  
  -- Unique Constraint: هر URL فقط یک بار می‌تواند وجود داشته باشد
  CONSTRAINT "page_url_key" UNIQUE ("url"),
  
  -- Foreign Key: نویسنده (CASCADE در صورت حذف کاربر)
  CONSTRAINT "page_authors_fkey" FOREIGN KEY ("authors") REFERENCES "pelak"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: بخش (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "page_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "pelak"."selector" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: نوع صفحه (CASCADE در صورت حذف سلکتور)
  CONSTRAINT "page_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "pelak"."selector" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "pelak"."page" 
  OWNER TO "htni_admin";

