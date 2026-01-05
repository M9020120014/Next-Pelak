-- ============================================================================
-- Module: Comments and Interactions Functions
-- Description: Functions related to managing page comments and likes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: pelak_comment_get
-- Description: Get comments of a page with tree structure
-- Only returns approved and non-deleted comments
-- Supports sorting: time_desc, time_asc, likes_desc, importance_desc
-- 
-- Parameters:
--   p_pageid: Page identifier
--   p_sort_type: Sort type (default: 'time_desc')
--     - 'time_desc': Newest first (default)
--     - 'time_asc': Oldest first
--     - 'likes_desc': Most likes first
--     - 'importance_desc': Highest importance first
--   p_userid: User identifier (optional) - for displaying user like status
-- 
-- Logic:
--   1. Get all approved and non-deleted comments
--   2. Count likes for each comment
--   3. Check user like (if p_userid specified)
--   4. Sort based on p_sort_type
-- 
-- Returns:
--   Success: {success: true, title: "Comments Retrieved", comments: [...]}
--   Error: {success: false, title: "Error", comments: []}
-- 
-- Usage Example:
--   SELECT pelak_comment_get(1, 'time_desc', 5);
--   SELECT pelak_comment_get(1, 'likes_desc', NULL);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_comment_get"(
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
  -- Get all approved and non-deleted comments for this page with like counts
  -- Sort based on requested type
  IF p_sort_type = 'time_asc' THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.commentid,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'approved', c.approved,
          'deleted', c.deleted,
          'created', c.created,
          'updated', c.updated,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY c.created ASC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.commentlike
      GROUP BY commentid
    ) likes ON c.commentid = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.commentlike
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.commentid = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.approved = true
      AND c.deleted = false;
  ELSIF p_sort_type = 'likes_desc' THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.commentid,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'approved', c.approved,
          'deleted', c.deleted,
          'created', c.created,
          'updated', c.updated,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY COALESCE(likes.likes_count, 0) DESC, c.created DESC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.commentlike
      GROUP BY commentid
    ) likes ON c.commentid = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.commentlike
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.commentid = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.approved = true
      AND c.deleted = false;
  ELSIF p_sort_type = 'importance_desc' THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.commentid,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'approved', c.approved,
          'deleted', c.deleted,
          'created', c.created,
          'updated', c.updated,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY COALESCE(c.importance, 0) DESC, c.created DESC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.commentlike
      GROUP BY commentid
    ) likes ON c.commentid = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.commentlike
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.commentid = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.approved = true
      AND c.deleted = false;
  ELSE -- time_desc (default)
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.commentid,
          'userid', c.userid,
          'pageid', c.pageid,
          'parentid', c.parentid,
          'content', c.content,
          'approved', c.approved,
          'deleted', c.deleted,
          'created', c.created,
          'updated', c.updated,
          'importance', COALESCE(c.importance, 0),
          'likes_count', COALESCE(likes.likes_count, 0),
          'user_liked', COALESCE(user_like.user_liked, false)
        ) ORDER BY c.created DESC
      ),
      '[]'::jsonb
    ) INTO v_comments
    FROM pelak.comments c
    LEFT JOIN (
      SELECT 
        commentid,
        COUNT(*)::int4 as likes_count
      FROM pelak.commentlike
      GROUP BY commentid
    ) likes ON c.commentid = likes.commentid
    LEFT JOIN (
      SELECT 
        commentid,
        true as user_liked
      FROM pelak.commentlike
      WHERE p_userid IS NOT NULL AND userid = p_userid
    ) user_like ON c.commentid = user_like.commentid
    WHERE c.pageid = p_pageid
      AND c.approved = true
      AND c.deleted = false;
  END IF;

  RETURN json_build_object(
    'success', true,
    'title', 'Comments Retrieved',
    'message', 'Comments retrieved successfully.',
    'comments', v_comments
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error retrieving comments.',
    'comments', '[]'::json
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_comment_create
-- Description: Create new comment
-- 
-- Parameters:
--   p_userid: Author user identifier
--   p_pageid: Page identifier
--   p_content: Comment content
--   p_parentid: Parent comment identifier (optional) - for replying to another comment
-- 
-- Logic:
--   1. Check if page exists
--   2. Check if user exists and is active
--   3. Check if parent comment exists (if p_parentid specified)
--   4. Check content is not empty
--   5. Create new comment with isapproved=true (requires admin approval)
-- 
-- Returns:
--   Success: {success: true, title: "Comment Created", message: "...", comment_id: ...}
--   Error: {success: false, title: "Page Not Found" | "User Not Found" | "Parent Comment Not Found" | "Invalid Content" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_comment_create(1, 5, 'My comment', NULL); -- New comment
--   SELECT pelak_comment_create(1, 5, 'My reply', 10); -- Reply to comment with id=10
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_comment_create"(
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
  -- Check if page exists
  SELECT EXISTS(SELECT 1 FROM pelak.page WHERE pageid = p_pageid) INTO v_page_exists;
  IF NOT v_page_exists THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Page Not Found',
      'message', 'Page not found.'
    );
  END IF;

  -- Check if user exists
  IF NOT EXISTS(SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- If parentid specified, check if it exists
  IF p_parentid IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM pelak.comments 
      WHERE commentid = p_parentid 
        AND pageid = p_pageid 
        AND deleted = false
    ) INTO v_parent_exists;
    IF NOT v_parent_exists THEN
      RETURN json_build_object(
        'success', false,
        'title', 'Parent Comment Not Found',
        'message', 'Parent comment not found.'
      );
    END IF;
  END IF;

  -- Check content
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Content',
      'message', 'Content cannot be empty.'
    );
  END IF;

  -- Create new comment (approved by default)
  INSERT INTO pelak.comments (
    userid,
    pageid,
    parentid,
    content,
    approved,
    deleted,
    created,
    updated
  ) VALUES (
    p_userid,
    p_pageid,
    p_parentid,
    trim(p_content),
    true, -- Requires admin approval
    false,
    NOW(),
    NOW()
  ) RETURNING commentid INTO v_comment_id;

  RETURN json_build_object(
    'success', true,
    'title', 'Comment Created',
    'message', 'Comment created successfully and pending approval.',
    'comment_id', v_comment_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error creating comment.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_comment_update
-- Description: Update comment (only by author)
-- 
-- Parameters:
--   p_commentid: Comment identifier
--   p_userid: User identifier (for ownership check)
--   p_content: New content
-- 
-- Logic:
--   1. Check if comment exists and is not deleted
--   2. Check ownership (only author can edit)
--   3. Check content is not empty
--   4. Update content and updatedat
-- 
-- Returns:
--   Success: {success: true, title: "Comment Updated", message: "..."}
--   Error: {success: false, title: "Comment Not Found" | "Permission Denied" | "Invalid Content" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_comment_update(10, 1, 'New content');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_comment_update"(
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
  -- Check comment existence and ownership
  SELECT userid INTO v_comment_owner
  FROM pelak.comments
  WHERE commentid = p_commentid
    AND deleted = false;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Comment Not Found',
      'message', 'Comment not found.'
    );
  END IF;

  -- Check ownership
  IF v_comment_owner != p_userid THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Permission Denied',
      'message', 'You do not have permission to edit this comment.'
    );
  END IF;

  -- Check content
  IF p_content IS NULL OR trim(p_content) = '' THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Invalid Content',
      'message', 'Content cannot be empty.'
    );
  END IF;

  -- Update comment
  UPDATE pelak.comments
  SET content = trim(p_content),
      updated = NOW()
  WHERE commentid = p_commentid;

  RETURN json_build_object(
    'success', true,
    'title', 'Comment Updated',
    'message', 'Comment updated successfully.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error updating comment.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_comment_delete
-- Description: Soft delete comment (only by author)
-- 
-- Parameters:
--   p_commentid: Comment identifier
--   p_userid: User identifier (for ownership check)
-- 
-- Logic:
--   1. Check if comment exists and is not deleted
--   2. Check ownership (only author can delete)
--   3. Soft delete (set isdeleted = true)
-- 
-- Returns:
--   Success: {success: true, title: "Comment Deleted", message: "..."}
--   Error: {success: false, title: "Comment Not Found" | "Permission Denied" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_comment_delete(10, 1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_comment_delete"(
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
  -- Check comment existence and ownership
  SELECT userid INTO v_comment_owner
  FROM pelak.comments
  WHERE commentid = p_commentid
    AND deleted = false;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Comment Not Found',
      'message', 'Comment not found.'
    );
  END IF;

  -- Check ownership
  IF v_comment_owner != p_userid THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Permission Denied',
      'message', 'You do not have permission to delete this comment.'
    );
  END IF;

  -- Soft delete
  UPDATE pelak.comments
  SET deleted = true,
      updated = NOW()
  WHERE commentid = p_commentid;

  RETURN json_build_object(
    'success', true,
    'title', 'Comment Deleted',
    'message', 'Comment deleted successfully.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error deleting comment.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: pelak_comment_toggle
-- Description: Like or unlike a comment (toggle)
-- If user has already liked, like is removed (unlike)
-- If user has not liked, like is added
-- 
-- Parameters:
--   p_userid: User identifier
--   p_commentid: Comment identifier
-- 
-- Logic:
--   1. Check if comment exists and is approved
--   2. Check if user exists and is active
--   3. Check if previous like exists
--   4. If exists: Remove like (unlike)
--   5. If not exists: Add like
--   6. Count number of likes
-- 
-- Returns:
--   Success: {success: true, title: "Comment Liked" | "Comment Unliked", message: "...", liked: true|false, likes_count: ...}
--   Error: {success: false, title: "Comment Not Found" | "User Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_comment_toggle(1, 10);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_comment_toggle"(
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
  -- Check if comment exists
  SELECT EXISTS(
    SELECT 1 FROM pelak.comments 
    WHERE commentid = p_commentid 
      AND deleted = false
      AND approved = true
  ) INTO v_comment_exists;

  IF NOT v_comment_exists THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Comment Not Found',
      'message', 'Comment not found or not approved.'
    );
  END IF;

  -- Check if user exists
  SELECT EXISTS(
    SELECT 1 FROM pelak.user 
    WHERE userid = p_userid 
      AND active = true
  ) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM pelak.commentlike
    WHERE userid = p_userid 
      AND commentid = p_commentid
  ) INTO v_like_exists;

  IF v_like_exists THEN
    -- Remove like (unlike)
    DELETE FROM pelak.commentlike
    WHERE userid = p_userid 
      AND commentid = p_commentid;
    
    v_liked := false;
  ELSE
    -- Add like
    INSERT INTO pelak.commentlike (userid, commentid, created)
    VALUES (p_userid, p_commentid, NOW());
    
    v_liked := true;
  END IF;

  -- Count number of likes
  SELECT COUNT(*)::int4 INTO v_likes_count
  FROM pelak.commentlike
  WHERE commentid = p_commentid;

  RETURN json_build_object(
    'success', true,
    'title', CASE WHEN v_liked THEN 'Comment Liked' ELSE 'Comment Unliked' END,
    'message', CASE WHEN v_liked THEN 'Comment liked.' ELSE 'Comment like removed.' END,
    'liked', v_liked,
    'likes_count', v_likes_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error toggling comment like.'
  );
END;
$BODY$;

-- ============================================================================
-- ✅ All comment functions have been created!
-- ============================================================================