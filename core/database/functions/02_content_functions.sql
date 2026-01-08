-- ============================================================================
-- Module: Content Management Functions
-- Description: Functions related to selectors (only for project schema) and site page
-- Note: Pelak schema no longer uses selector and uses dedicated tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper Function: project_selector_tree
-- Description: Build hierarchical JSON for a selector with children
-- This function works recursively and finds all children
-- Note: This function only works for project schema
-- 
-- Parameters:
--   p_selectorid: Selector identifier
--   p_typeid: Selector type identifier
-- 
-- Returns:
--   JSONB object containing selector and children (recursive)
--   NULL if selector not found
-- 
-- Usage Example:
--   SELECT project_selector_tree(1, 1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_selector_tree"("p_selectorid" int4, "p_typeid" int4)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $BODY$
DECLARE
  v_selector RECORD;
  v_child_selector RECORD;
  v_children jsonb := '[]'::jsonb;
  v_child jsonb;
BEGIN
  -- Get selector information from project schema
  SELECT selectorid, title, type, parentselectorid, txt, "order"
  INTO v_selector
  FROM project.selector
  WHERE selectorid = p_selectorid AND type = p_typeid;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get children recursively
  -- Note: children must have parentselectorid = parent_id
  FOR v_child_selector IN
    SELECT selectorid, title, type, parentselectorid, txt, "order"
    FROM project.selector
    WHERE parentselectorid = p_selectorid
    ORDER BY "order" ASC, title ASC
  LOOP
    -- For children, get type from child itself so recursive call works correctly
    v_child := project_selector_tree(v_child_selector.selectorid, v_child_selector.type);
    IF v_child IS NOT NULL THEN
      v_children := v_children || jsonb_build_array(v_child);
    END IF;
  END LOOP;

  -- Build JSON for selector with children
  RETURN jsonb_build_object(
    'id', v_selector.selectorid,
    'title', v_selector.title,
    'type', v_selector.type,
    'parentselectorid', v_selector.parentselectorid,
    'txt', v_selector.txt,
    'order', v_selector.order,
    'children', v_children
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_selector_gettree
-- Description: Get selectors based on code or title from selectortype with hierarchical structure
-- This function returns selectors as a tree with all children
-- Note: This function only works for project schema
-- 
-- Parameters:
--   p_typeidentifier: code or title from selectortype
-- 
-- Logic:
--   1. Find selectortype based on code or title
--   2. Get root selectors (parentselectorid IS NULL)
--   3. Build hierarchical JSON using project_selector_tree
-- 
-- Returns:
--   Success: {success: true, title: "Selectors Retrieved", selectors: [...]}
--   Error: {success: false, title: "Type Not Found" | "Error", selectors: []}
-- 
-- Usage Example:
--   SELECT project_selector_gettree('province'); -- with code from project
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_selector_gettree"("p_typeidentifier" varchar)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_typeid INTEGER;
  v_selectors JSONB := '[]'::jsonb;
  v_root_selector RECORD;
  v_selector_json jsonb;
BEGIN
  -- Find selectortype based on code or title from project schema
  SELECT selectortypeid
  INTO v_typeid
  FROM project.selectortype
  WHERE code = p_typeidentifier OR title = p_typeidentifier
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Type Not Found',
      'message', 'Selector type not found.',
      'selectors', '[]'::json
    );
  END IF;

  -- Get root selectors (parentselectorid IS NULL) and build hierarchical JSON
  FOR v_root_selector IN
    SELECT selectorid, title, type, parentselectorid, txt, "order"
    FROM project.selector
    WHERE type = v_typeid AND parentselectorid IS NULL
    ORDER BY "order" ASC, title ASC
  LOOP
    v_selector_json := project_selector_tree(v_root_selector.selectorid, v_typeid);
    IF v_selector_json IS NOT NULL THEN
      v_selectors := v_selectors || jsonb_build_array(v_selector_json);
    END IF;
  END LOOP;

  -- If no root selector exists, return all selectors hierarchically
  -- (This happens when all selectors are children)
  IF v_selectors = '[]'::jsonb THEN
    FOR v_root_selector IN
      SELECT selectorid, title, type, parentselectorid, txt, "order"
      FROM project.selector
      WHERE type = v_typeid
      ORDER BY "order" ASC, title ASC
    LOOP
      v_selector_json := project_selector_tree(v_root_selector.selectorid, v_typeid);
      IF v_selector_json IS NOT NULL THEN
        v_selectors := v_selectors || jsonb_build_array(v_selector_json);
      END IF;
    END LOOP;
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Selectors Retrieved',
    'message', 'Selectors retrieved successfully.',
    'selectors', v_selectors
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error retrieving selectors.',
    'selectors', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_selector_get
-- Description: Get all selectors based on code or title from selectortype without hierarchical structure
-- This function returns selectors as a flat list (without children)
-- Note: This function only works for project schema
-- 
-- Parameters:
--   p_typeidentifier: code or title from selectortype
-- 
-- Logic:
--   1. Find selectortype based on code or title
--   2. Get all selectors without children
-- 
-- Returns:
--   Success: {success: true, title: "Selectors Retrieved", selectors: [...]}
--   Error: {success: false, title: "Type Not Found" | "Error", selectors: []}
-- 
-- Usage Example:
--   SELECT project_selector_get('province');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_selector_get"("p_typeidentifier" varchar)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_typeid INTEGER;
  v_selectors JSONB := '[]'::jsonb;
BEGIN
  -- Find selectortype based on code or title from project schema
  SELECT selectortypeid
  INTO v_typeid
  FROM project.selectortype
  WHERE code = p_typeidentifier OR title = p_typeidentifier
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Type Not Found',
      'message', 'Selector type not found.',
      'selectors', '[]'::json
    );
  END IF;

  -- Get all selectors without children from project schema
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', selectorid,
        'title', title,
        'type', type,
        'parentselectorid', parentselectorid,
        'txt', txt,
        'order', "order"
      ) ORDER BY "order" ASC, title ASC
    ),
    '[]'::jsonb
  )
  INTO v_selectors
  FROM project.selector
  WHERE type = v_typeid;

  RETURN json_build_object(
    'success', true,
    'title', 'Selectors Retrieved',
    'message', 'Selectors retrieved successfully.',
    'selectors', v_selectors
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error retrieving selectors.',
    'selectors', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_selector_getselector
-- Description: Get selectors based on code or title from selectortype and selectorid without hierarchical structure
-- This function returns child selectors of a specific selector
-- Note: This function only works for project schema
-- 
-- Parameters:
--   p_typeidentifier: code or title from selectortype
--   p_selectorid: Parent selector identifier
-- 
-- Logic:
--   1. Find selectortype based on code or title
--   2. Get selectors with condition type and parentselectorid
-- 
-- Returns:
--   Success: {success: true, title: "Selectors Retrieved", selectors: [...]}
--   Error: {success: false, title: "Type Not Found" | "Error", selectors: []}
-- 
-- Usage Example:
--   SELECT project_selector_getselector('city', 5); -- Cities of province with id=5 in project
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_selector_getselector"("p_typeidentifier" varchar, "p_selectorid" int4)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_typeid INTEGER;
  v_selectors JSONB := '[]'::jsonb;
BEGIN
  -- Find selectortype based on code or title from project schema
  SELECT selectortypeid
  INTO v_typeid
  FROM project.selectortype
  WHERE code = p_typeidentifier OR title = p_typeidentifier
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Type Not Found',
      'message', 'Selector type not found.',
      'selectors', '[]'::json
    );
  END IF;

  -- Get selectors with condition type and parentselectorid from project schema
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', selectorid,
        'title', title,
        'type', type,
        'parentselectorid', parentselectorid,
        'txt', txt,
        'order', "order"
      ) ORDER BY "order" ASC, title ASC
    ),
    '[]'::jsonb
  )
  INTO v_selectors
  FROM project.selector
  WHERE type = v_typeid AND parentselectorid = p_selectorid;

  RETURN json_build_object(
    'success', true,
    'title', 'Selectors Retrieved',
    'message', 'Selectors retrieved successfully.',
    'selectors', v_selectors
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error retrieving selectors.',
    'selectors', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_page_getsummaries
-- Description: Get page summaries with pagination and filter by status and lang
-- This function only returns summary fields (not full content)
-- 
-- Parameters:
--   p_limit: Number of page per page (pagination)
--   p_offset: Number of page to skip (pagination)
--   p_lang: Page language (1 = Persian, 2 = English) - Foreign Key to pelak.languages.id
-- 
-- Logic:
--   1. Filter page with status=1 (published) and specified lang
--   2. Sort by publishedtime DESC and id DESC
--   3. Apply limit and offset
-- 
-- Returns:
--   Success: {success: true, title: "Pages Retrieved", page: [...]}
--   Error: {success: false, title: "Error", page: []}
-- 
-- Usage Example:
--   SELECT pelak_page_getsummaries(10, 0, 1); -- First 10 Persian page
--   SELECT pelak_page_getsummaries(20, 20, 2); -- Pages 21-40 English
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_page_getsummaries"("p_limit" int4, "p_offset" int4, "p_lang" int2)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_page JSONB := '[]'::jsonb;
BEGIN
  -- Get page with specified conditions
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', pageid,
        'title', title,
        'description', description,
        'url', url,
        'modifiedtime', modifiedtime,
        'publishedtime', publishedtime,
        'media', media
      )
    ),
    '[]'::jsonb
  ) INTO v_page
  FROM (
    SELECT 
      pageid,
      title,
      description,
      url,
      modifiedtime,
      publishedtime,
      media
    FROM pelak.page
    WHERE status = 1 AND lang = p_lang
    ORDER BY publishedtime DESC, pageid DESC
    LIMIT p_limit
    OFFSET p_offset
  ) AS filtered_pages;

  RETURN json_build_object(
    'success', true,
    'title', 'Pages Retrieved',
    'message', 'صفحات با موفقیت خوانده شدند',
    'page', v_page
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در خواندن صفحه. بعدا تلاش کنید',
    'page', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_page_geturl
-- Description: Get complete information of a page based on URL
-- This function returns all page fields
-- 
-- Parameters:
--   p_url: Page URL
-- 
-- Logic:
--   1. Search page based on URL
--   2. Return all page fields
-- 
-- Returns:
--   Success: {success: true, title: "Page Retrieved", page: {...}}
--   Error: {success: false, title: "Page Not Found" | "Error", page: null}
-- 
-- Usage Example:
--   SELECT pelak_page_geturl('/about-us');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_page_geturl"("p_url" text)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_page JSONB;
BEGIN
  -- Get page based on URL
  SELECT jsonb_build_object(
    'id', pageid,
    'title', title,
    'description', description,
    'keywords', keywords,
    'content', content,
    'media', media,
    'url', url,
    'publishedtime', publishedtime,
    'modifiedtime', modifiedtime,
    'authors', authors,
    'sectionid', sectionid,
    'typeid', typeid,
    'tags', tags,
    'status', status,
    'lang', lang,
    'created', created,
    'updated', updated
  ) INTO v_page
  FROM pelak.page
  WHERE url = p_url
  LIMIT 1;

  IF v_page IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Page Not Found',
      'message', 'صفحه ای با این آدرس پیدا نشد',
      'page', NULL::json
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Page Retrieved',
    'message', 'صفحه با موفقیت خوانده شد',
    'page', v_page
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در خواندن صفحه. بعدا تلاش کنید',
    'page', NULL::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_page_getid
-- Description: Get complete information of a page based on ID
-- This function returns all page fields
-- 
-- Parameters:
--   p_id: Page identifier
-- 
-- Logic:
--   1. Search page based on ID
--   2. Return all page fields
-- 
-- Returns:
--   Success: {success: true, title: "Page Retrieved", page: {...}}
--   Error: {success: false, title: "Page Not Found" | "Error", page: null}
-- 
-- Usage Example:
--   SELECT pelak_page_getid(1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_page_getid"("p_id" int4)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_page JSONB;
BEGIN
  -- Get page based on ID
  SELECT jsonb_build_object(
    'id', pageid,
    'title', title,
    'description', description,
    'keywords', keywords,
    'content', content,
    'media', media,
    'url', url,
    'publishedtime', publishedtime,
    'modifiedtime', modifiedtime,
    'authors', authors,
    'sectionid', sectionid,
    'typeid', typeid,
    'tags', tags,
    'status', status,
    'lang', lang,
    'created', created,
    'updated', updated
  ) INTO v_page
  FROM pelak.page
  WHERE pageid = p_id
  LIMIT 1;

  IF v_page IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Page Not Found',
      'message', 'صفحه ای با این شناسه پیدا نشد',
      'page', NULL::json
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Page Retrieved',
    'message', 'صفحه با موفقیت خوانده شد',
    'page', v_page
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'خطا در خواندن صفحه. بعدا تلاش کنید',
    'page', NULL::json
  );
END;
$BODY$;

-- ============================================================================
-- ✅ All content functions have been created!
-- ============================================================================