-- ============================================================================
-- ماژول: احراز هویت و مدیریت کاربران
-- توضیحات: جداول مربوط به کاربران و مدیریت توکن‌های احراز هویت
-- این جداول به roles و profile_images وابسته هستند و باید بعد از آن‌ها ساخته شوند
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول: users
-- توضیحات: اطلاعات کاربران سیستم
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."users" (
  -- شناسه یکتای کاربر (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".users_id_seq'::regclass),
  
  -- شماره موبایل کاربر (Unique, Not Null) - برای ورود و احراز هویت
  "mobile" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- رمز عبور hash شده با bcrypt (Not Null)
  -- مقدار 'hasNoPassword' برای کاربرانی که هنوز رمز عبور تنظیم نکرده‌اند
  "userpassword" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- نام کاربر
  "firstname" varchar(50) COLLATE "pg_catalog"."default",
  
  -- نام خانوادگی کاربر
  "lastname" varchar(50) COLLATE "pg_catalog"."default",
  
  -- تاریخ ثبت‌نام (Default: زمان فعلی)
  "register_date" timestamptz(6) DEFAULT now(),
  
  -- آخرین زمان ورود موفق
  "last_login" timestamptz(6),
  
  -- تعداد تلاش‌های ناموفق برای ورود (Default: 0)
  -- بعد از 5 تلاش ناموفق، حساب قفل می‌شود
  "failed_attempt" int4 DEFAULT 0,
  
  -- وضعیت فعال/غیرفعال بودن حساب (Default: true)
  "is_active" bool DEFAULT true,
  
  -- آدرس ایمیل کاربر (اختیاری)
  "email" varchar(100) COLLATE "pg_catalog"."default",
  
  -- کلید مخفی OTP برای تایید (موقت، فقط در فرآیند ثبت‌نام)
  -- بعد از تنظیم رمز عبور null می‌شود
  "otp_secret" varchar(32) COLLATE "pg_catalog"."default",
  
  -- زمان آخرین تغییر رمز عبور (Default: زمان فعلی)
  "password_changed_at" timestamptz(6) DEFAULT now(),
  
  -- زمان قفل شدن حساب (NULL = قفل نیست)
  -- بعد از 5 تلاش ناموفق، به مدت 15 دقیقه قفل می‌شود
  "locked_until" timestamptz(6),
  
  -- زمان ایجاد رکورد (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین به‌روزرسانی (Default: زمان فعلی)
  "updated_at" timestamptz(6) DEFAULT now(),
  
  -- شناسه تصویر پروفایل از لیست تصاویر پیش‌فرض (Foreign Key → pelak.profile_images.id)
  -- تصویر از لیست تصاویر پیش‌فرض pelak انتخاب می‌شود
  "profile_image_id" int4,
  
  -- URL تصویر پروفایل از سامانه خارجی
  -- در صورت آپلود تصویر از سامانه دیگر، این فیلد پر می‌شود
  "profile_image_url" text COLLATE "pg_catalog"."default",
  
  -- شناسه نقش کاربر (Foreign Key → pelak.roles.id)
  -- نقش از جدول roles انتخاب می‌شود
  "role_id" int4,
  
  -- Primary Key
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  
  -- Unique Constraint: هر شماره موبایل فقط یک بار می‌تواند ثبت شود
  CONSTRAINT "users_mobile_key" UNIQUE ("mobile"),
  
  -- Foreign Key: تصویر پروفایل از جدول profile_images (SET NULL در صورت حذف)
  CONSTRAINT "users_profile_image_id_fkey" FOREIGN KEY ("profile_image_id") REFERENCES "pelak"."profile_images" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: نقش کاربر از جدول roles (SET NULL در صورت حذف)
  CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "pelak"."roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Constraint: فقط یکی از profile_image_id یا profile_image_url باید مقدار داشته باشد
  CONSTRAINT "users_profile_image_check" CHECK (
    (profile_image_id IS NULL AND profile_image_url IS NOT NULL) OR
    (profile_image_id IS NOT NULL AND profile_image_url IS NULL) OR
    (profile_image_id IS NULL AND profile_image_url IS NULL)
  )
);

ALTER TABLE "pelak"."users" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع کاربران فعال
CREATE INDEX "idx_users_is_active" ON "pelak"."users" USING btree (
  "is_active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Unique Index برای جستجوی سریع بر اساس شماره موبایل
CREATE UNIQUE INDEX "idx_users_mobile" ON "pelak"."users" USING btree (
  "mobile" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع بر اساس تصویر پروفایل
CREATE INDEX "idx_users_profile_image_id" ON "pelak"."users" USING btree (
  "profile_image_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع بر اساس نقش کاربر
CREATE INDEX "idx_users_role_id" ON "pelak"."users" USING btree (
  "role_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- جدول: refresh_tokens
-- توضیحات: فقط توکن‌های فعال (expires_at > NOW() و revoked_at IS NULL)
-- این جدول برای عملکرد بهتر فقط توکن‌های فعال را نگه می‌دارد
-- توکن‌های منقضی یا لغو شده به جدول تاریخچه منتقل می‌شوند
-- ----------------------------------------------------------------------------
CREATE TABLE "pelak"."refresh_tokens" (
  -- شناسه یکتای توکن (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".refresh_tokens_id_seq'::regclass),
  
  -- Hash شده توکن با SHA-256 (Unique, Not Null)
  -- توکن plain text هرگز در دیتابیس ذخیره نمی‌شود
  "token_hash" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- شناسه کاربر صاحب توکن (Foreign Key → users.id)
  "user_id" int4 NOT NULL,
  
  -- شناسه یکتای دستگاه (مثل fingerprint مرورگر)
  -- هر کاربر می‌تواند چندین توکن فعال برای دستگاه‌های مختلف داشته باشد
  "idevice" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- زمان انقضای توکن (Not Null)
  -- معمولاً 7 روز از زمان ایجاد
  "expires_at" timestamptz(6) NOT NULL,
  
  -- زمان ایجاد توکن (Default: زمان فعلی)
  "created_at" timestamptz(6) DEFAULT now(),
  
  -- زمان لغو توکن (NULL = فعال است)
  -- در صورت logout یا rotation، این فیلد set می‌شود
  "revoked_at" timestamptz(6),
  
  -- آخرین زمان استفاده از توکن
  -- در هر refresh، این فیلد به‌روزرسانی می‌شود
  "last_used_at" timestamptz(6),
  
  -- آخرین IP استفاده شده (inet type)
  -- برای audit و تشخیص فعالیت مشکوک
  "last_used_ip" inet,
  
  -- Primary Key
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
  
  -- Foreign Key: حذف cascade در صورت حذف کاربر
  CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pelak"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  
  -- Unique Constraint: هر hash توکن فقط یک بار می‌تواند وجود داشته باشد
  CONSTRAINT "refresh_tokens_token_hash_key" UNIQUE ("token_hash")
);

ALTER TABLE "pelak"."refresh_tokens" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع توکن‌های منقضی شده
CREATE INDEX "idx_refresh_tokens_expires_at" ON "pelak"."refresh_tokens" USING btree (
  "expires_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- Unique Index برای جستجوی سریع بر اساس hash توکن
CREATE INDEX "idx_refresh_tokens_token_hash" ON "pelak"."refresh_tokens" USING btree (
  "token_hash" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- Index برای جستجوی توکن‌های یک کاربر
CREATE INDEX "idx_refresh_tokens_user_id" ON "pelak"."refresh_tokens" USING btree (
  "user_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- جدول: refresh_tokens_history
-- توضیحات: تاریخچه تمام توکن‌های منقضی شده یا حذف شده
-- این جدول برای audit، امنیت و نگهداری تاریخچه استفاده می‌شود
-- ----------------------------------------------------------------------------
CREATE TABLE "pelak"."refresh_tokens_history" (
  -- شناسه یکتای توکن (از جدول اصلی)
  -- Primary Key اما نه Auto Increment (از جدول اصلی کپی می‌شود)
  "id" int4 NOT NULL,
  
  -- Hash شده توکن
  "token_hash" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- شناسه کاربر
  "user_id" int4 NOT NULL,
  
  -- شناسه دستگاه
  "idevice" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- زمان انقضای توکن
  "expires_at" timestamptz(6) NOT NULL,
  
  -- زمان ایجاد توکن (از جدول اصلی)
  "created_at" timestamptz(6) NOT NULL,
  
  -- زمان لغو توکن (NULL = منقضی شده)
  -- اگر توسط کاربر logout شده باشد، این فیلد set می‌شود
  "revoked_at" timestamptz(6),
  
  -- آخرین زمان استفاده
  "last_used_at" timestamptz(6),
  
  -- آخرین IP استفاده شده
  "last_used_ip" inet,
  
  -- زمان انتقال به تاریخچه (Default: زمان فعلی)
  -- تفاوت بین revoked_at و archived_at:
  -- - revoked_at: زمان لغو توکن توسط کاربر (logout)
  -- - archived_at: زمان انتقال به تاریخچه (می‌تواند منقضی شده یا لغو شده باشد)
  "archived_at" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "refresh_tokens_history_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "pelak"."refresh_tokens_history" 
  OWNER TO "htni_admin";

-- Index برای جستجوی تاریخچه بر اساس زمان بایگانی
CREATE INDEX "idx_refresh_tokens_history_archived_at" ON "pelak"."refresh_tokens_history" USING btree (
  "archived_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- Index برای جستجوی تاریخچه بر اساس زمان انقضا
CREATE INDEX "idx_refresh_tokens_history_expires_at" ON "pelak"."refresh_tokens_history" USING btree (
  "expires_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- Index برای جستجوی تاریخچه یک کاربر
CREATE INDEX "idx_refresh_tokens_history_user_id" ON "pelak"."refresh_tokens_history" USING btree (
  "user_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

