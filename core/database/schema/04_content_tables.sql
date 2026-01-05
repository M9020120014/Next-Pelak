-- ============================================================================
-- Module: Content Management
-- Description: Tables related to site pages
-- These tables depend on user and pagesection and pagetype and language and must be created after them
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: page
-- Description: Site pages
-- Each page can have author, section and type
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."page" (
  -- Unique page identifier (Primary Key, Auto Increment)
  "pageid" int4 NOT NULL DEFAULT nextval('"pelak".page_pageid_seq'::regclass),
  
  -- Page title
  "title" varchar(200) COLLATE "pg_catalog"."default",
  
  -- Short page description (for SEO and preview)
  "description" varchar(300) COLLATE "pg_catalog"."default",
  
  -- Keywords (for SEO)
  "keywords" varchar(100) COLLATE "pg_catalog"."default",
  
  -- Full page content (HTML or Markdown)
  "content" text COLLATE "pg_catalog"."default",
  
  -- Media links (images, videos, etc.) - JSON or comma-separated
  "media" text COLLATE "pg_catalog"."default",
  
  -- Unique page URL (Unique, Not Null)
  -- For accessing page through URL
  "url" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Publication date
  "publishedtime" date,
  
  -- Last modification date
  "modifiedtime" date,
  
  -- Author identifier (Foreign Key → user.userid)
  "authors" int4,
  
  -- Section identifier (Foreign Key → pagesection.sectionid)
  -- For page categorization
  "sectionid" int4,
  
  -- Page type identifier (Foreign Key → pagetype.typeid)
  -- For distinguishing page types (article, news, etc.)
  "typeid" int4,
  
  -- Page tags (comma-separated)
  "tags" varchar(300) COLLATE "pg_catalog"."default",
  
  -- Page status (0 = draft, 1 = published, 2 = archived)
  "status" int2,
  
  -- Page language (Foreign Key → language.languageid) (1 = Persian, 2 = English)
  "lang" int2,
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "page_pkey" PRIMARY KEY ("pageid"),
  
  -- Unique Constraint: Each URL can only exist once
  CONSTRAINT "page_url_key" UNIQUE ("url"),
  
  -- Foreign Key: Author (CASCADE on user deletion)
  CONSTRAINT "page_authors_fkey" FOREIGN KEY ("authors") REFERENCES "pelak"."user" ("userid") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: Section (SET NULL on deletion)
  CONSTRAINT "page_sectionid_fkey" FOREIGN KEY ("sectionid") REFERENCES "pelak"."pagesection" ("sectionid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: Page type (SET NULL on deletion)
  CONSTRAINT "page_typeid_fkey" FOREIGN KEY ("typeid") REFERENCES "pelak"."pagetype" ("typeid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: Page language (SET NULL on deletion)
  CONSTRAINT "page_lang_fkey" FOREIGN KEY ("lang") REFERENCES "pelak"."language" ("languageid") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "pelak"."page" 
  OWNER TO "htni_admin";

-- ============================================================================
-- ✅ All content tables have been created!
-- ============================================================================