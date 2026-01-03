-- ============================================================================
-- ماژول: نظرات و تعاملات
-- توضیحات: جداول مربوط به نظرات صفحات و لایک‌ها
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول: comments
-- توضیحات: نظرات صفحات با ساختار درختی (هر نظر می‌تواند پاسخ داشته باشد)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."comments" (
  -- شناسه یکتای نظر (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".comments_id_seq'::regclass),
  
  -- شناسه کاربر نویسنده نظر (Foreign Key → users.id, Not Null)
  "userid" int4 NOT NULL,
  
  -- شناسه صفحه مربوطه (Foreign Key → page.id)
  "pageid" int4,
  
  -- شناسه نظر والد (Foreign Key → comments.id)
  -- NULL = این نظر root است (پاسخ به نظر دیگر نیست)
  "parentid" int4,
  
  -- محتوای نظر (Not Null)
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- وضعیت تایید نظر (Default: false)
  -- false = در انتظار تایید ادمین
  -- true = تایید شده و قابل نمایش
  "isapproved" bool DEFAULT false,
  
  -- وضعیت حذف منطقی (Default: false)
  -- true = حذف شده (soft delete)
  -- false = فعال
  "isdeleted" bool DEFAULT false,
  
  -- زمان ایجاد نظر (Default: زمان فعلی)
  "createdat" timestamptz(6) DEFAULT now(),
  
  -- زمان آخرین ویرایش (Default: زمان فعلی)
  "updatedat" timestamptz(6) DEFAULT now(),
  
  -- میزان اهمیت نظر (0-100)
  -- برای مرتب‌سازی و نمایش اولویت‌دار
  -- Default: 0
  "importance" int4 DEFAULT 0,
  
  -- Primary Key
  CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
  
  -- Foreign Key: صفحه مربوطه (CASCADE در صورت حذف صفحه)
  CONSTRAINT "comments_pageid_fkey" FOREIGN KEY ("pageid") REFERENCES "pelak"."page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: نظر والد (CASCADE در صورت حذف نظر والد)
  CONSTRAINT "comments_parentid_fkey" FOREIGN KEY ("parentid") REFERENCES "pelak"."comments" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  
  -- Foreign Key: کاربر نویسنده (CASCADE در صورت حذف کاربر)
  CONSTRAINT "comments_userid_fkey" FOREIGN KEY ("userid") REFERENCES "pelak"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Constraint: محدود کردن importance به 0-100
  CONSTRAINT "comments_importance_check" CHECK ("importance" >= 0 AND "importance" <= 100)
);

ALTER TABLE "pelak"."comments" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع نظرات یک صفحه
CREATE INDEX "idx_comments_pageid" ON "pelak"."comments" USING btree (
  "pageid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع نظرات یک کاربر
CREATE INDEX "idx_comments_userid" ON "pelak"."comments" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع پاسخ‌های یک نظر
CREATE INDEX "idx_comments_parentid" ON "pelak"."comments" USING btree (
  "parentid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع نظرات تایید شده
CREATE INDEX "idx_comments_isapproved" ON "pelak"."comments" USING btree (
  "isapproved" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع نظرات حذف نشده
CREATE INDEX "idx_comments_isdeleted" ON "pelak"."comments" USING btree (
  "isdeleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Index برای مرتب‌سازی سریع‌تر بر اساس importance
CREATE INDEX IF NOT EXISTS "idx_comments_importance" ON "pelak"."comments" USING btree (
  "importance" "pg_catalog"."int4_ops" DESC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- جدول: comment_likes
-- توضیحات: لایک‌های کاربران برای کامنت‌ها
-- هر کاربر فقط یک بار می‌تواند یک کامنت را لایک کند
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."comment_likes" (
  -- شناسه یکتای لایک (Primary Key, Auto Increment)
  "id" int4 NOT NULL DEFAULT nextval('"pelak".comment_likes_id_seq'::regclass),
  
  -- شناسه کاربر لایک کننده (Foreign Key → users.id, Not Null)
  "userid" int4 NOT NULL,
  
  -- شناسه کامنت لایک شده (Foreign Key → comments.id, Not Null)
  "commentid" int4 NOT NULL,
  
  -- زمان ایجاد لایک (Default: زمان فعلی)
  "createdat" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id"),
  
  -- Foreign Key: کاربر لایک کننده (CASCADE در صورت حذف کاربر)
  CONSTRAINT "comment_likes_userid_fkey" FOREIGN KEY ("userid") REFERENCES "pelak"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: کامنت لایک شده (CASCADE در صورت حذف کامنت)
  CONSTRAINT "comment_likes_commentid_fkey" FOREIGN KEY ("commentid") REFERENCES "pelak"."comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Unique Constraint: هر کاربر فقط یک بار می‌تواند یک کامنت را لایک کند
  CONSTRAINT "comment_likes_user_comment_unique" UNIQUE ("userid", "commentid")
);

ALTER TABLE "pelak"."comment_likes" 
  OWNER TO "htni_admin";

-- Index برای جستجوی سریع لایک‌های یک کاربر
CREATE INDEX "idx_comment_likes_userid" ON "pelak"."comment_likes" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index برای جستجوی سریع لایک‌های یک کامنت
CREATE INDEX "idx_comment_likes_commentid" ON "pelak"."comment_likes" USING btree (
  "commentid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Composite Index برای جستجوی سریع لایک یک کاربر برای یک کامنت خاص
CREATE INDEX "idx_comment_likes_user_comment" ON "pelak"."comment_likes" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST,
  "commentid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

