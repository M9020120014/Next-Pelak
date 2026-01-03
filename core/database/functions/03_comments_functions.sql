-- ============================================================================
-- ماژول: توابع نظرات و تعاملات
-- توضیحات: توابع مربوط به مدیریت نظرات صفحات و لایک‌ها
-- ============================================================================

-- ----------------------------------------------------------------------------
-- تابع: comments_get_by_pageid
-- توضیحات: دریافت نظرات یک صفحه با ساختار درختی
-- فقط نظرات تایید شده و حذف نشده را برمی‌گرداند
-- پشتیبانی از مرتب‌سازی: time_desc, time_asc, likes_desc, importance_desc
-- 
-- پارامترها:
--   p_pageid: شناسه صفحه
--   p_sort_type: نوع مرتب‌سازی (پیش‌فرض: 'time_desc')
--     - 'time_desc': جدیدترین اول (پیش‌فرض)
--     - 'time_asc': قدیمی‌ترین اول
--     - 'likes_desc': بیشترین لایک اول
--     - 'importance_desc': بیشترین اهمیت اول
--   p_userid: شناسه کاربر (اختیاری) - برای نمایش وضعیت لایک کاربر
-- 
-- منطق کاری:
--   1. دریافت تمام نظرات تایید شده و حذف نشده
--   2. شمارش لایک‌ها برای هر نظر
--   3. بررسی لایک کاربر (اگر p_userid مشخص شده باشد)
--   4. مرتب‌سازی بر اساس p_sort_type
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Comments Retrieved", comments: [...]}
--   خطا: {success: false, title: "Error", comments: []}
-- 
-- مثال استفاده:
--   SELECT comments_get_by_pageid(1, 'time_desc', 5);
--   SELECT comments_get_by_pageid(1, 'likes_desc', NULL);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."comments_get_by_pageid"(
  "p_pageid" int4,
  "p_sort_type" varchar DEFAULT 'time_desc',
  "p_userid" int4 DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_comments JSONB := '[]'::jsonb;
BEGIN
  -- دریافت تمام نظرات تایید شده و حذف نشده برای این صفحه با شمارش لایک‌ها
  -- مرتب‌سازی بر اساس نوع درخواستی
  IF p_sort_type = 'time_asc' THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'isapproved', c.isapproved,
          'isdeleted', c.isdeleted,
          'createdat', c.createdat,
          'updatedat', c.updatedat,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY c.createdat ASC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.comment_likes
      GROUP BY commentid
    ) likes ON c.id = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.comment_likes
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.id = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.isapproved = true
      AND c.isdeleted = false;
  ELSIF p_sort_type = 'likes_desc' THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'isapproved', c.isapproved,
          'isdeleted', c.isdeleted,
          'createdat', c.createdat,
          'updatedat', c.updatedat,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY COALESCE(likes.likes_count, 0) DESC, c.createdat DESC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.comment_likes
      GROUP BY commentid
    ) likes ON c.id = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.comment_likes
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.id = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.isapproved = true
      AND c.isdeleted = false;
  ELSIF p_sort_type = 'importance_desc' THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'isapproved', c.isapproved,
          'isdeleted', c.isdeleted,
          'createdat', c.createdat,
          'updatedat', c.updatedat,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY COALESCE(c.importance, 0) DESC, c.createdat DESC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.comment_likes
      GROUP BY commentid
    ) likes ON c.id = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.comment_likes
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.id = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.isapproved = true
      AND c.isdeleted = false;
  ELSE -- time_desc (پیش‌فرض)
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'isapproved', c.isapproved,
          'isdeleted', c.isdeleted,
          'createdat', c.createdat,
          'updatedat', c.updatedat,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY c.createdat DESC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.comment_likes
      GROUP BY commentid
    ) likes ON c.id = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.comment_likes
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.id = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.isapproved = true
      AND c.isdeleted = false;
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Comments Retrieved',
    'message', 'نظرات با موفقیت دریافت شدند.',
    'comments', v_comments
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در دریافت نظرات.',
    'comments', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: comments_create
