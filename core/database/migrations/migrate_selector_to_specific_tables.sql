-- ============================================================================
-- Migration Script: انتقال داده‌ها از selector و selectortype به جداول اختصاصی
-- توضیحات: این اسکریپت داده‌های موجود در pelak.selector و pelak.selectortype را
-- به جداول جدید (roles, profile_images, page_sections, page_types) منتقل می‌کند
-- 
-- نحوه اجرا:
--   psql -U htni_admin -d your_database -f migrate_selector_to_specific_tables.sql
-- 
-- توجه: این اسکریپت باید قبل از حذف جداول selector و selectortype اجرا شود
-- ============================================================================

\echo '============================================================================'
\echo 'شروع Migration: انتقال داده‌ها از selector به جداول اختصاصی...'
\echo '============================================================================'

-- ============================================================================
-- مرحله 1: انتقال نقش‌های کاربر (roles)
-- ============================================================================
\echo ''
\echo '--- انتقال نقش‌های کاربر ---'

-- پیدا کردن selectortype مربوط به roles (بر اساس code یا title)
DO $$
DECLARE
  v_role_type_id INTEGER;
  v_role_record RECORD;
  v_new_role_id INTEGER;
BEGIN
  -- پیدا کردن selectortype برای roles
  SELECT id INTO v_role_type_id
  FROM pelak.selectortype
  WHERE LOWER(code) IN ('ro', 'rl', 'role', 'roles') 
     OR LOWER(title) IN ('role', 'roles', 'نقش', 'نقش‌ها')
  LIMIT 1;

  IF v_role_type_id IS NOT NULL THEN
    -- انتقال داده‌ها
    FOR v_role_record IN
      SELECT id, title, txt, num
      FROM pelak.selector
      WHERE type = v_role_type_id
      ORDER BY num ASC, title ASC
    LOOP
      -- درج در جدول roles
      INSERT INTO pelak.roles (id, title, description, num, is_active, created_at, updated_at)
      VALUES (
        v_role_record.id,
        v_role_record.title,
        v_role_record.txt,
        v_role_record.num,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        num = EXCLUDED.num,
        updated_at = NOW();

      -- به‌روزرسانی foreign key در users
      UPDATE pelak.users
      SET role_id = v_role_record.id
      WHERE role_id = v_role_record.id;
    END LOOP;

    RAISE NOTICE 'نقش‌های کاربر منتقل شدند.';
  ELSE
    RAISE NOTICE 'نوع selector برای roles یافت نشد.';
  END IF;
END $$;

-- ============================================================================
-- مرحله 2: انتقال تصاویر پروفایل (profile_images)
-- ============================================================================
\echo ''
\echo '--- انتقال تصاویر پروفایل ---'

DO $$
DECLARE
  v_profile_image_type_id INTEGER;
  v_profile_image_record RECORD;
BEGIN
  -- پیدا کردن selectortype برای profile_images
  SELECT id INTO v_profile_image_type_id
  FROM pelak.selectortype
  WHERE LOWER(code) IN ('pi', 'pr', 'img', 'profile')
     OR LOWER(title) IN ('profile image', 'profile images', 'تصویر پروفایل', 'تصاویر پروفایل')
  LIMIT 1;

  IF v_profile_image_type_id IS NOT NULL THEN
    -- انتقال داده‌ها
    FOR v_profile_image_record IN
      SELECT id, title, txt, num
      FROM pelak.selector
      WHERE type = v_profile_image_type_id
      ORDER BY num ASC, title ASC
    LOOP
      -- درج در جدول profile_images
      INSERT INTO pelak.profile_images (id, title, description, image_url, num, is_active, created_at, updated_at)
      VALUES (
        v_profile_image_record.id,
        v_profile_image_record.title,
        v_profile_image_record.txt,
        NULL, -- image_url از txt استخراج نمی‌شود، باید دستی تنظیم شود
        v_profile_image_record.num,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        num = EXCLUDED.num,
        updated_at = NOW();

      -- به‌روزرسانی foreign key در users
      UPDATE pelak.users
      SET profile_image_id = v_profile_image_record.id
      WHERE profile_image_id = v_profile_image_record.id;
    END LOOP;

    RAISE NOTICE 'تصاویر پروفایل منتقل شدند.';
  ELSE
    RAISE NOTICE 'نوع selector برای profile_images یافت نشد.';
  END IF;
END $$;

-- ============================================================================
-- مرحله 3: انتقال بخش‌های صفحه (page_sections)
-- ============================================================================
\echo ''
\echo '--- انتقال بخش‌های صفحه ---'

DO $$
DECLARE
  v_section_type_id INTEGER;
  v_section_record RECORD;
BEGIN
  -- پیدا کردن selectortype برای page_sections
  SELECT id INTO v_section_type_id
  FROM pelak.selectortype
  WHERE LOWER(code) IN ('se', 'sc', 'sec', 'section')
     OR LOWER(title) IN ('section', 'sections', 'بخش', 'بخش‌ها', 'دسته‌بندی')
  LIMIT 1;

  IF v_section_type_id IS NOT NULL THEN
    -- انتقال داده‌ها
    FOR v_section_record IN
      SELECT id, title, txt, num
      FROM pelak.selector
      WHERE type = v_section_type_id
      ORDER BY num ASC, title ASC
    LOOP
      -- درج در جدول page_sections
      INSERT INTO pelak.page_sections (id, title, description, num, is_active, created_at, updated_at)
      VALUES (
        v_section_record.id,
        v_section_record.title,
        v_section_record.txt,
        v_section_record.num,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        num = EXCLUDED.num,
        updated_at = NOW();

      -- به‌روزرسانی foreign key در page
      UPDATE pelak.page
      SET section_id = v_section_record.id
      WHERE section_id = v_section_record.id;
    END LOOP;

    RAISE NOTICE 'بخش‌های صفحه منتقل شدند.';
  ELSE
    RAISE NOTICE 'نوع selector برای page_sections یافت نشد.';
  END IF;
END $$;

-- ============================================================================
-- مرحله 4: انتقال انواع صفحه (page_types)
-- ============================================================================
\echo ''
\echo '--- انتقال انواع صفحه ---'

DO $$
DECLARE
  v_type_type_id INTEGER;
  v_type_record RECORD;
BEGIN
  -- پیدا کردن selectortype برای page_types
  SELECT id INTO v_type_type_id
  FROM pelak.selectortype
  WHERE LOWER(code) IN ('ty', 'tp', 'type', 'types')
     OR LOWER(title) IN ('type', 'types', 'نوع', 'انواع', 'نوع صفحه')
  LIMIT 1;

  IF v_type_type_id IS NOT NULL THEN
    -- انتقال داده‌ها
    FOR v_type_record IN
      SELECT id, title, txt, num
      FROM pelak.selector
      WHERE type = v_type_type_id
      ORDER BY num ASC, title ASC
    LOOP
      -- درج در جدول page_types
      INSERT INTO pelak.page_types (id, title, description, num, is_active, created_at, updated_at)
      VALUES (
        v_type_record.id,
        v_type_record.title,
        v_type_record.txt,
        v_type_record.num,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        num = EXCLUDED.num,
        updated_at = NOW();

      -- به‌روزرسانی foreign key در page
      UPDATE pelak.page
      SET type_id = v_type_record.id
      WHERE type_id = v_type_record.id;
    END LOOP;

    RAISE NOTICE 'انواع صفحه منتقل شدند.';
  ELSE
    RAISE NOTICE 'نوع selector برای page_types یافت نشد.';
  END IF;
END $$;

-- ============================================================================
-- مرحله 5: به‌روزرسانی Sequences
-- ============================================================================
\echo ''
\echo '--- به‌روزرسانی Sequences ---'

-- به‌روزرسانی sequence برای roles
DO $$
DECLARE
  v_max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM pelak.roles;
  IF v_max_id > 0 THEN
    PERFORM setval('pelak.roles_id_seq', v_max_id);
    RAISE NOTICE 'Sequence roles_id_seq به % تنظیم شد.', v_max_id;
  END IF;
END $$;

-- به‌روزرسانی sequence برای profile_images
DO $$
DECLARE
  v_max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM pelak.profile_images;
  IF v_max_id > 0 THEN
    PERFORM setval('pelak.profile_images_id_seq', v_max_id);
    RAISE NOTICE 'Sequence profile_images_id_seq به % تنظیم شد.', v_max_id;
  END IF;
END $$;

-- به‌روزرسانی sequence برای page_sections
DO $$
DECLARE
  v_max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM pelak.page_sections;
  IF v_max_id > 0 THEN
    PERFORM setval('pelak.page_sections_id_seq', v_max_id);
    RAISE NOTICE 'Sequence page_sections_id_seq به % تنظیم شد.', v_max_id;
  END IF;
END $$;

-- به‌روزرسانی sequence برای page_types
DO $$
DECLARE
  v_max_id INTEGER;
BEGIN
  SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM pelak.page_types;
  IF v_max_id > 0 THEN
    PERFORM setval('pelak.page_types_id_seq', v_max_id);
    RAISE NOTICE 'Sequence page_types_id_seq به % تنظیم شد.', v_max_id;
  END IF;
END $$;

\echo ''
\echo '============================================================================'
\echo 'Migration با موفقیت انجام شد!'
\echo '============================================================================'
\echo ''
\echo 'توجه: لطفاً داده‌های منتقل شده را بررسی کنید و در صورت نیاز:'
\echo '  1. image_url را در جدول profile_images تنظیم کنید'
\echo '  2. داده‌های اضافی را در جداول جدید اضافه کنید'
\echo '  3. پس از اطمینان، جداول selector و selectortype را حذف کنید'
\echo '============================================================================'

