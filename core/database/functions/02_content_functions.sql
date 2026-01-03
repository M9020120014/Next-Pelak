-- ============================================================================
-- ماژول: توابع مدیریت محتوا
-- توضیحات: توابع مربوط به سلکتورها (فقط برای شمای htni) و صفحات سایت
-- توجه: شمای pelak دیگر از selector استفاده نمی‌کند و از جداول اختصاصی استفاده می‌کند
-- ============================================================================

-- ----------------------------------------------------------------------------
-- تابع helper: selector_tree
-- توضیحات: ساخت JSON سلسله مراتبی برای یک selector با children
-- این تابع به صورت recursive کار می‌کند و تمام فرزندان را می‌یابد
-- توجه: این تابع فقط برای شمای htni کار می‌کند
-- 
-- پارامترها:
--   p_selector_id: شناسه selector
--   p_type_id: شناسه نوع selector
--   p_schema: نام schema (فقط htni) - پیش‌فرض: htni
-- 
-- مقادیر بازگشتی:
--   JSONB object شامل selector و children (recursive)
--   NULL در صورت عدم یافتن selector یا استفاده از schema نامعتبر
-- 
-- مثال استفاده:
--   SELECT selector_tree(1, 1, 'htni');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."selector_tree"("p_selector_id" int4, "p_type_id" int4, "p_schema" varchar DEFAULT 'htni')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $BODY$
DECLARE
  v_selector RECORD;
  v_child_selector RECORD;
  v_children jsonb := '[]'::jsonb;
  v_child jsonb;
  v_schema_name varchar := LOWER(COALESCE(p_schema, 'htni'));