-- توضیحات: ایجاد نظر جدید
-- 
-- پارامترها:
--   p_userid: شناسه کاربر نویسنده
--   p_pageid: شناسه صفحه
--   p_content: محتوای نظر
--   p_parentid: شناسه نظر والد (اختیاری) - برای پاسخ به نظر دیگر
-- 
-- منطق کاری:
--   1. بررسی وجود صفحه
--   2. بررسی وجود و فعال بودن کاربر
--   3. بررسی وجود نظر والد (اگر p_parentid مشخص شده باشد)
--   4. بررسی خالی نبودن محتوا
--   5. ایجاد نظر جدید با isapproved=true (نیاز به تایید ادمین)
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Comment Created", message: "...", comment_id: ...}
--   خطا: {success: false, title: "Page Not Found" | "User Not Found" | "Parent Comment Not Found" | "Invalid Content" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT comments_create(1, 5, 'نظر من', NULL); -- نظر جدید
--   SELECT comments_create(1, 5, 'پاسخ من', 10); -- پاسخ به نظر با id=10
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."comments_create"(
  "p_userid" int4,
  "p_pageid" int4,
  "p_content" text,
  "p_parentid" int4 DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_comment_id INTEGER;
  v_page_exists BOOLEAN;
  v_parent_exists BOOLEAN;
BEGIN
  -- بررسی وجود صفحه
  SELECT EXISTS(SELECT 1 FROM pelak.page WHERE id = p_pageid) INTO v_page_exists;
  IF NOT v_page_exists THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Page Not Found',
      'message', 'صفحه یافت نشد.'
    );
  END IF;

  -- بررسی وجود کاربر
  IF NOT EXISTS(SELECT 1 FROM pelak.users WHERE id = p_userid AND is_active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربر یافت نشد یا غیرفعال است.'
    );
  END IF;

  -- اگر parentid مشخص شده، بررسی وجود آن
  IF p_parentid IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM pelak.comments 
      WHERE id = p_parentid 
        AND pageid = p_pageid 
        AND isdeleted = false
    ) INTO v_parent_exists;
    IF NOT v_parent_exists THEN
      RETURN json_build_object(
        'success', false,
        'title', 'Parent Comment Not Found',
        'message', 'نظر والد یافت نشد.'
      );
    END IF;
  END IF;

  -- بررسی محتوا
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Content',
      'message', 'محتوا نمی‌تواند خالی باشد.'
    );
  END IF;

  -- ایجاد نظر جدید (به صورت پیش‌فرض تایید شده)
  INSERT INTO pelak.comments (
    userid,
    pageid,
    parentid,
    content,
    isapproved,
    isdeleted,
    createdat,
    updatedat
  ) VALUES (
    p_userid,
    p_pageid,
    p_parentid,
    trim(p_content),
    true, -- نیاز به تایید ادمین
    false,
    NOW(),
    NOW()
  ) RETURNING id INTO v_comment_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Comment Created',
    'message', 'نظر با موفقیت ثبت شد و در انتظار تایید است.',
    'comment_id', v_comment_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در ثبت نظر.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: comments_update
