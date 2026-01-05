-- ============================================================================
-- Module: Sequences (Shared)
-- Description: All sequences required for Auto Increment fields
-- This file must be executed before creating tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Drop existing sequences (if they exist)
-- This is done to reset sequences if needed
-- ----------------------------------------------------------------------------

DROP SEQUENCE IF EXISTS "pelak"."userrole_roleid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."user_userid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."refreshtoken_refreshtokenid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."userprofile_profileid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."pagesection_sectionid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."pagetype_typeid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."language_languageid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."page_pageid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."comments_commentid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "pelak"."commentlike_commentlikeid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "project"."selectortype_selectortypeid_seq" CASCADE;
DROP SEQUENCE IF EXISTS "project"."selector_selectorid_seq" CASCADE;

-- ----------------------------------------------------------------------------
-- Sequence: userrole_roleid_seq
-- Description: For Auto Increment of roleid field in userrole table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."userrole_roleid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."userrole_roleid_seq" OWNER TO "pelak_admin";


-- ----------------------------------------------------------------------------
-- Sequence: user_userid_seq
-- Description: For Auto Increment of userid field in user table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."user_userid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."user_userid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: refreshtoken_refreshtokenid_seq
-- Description: For Auto Increment of refreshtokenid field in refreshtoken table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."refreshtoken_refreshtokenid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."refreshtoken_refreshtokenid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: userprofile_profileid_seq
-- Description: For Auto Increment of profileid field in userprofile table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."userprofile_profileid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."userprofile_profileid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: pagesection_sectionid_seq
-- Description: For Auto Increment of sectionid field in pagesection table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."pagesection_sectionid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."pagesection_sectionid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: pagetype_typeid_seq
-- Description: For Auto Increment of typeid field in pagetype table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."pagetype_typeid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."pagetype_typeid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: language_languageid_seq
-- Description: For Auto Increment of languageid field in language table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."language_languageid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."language_languageid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: page_pageid_seq
-- Description: For Auto Increment of pageid field in page table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."page_pageid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."page_pageid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: comments_commentid_seq
-- Description: For Auto Increment of commentid field in comments table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."comments_commentid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."comments_commentid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: commentlike_commentlikeid_seq
-- Description: For Auto Increment of commentlikeid field in commentlike table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "pelak"."commentlike_commentlikeid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "pelak"."commentlike_commentlikeid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: project.selectortype_selectortypeid_seq
-- Description: For Auto Increment of selectortypeid field in project.selectortype table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "project"."selectortype_selectortypeid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "project"."selectortype_selectortypeid_seq" OWNER TO "pelak_admin";

-- ----------------------------------------------------------------------------
-- Sequence: project.selector_selectorid_seq
-- Description: For Auto Increment of selectorid field in project.selector table
-- ----------------------------------------------------------------------------
CREATE SEQUENCE "project"."selector_selectorid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "project"."selector_selectorid_seq" OWNER TO "pelak_admin";

-- ============================================================================
-- ✅ All sequences have been created!
-- ============================================================================