BEGIN
  -- اعتبارسنجی schema - فقط htni مجاز است
  IF v_schema_name != 'htni' THEN
    RETURN NULL;
  END IF;

  -- دریافت اطلاعات selector با استفاده از dynamic SQL
  EXECUTE format('
    SELECT id, title, type, selectorid, txt, num
    FROM %I.selector
    WHERE id = $1 AND type = $2
  ', v_schema_name) USING p_selector_id, p_type_id INTO v_selector;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- دریافت children به صورت recursive
  -- توجه: children باید selectorid = parent_id داشته باشند
  FOR v_child_selector IN
    EXECUTE format('
      SELECT id, title, type, selectorid, txt, num
      FROM %I.selector
      WHERE selectorid = $1
      ORDER BY num ASC, title ASC
    ', v_schema_name) USING p_selector_id
  LOOP
    -- برای children، type را از خود child می‌گیریم تا recursive call درست کار کند
    v_child := selector_tree(v_child_selector.id, v_child_selector.type, v_schema_name);
    IF v_child IS NOT NULL THEN
      v_children := v_children || jsonb_build_array(v_child);
    END IF;
  END LOOP;

  -- ساخت JSON برای selector با children
  RETURN jsonb_build_object(
    'id', v_selector.id,
    'title', v_selector.title,
    'type', v_selector.type,
    'selectorid', v_selector.selectorid,
    'txt', v_selector.txt,
    'num', v_selector.num,
    'children', v_children
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: selectors_get_tree
-- توضیحات: دریافت selectorها بر اساس code یا title از selectortype با ساختار سلسله مراتبی
-- این تابع selectorها را به صورت درختی با تمام فرزندان برمی‌گرداند
-- توجه: این تابع فقط برای شمای htni کار می‌کند
-- 
-- پارامترها:
--   p_type_identifier: code یا title از selectortype
--   p_schema: نام schema (فقط htni) - پیش‌فرض: htni
-- 
-- منطق کاری:
--   1. بررسی schema (فقط htni مجاز است)
--   2. پیدا کردن selectortype بر اساس code یا title
--   3. دریافت root selectorها (selectorid IS NULL)
--   4. ساخت JSON سلسله مراتبی با استفاده از selector_tree
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Selectors Retrieved", selectors: [...]}
--   خطا: {success: false, title: "Invalid Schema" | "Type Not Found" | "Error", selectors: []}
-- 
-- مثال استفاده:
--   SELECT selectors_get_tree('province', 'htni'); -- با code از htni
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."selectors_get_tree"("p_type_identifier" varchar, "p_schema" varchar DEFAULT 'htni')
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_type_id INTEGER;
  v_selectors JSONB := '[]'::jsonb;
  v_root_selector RECORD;
  v_selector_json jsonb;
  v_schema_name varchar := LOWER(COALESCE(p_schema, 'htni'));
BEGIN
  -- اعتبارسنجی schema - فقط htni مجاز است
  IF v_schema_name != 'htni' THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Schema',
      'message', 'این تابع فقط برای شمای htni کار می‌کند. شمای pelak دیگر از selector استفاده نمی‌کند.',
      'selectors', '[]'::json
    );
  END IF;

  -- پیدا کردن selectortype بر اساس code یا title
  EXECUTE format('
    SELECT id
    FROM %I.selectortype
    WHERE code = $1 OR title = $1
    LIMIT 1
  ', v_schema_name) USING p_type_identifier INTO v_type_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Type Not Found',
      'message', 'نوع سلکتور یافت نشد.',
      'selectors', '[]'::json
    );
  END IF;

  -- دریافت root selectorها (selectorid IS NULL) و ساخت JSON سلسله مراتبی
  FOR v_root_selector IN
    EXECUTE format('
      SELECT id, title, type, selectorid, txt, num
      FROM %I.selector
      WHERE type = $1 AND selectorid IS NULL
      ORDER BY num ASC, title ASC
    ', v_schema_name) USING v_type_id
  LOOP
    v_selector_json := selector_tree(v_root_selector.id, v_type_id, v_schema_name);
    IF v_selector_json IS NOT NULL THEN
      v_selectors := v_selectors || jsonb_build_array(v_selector_json);
    END IF;
  END LOOP;

  -- اگر root selector وجود نداشت، همه selectorها را به صورت سلسله مراتبی برگردان
  -- (این حالت زمانی رخ می‌دهد که همه selectorها فرزند هستند)
  IF v_selectors = '[]'::jsonb THEN
    FOR v_root_selector IN
      EXECUTE format('
        SELECT id, title, type, selectorid, txt, num
        FROM %I.selector
        WHERE type = $1
        ORDER BY num ASC, title ASC
      ', v_schema_name) USING v_type_id
    LOOP
      v_selector_json := selector_tree(v_root_selector.id, v_type_id, v_schema_name);
      IF v_selector_json IS NOT NULL THEN
        v_selectors := v_selectors || jsonb_build_array(v_selector_json);
      END IF;
    END LOOP;
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Selectors Retrieved',
    'message', 'سلکتورها با موفقیت دریافت شدند.',
    'selectors', v_selectors
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در دریافت سلکتورها.',
    'selectors', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: selectors_get
-- توضیحات: دریافت همه selectorها بر اساس code یا title از selectortype بدون ساختار سلسله مراتبی
-- این تابع selectorها را به صورت flat list برمی‌گرداند (بدون children)
-- توجه: این تابع فقط برای شمای htni کار می‌کند
-- 
-- پارامترها:
--   p_type_identifier: code یا title از selectortype
--   p_schema: نام schema (فقط htni) - پیش‌فرض: htni
-- 
-- منطق کاری:
--   1. بررسی schema (فقط htni مجاز است)
--   2. پیدا کردن selectortype بر اساس code یا title
--   3. دریافت همه selectorها بدون فرزندان
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Selectors Retrieved", selectors: [...]}
--   خطا: {success: false, title: "Invalid Schema" | "Type Not Found" | "Error", selectors: []}
-- 
-- مثال استفاده:
--   SELECT selectors_get('province', 'htni');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."selectors_get"("p_type_identifier" varchar, "p_schema" varchar DEFAULT 'htni')
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_type_id INTEGER;
  v_selectors JSONB := '[]'::jsonb;
  v_schema_name varchar := LOWER(COALESCE(p_schema, 'htni'));
BEGIN
  -- اعتبارسنجی schema - فقط htni مجاز است
  IF v_schema_name != 'htni' THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Schema',
      'message', 'این تابع فقط برای شمای htni کار می‌کند. شمای pelak دیگر از selector استفاده نمی‌کند.',
      'selectors', '[]'::json
    );
  END IF;

  -- پیدا کردن selectortype بر اساس code یا title
  EXECUTE format('
    SELECT id
    FROM %I.selectortype
    WHERE code = $1 OR title = $1
    LIMIT 1
  ', v_schema_name) USING p_type_identifier INTO v_type_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Type Not Found',
      'message', 'نوع سلکتور یافت نشد.',
      'selectors', '[]'::json
    );
  END IF;

  -- دریافت همه selectorها بدون فرزندان
  EXECUTE format('
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          ''id'', id,
          ''title'', title,
          ''type'', type,
          ''selectorid'', selectorid,
          ''txt'', txt,
          ''num'', num
        ) ORDER BY num ASC, title ASC
      ),
      ''[]''::jsonb
    )
    FROM %I.selector
    WHERE type = $1
  ', v_schema_name) USING v_type_id INTO v_selectors;

  RETURN json_build_object(
    'success', true,
    'title', 'Selectors Retrieved',
    'message', 'سلکتورها با موفقیت دریافت شدند.',
    'selectors', v_selectors
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در دریافت سلکتورها.',
    'selectors', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: selectors_get_selector
-- توضیحات: دریافت selectorها بر اساس code یا title از selectortype و selectorid بدون ساختار سلسله مراتبی
-- این تابع selectorهای فرزند یک selector خاص را برمی‌گرداند
-- توجه: این تابع فقط برای شمای htni کار می‌کند
-- 
-- پارامترها:
--   p_type_identifier: code یا title از selectortype
--   p_selectorid: شناسه selector والد
--   p_schema: نام schema (فقط htni) - پیش‌فرض: htni
-- 
-- منطق کاری:
--   1. بررسی schema (فقط htni مجاز است)
--   2. پیدا کردن selectortype بر اساس code یا title
--   3. دریافت selectorها با شرط type و selectorid
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Selectors Retrieved", selectors: [...]}
--   خطا: {success: false, title: "Invalid Schema" | "Type Not Found" | "Error", selectors: []}
-- 
-- مثال استفاده:
--   SELECT selectors_get_selector('city', 5, 'htni'); -- شهرهای استان با id=5 در htni
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."selectors_get_selector"("p_type_identifier" varchar, "p_selectorid" int4, "p_schema" varchar DEFAULT 'htni')
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_type_id INTEGER;
  v_selectors JSONB := '[]'::jsonb;
  v_schema_name varchar := LOWER(COALESCE(p_schema, 'htni'));
BEGIN
  -- اعتبارسنجی schema - فقط htni مجاز است
  IF v_schema_name != 'htni' THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Schema',
      'message', 'این تابع فقط برای شمای htni کار می‌کند. شمای pelak دیگر از selector استفاده نمی‌کند.',
      'selectors', '[]'::json
    );
  END IF;

  -- پیدا کردن selectortype بر اساس code یا title
  EXECUTE format('
    SELECT id
    FROM %I.selectortype
    WHERE code = $1 OR title = $1
    LIMIT 1
  ', v_schema_name) USING p_type_identifier INTO v_type_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Type Not Found',
      'message', 'نوع سلکتور یافت نشد.',
      'selectors', '[]'::json
    );
  END IF;

  -- دریافت selectorها با شرط type و selectorid
  EXECUTE format('
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          ''id'', id,
          ''title'', title,
          ''type'', type,
          ''selectorid'', selectorid,
          ''txt'', txt,
          ''num'', num
        ) ORDER BY num ASC, title ASC
      ),
      ''[]''::jsonb
    )
    FROM %I.selector
    WHERE type = $1 AND selectorid = $2
  ', v_schema_name) USING v_type_id, p_selectorid INTO v_selectors;

  RETURN json_build_object(
    'success', true,
    'title', 'Selectors Retrieved',
    'message', 'سلکتورها با موفقیت دریافت شدند.',
    'selectors', v_selectors
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در دریافت سلکتورها.',
    'selectors', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: page_get_summaries
-- توضیحات: دریافت خلاصه صفحات با pagination و فیلتر بر اساس status و lang
-- این تابع فقط فیلدهای خلاصه را برمی‌گرداند (نه محتوای کامل)
-- 
-- پارامترها:
--   p_limit: تعداد صفحات در هر صفحه (pagination)
--   p_offset: تعداد صفحات برای skip کردن (pagination)
--   p_lang: زبان صفحات (1 = فارسی, 2 = انگلیسی) - Foreign Key به pelak.languages.id
-- 
-- منطق کاری:
--   1. فیلتر صفحات با status=1 (منتشر شده) و lang مشخص شده
--   2. مرتب‌سازی بر اساس published_time DESC و id DESC
--   3. اعمال limit و offset
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Pages Retrieved", pages: [...]}
--   خطا: {success: false, title: "Error", pages: []}
-- 
-- مثال استفاده:
--   SELECT page_get_summaries(10, 0, 1); -- 10 صفحه اول فارسی
--   SELECT page_get_summaries(20, 20, 2); -- صفحات 21-40 انگلیسی
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."page_get_summaries"("p_limit" int4, "p_offset" int4, "p_lang" int2)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_pages JSONB := '[]'::jsonb;
BEGIN
  -- دریافت صفحات با شرایط مشخص شده
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'description', description,
        'url', url,
        'modified_time', modified_time,
        'published_time', published_time,
        'media', media
      )
    ),
    '[]'::jsonb
  ) INTO v_pages
  FROM (
    SELECT 
      id,
      title,
      description,
      url,
      modified_time,
      published_time,
      media
    FROM pelak.page
    WHERE status = 1 AND lang = p_lang
    ORDER BY published_time DESC, id DESC
    LIMIT p_limit
    OFFSET p_offset
  ) AS filtered_pages;

  RETURN json_build_object(
    'success', true,
    'title', 'Pages Retrieved',
    'message', 'صفحات با موفقیت دریافت شدند.',
    'pages', v_pages
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در دریافت صفحات.',
    'pages', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: page_get_url
-- توضیحات: دریافت کامل اطلاعات یک صفحه بر اساس URL
-- این تابع تمام فیلدهای صفحه را برمی‌گرداند
-- 
-- پارامترها:
--   p_url: URL صفحه
-- 
-- منطق کاری:
--   1. جستجوی صفحه بر اساس URL
--   2. بازگشت تمام فیلدهای صفحه
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Page Retrieved", page: {...}}
--   خطا: {success: false, title: "Page Not Found" | "Error", page: null}
-- 
-- مثال استفاده:
--   SELECT page_get_url('/about-us');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."page_get_url"("p_url" text)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_page JSONB;
BEGIN
  -- دریافت صفحه بر اساس URL
  SELECT jsonb_build_object(
    'id', id,
    'title', title,
    'description', description,
    'keywords', keywords,
    'content', content,
    'media', media,
    'url', url,
    'published_time', published_time,
    'modified_time', modified_time,
    'authors', authors,
    'section_id', section_id,
    'type_id', type_id,
    'tags', tags,
    'status', status,
    'lang', lang,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_page
  FROM pelak.page
  WHERE url = p_url
  LIMIT 1;

  IF v_page IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Page Not Found',
      'message', 'صفحه با این URL یافت نشد.',
      'page', NULL::json
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Page Retrieved',
    'message', 'صفحه با موفقیت دریافت شد.',
    'page', v_page
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در دریافت صفحه.',
    'page', NULL::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- تابع: page_get_id
-- توضیحات: دریافت کامل اطلاعات یک صفحه بر اساس ID
-- این تابع تمام فیلدهای صفحه را برمی‌گرداند
-- 
-- پارامترها:
--   p_id: شناسه صفحه
-- 
-- منطق کاری:
--   1. جستجوی صفحه بر اساس ID
--   2. بازگشت تمام فیلدهای صفحه
-- 
-- مقادیر بازگشتی:
--   موفق: {success: true, title: "Page Retrieved", page: {...}}
--   خطا: {success: false, title: "Page Not Found" | "Error", page: null}
-- 
-- مثال استفاده:
--   SELECT page_get_id(1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."page_get_id"("p_id" int4)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_page JSONB;
BEGIN
  -- دریافت صفحه بر اساس ID
  SELECT jsonb_build_object(
    'id', id,
    'title', title,
    'description', description,
    'keywords', keywords,
    'content', content,
    'media', media,
    'url', url,
    'published_time', published_time,
    'modified_time', modified_time,
    'authors', authors,
    'section_id', section_id,
    'type_id', type_id,
    'tags', tags,
    'status', status,
    'lang', lang,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_page
  FROM pelak.page
  WHERE id = p_id
  LIMIT 1;

  IF v_page IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Page Not Found',
      'message', 'صفحه با این ID یافت نشد.',
      'page', NULL::json
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Page Retrieved',
    'message', 'صفحه با موفقیت دریافت شد.',
    'page', v_page
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در دریافت صفحه.',
    'page', NULL::json
  );
END;
$BODY$;