-- توضیحات: ویرایش نظر (فقط توسط نویسنده)
-- 
-- پارامترها:
--   p_commentid: شناسه نظر
--   p_userid: شناسه کاربر (برای بررسی مالکیت)
--   p_content: محتوای جدید
-- 
-- منطق کاری:
--   1. بررسی وجود نظر و حذف نشده بودن
--   2. بررسی مالکیت (فقط نویسنده می‌تواند ویرایش کند)
--   3. بررسی خالی نبودن محتوا
--   4. به‌روزرسانی محتوا و updatedat
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Comment Updated", message: "..."}
--   خطا: {success: false, title: "Comment Not Found" | "Permission Denied" | "Invalid Content" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT comments_update(10, 1, 'محتویات جدید');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."comments_update"(
  "p_commentid" int4,
  "p_userid" int4,
  "p_content" text
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_comment_owner INTEGER;
BEGIN
  -- بررسی وجود نظر و مالکیت
  SELECT userid INTO v_comment_owner
  FROM pelak.comments
  WHERE id = p_commentid
    AND isdeleted = false;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Comment Not Found',
      'message', 'نظر یافت نشد.'
    );
  END IF;

  -- بررسی مالکیت
  IF v_comment_owner != p_userid THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Permission Denied',
      'message', 'شما اجازه ویرایش این نظر را ندارید.'
    );
  END IF;

  -- بررسی محتوا
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Content',
      'message', 'محتوا نمی‌تواند خالی باشد.'
    );
  END IF;

  -- به‌روزرسانی نظر
  UPDATE pelak.comments
  SET content = trim(p_content),
      updatedat = NOW()
  WHERE id = p_commentid;

  RETURN json_build_object(
    'success', true,
    'title', 'Comment Updated',
    'message', 'نظر با موفقیت ویرایش شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در ویرایش نظر.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: comments_delete
-- توضیحات: حذف منطقی نظر (فقط توسط نویسنده)
-- 
-- پارامترها:
--   p_commentid: شناسه نظر
--   p_userid: شناسه کاربر (برای بررسی مالکیت)
-- 
-- منطق کاری:
--   1. بررسی وجود نظر و حذف نشده بودن
--   2. بررسی مالکیت (فقط نویسنده می‌تواند حذف کند)
--   3. حذف منطقی (set کردن isdeleted = true)
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Comment Deleted", message: "..."}
--   خطا: {success: false, title: "Comment Not Found" | "Permission Denied" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT comments_delete(10, 1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."comments_delete"(
  "p_commentid" int4,
  "p_userid" int4
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_comment_owner INTEGER;
BEGIN
  -- بررسی وجود نظر و مالکیت
  SELECT userid INTO v_comment_owner
  FROM pelak.comments
  WHERE id = p_commentid
    AND isdeleted = false;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Comment Not Found',
      'message', 'نظر یافت نشد.'
    );
  END IF;

  -- بررسی مالکیت
  IF v_comment_owner != p_userid THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Permission Denied',
      'message', 'شما اجازه حذف این نظر را ندارید.'
    );
  END IF;

  -- حذف منطقی (soft delete)
  UPDATE pelak.comments
  SET isdeleted = true,
      updatedat = NOW()
  WHERE id = p_commentid;

  RETURN json_build_object(
    'success', true,
    'title', 'Comment Deleted',
    'message', 'نظر با موفقیت حذف شد.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در حذف نظر.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: comments_toggle_like
-- توضیحات: لایک یا آنلایک کردن یک کامنت (toggle)
-- اگر کاربر قبلاً لایک کرده باشد، لایک حذف می‌شود (آنلایک)
-- اگر کاربر لایک نکرده باشد، لایک اضافه می‌شود
-- 
-- پارامترها:
--   p_userid: شناسه کاربر
--   p_commentid: شناسه کامنت
-- 
-- منطق کاری:
--   1. بررسی وجود کامنت و تایید شده بودن
--   2. بررسی وجود و فعال بودن کاربر
--   3. بررسی وجود لایک قبلی
--   4. در صورت وجود: حذف لایک (آنلایک)
--   5. در صورت عدم وجود: افزودن لایک
--   6. شمارش تعداد لایک‌ها
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Comment Liked" | "Comment Unliked", message: "...", liked: true|false, likes_count: ...}
--   خطا: {success: false, title: "Comment Not Found" | "User Not Found" | "Error", message: "..."}
-- 
-- مثال استفاده:
--   SELECT comments_toggle_like(1, 10);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."comments_toggle_like"(
  "p_userid" int4,
  "p_commentid" int4
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_like_exists BOOLEAN;
  v_comment_exists BOOLEAN;
  v_user_exists BOOLEAN;
  v_likes_count INTEGER;
  v_liked BOOLEAN;
BEGIN
  -- بررسی وجود کامنت
  SELECT EXISTS(
    SELECT 1 FROM pelak.comments 
    WHERE id = p_commentid 
      AND isdeleted = false
      AND isapproved = true
  ) INTO v_comment_exists;

  IF NOT v_comment_exists THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Comment Not Found',
      'message', 'کامنت یافت نشد یا تایید نشده است.'
    );
  END IF;

  -- بررسی وجود کاربر
  SELECT EXISTS(
    SELECT 1 FROM pelak.users 
    WHERE id = p_userid 
      AND is_active = true
  ) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'کاربر یافت نشد یا غیرفعال است.'
    );
  END IF;

  -- بررسی وجود لایک
  SELECT EXISTS(
    SELECT 1 FROM pelak.comment_likes
    WHERE userid = p_userid 
      AND commentid = p_commentid
  ) INTO v_like_exists;

  IF v_like_exists THEN
    -- حذف لایک (آنلایک)
    DELETE FROM pelak.comment_likes
    WHERE userid = p_userid 
      AND commentid = p_commentid;
    
    v_liked := false;
  ELSE
    -- افزودن لایک
    INSERT INTO pelak.comment_likes (userid, commentid, createdat)
    VALUES (p_userid, p_commentid, NOW());
    
    v_liked := true;
  END IF;

  -- شمارش تعداد لایک‌ها
  SELECT COUNT(*)::int4 INTO v_likes_count
  FROM pelak.comment_likes
  WHERE commentid = p_commentid;

  RETURN json_build_object(
    'success', true,
    'title', CASE WHEN v_liked THEN 'Comment Liked' ELSE 'Comment Unliked' END,
    'message', CASE WHEN v_liked THEN 'کامنت لایک شد.' ELSE 'لایک کامنت حذف شد.' END,
    'liked', v_liked,
    'likes_count', v_likes_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در لایک/آنلایک کردن کامنت.'
  );
END;
$BODY$;

