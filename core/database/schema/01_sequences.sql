-- ============================================================================
-- ماژول: Sequences (مشترک)
-- توضیحات: تمام sequences مورد نیاز برای Auto Increment فیلدها
-- این فایل باید قبل از ساخت جداول اجرا شود
-- ============================================================================

-- ----------------------------------------------------------------------------
-- پاک کردن sequences موجود (اگر وجود دارند)
-- این کار برای reset کردن sequences در صورت نیاز انجام می‌شود
-- ----------------------------------------------------------------------------
DROP SEQUENCE IF EXISTS "pelak"."users_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."refresh_tokens_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."roles_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."profile_images_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."page_sections_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."page_types_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."languages_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."page_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."comments_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."comment_likes_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "htni"."selectortype_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "htni"."selector_id_seq" CASCADE;

-- ----------------------------------------------------------------------------
-- Sequence: users_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول users
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."users_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: refresh_tokens_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول refresh_tokens
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."refresh_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."refresh_tokens_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: roles_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول roles
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."roles_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: profile_images_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول profile_images
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."profile_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."profile_images_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: page_sections_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول page_sections
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."page_sections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."page_sections_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: page_types_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول page_types
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."page_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."page_types_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: languages_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول languages
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."languages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."languages_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: page_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول page
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."page_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."page_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: comments_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول comments
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."comments_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: comment_likes_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول comment_likes
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."comment_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."comment_likes_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: htni.selectortype_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول htni.selectortype
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "htni"."selectortype_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "htni"."selectortype_id_seq" OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Sequence: htni.selector_id_seq
-- توضیحات: برای Auto Increment فیلد id در جدول htni.selector
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "htni"."selector_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "htni"."selector_id_seq" OWNER TO "htni_admin";

