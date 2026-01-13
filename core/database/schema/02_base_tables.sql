-- ============================================================================
-- Module: Base Tables
-- Description: Base system tables including user, userrole, userprofile, pagesection, pagetype, language
-- These tables must be created before other tables because other tables depend on them
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: userrole
-- Description: User roles in the system
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."userrole" (
  -- Unique role identifier (Primary Key, Auto Increment)
  "roleid" int4 NOT NULL DEFAULT nextval('"pelak".userrole_roleid_seq'::regclass),
  
  -- Role title
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Role description
  "description" text COLLATE "pg_catalog"."default",
  
  -- Order number for sorting
  "order" int4,
  
  -- Active/inactive status (Default: true)
  "active" bool DEFAULT true,
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "userrole_pkey" PRIMARY KEY ("roleid")
);

ALTER TABLE "pelak"."userrole" 
  OWNER TO "htni_admin";

-- Index for quick search of active roles
CREATE INDEX "idx_userrole_active" ON "pelak"."userrole" USING btree (
  "active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- Table: userprofile
-- Description: Default profile images for users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."userprofile" (
  -- Unique image identifier (Primary Key, Auto Increment)
  "profileid" int4 NOT NULL DEFAULT nextval('"pelak".userprofile_profileid_seq'::regclass),
  
  -- Image title
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Image description
  "description" text COLLATE "pg_catalog"."default",
  
  -- Image URL or path
  "imageurl" text COLLATE "pg_catalog"."default",
  
  -- Order number for sorting
  "order" int4,
  
  -- Active/inactive status (Default: true)
  "active" bool DEFAULT true,
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "userprofile_pkey" PRIMARY KEY ("profileid")
);

ALTER TABLE "pelak"."userprofile" 
  OWNER TO "htni_admin";

-- Index for quick search of active images
CREATE INDEX "idx_userprofile_active" ON "pelak"."userprofile" USING btree (
  "active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- Table: pagesection
-- Description: Page sections of the site (page category)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."pagesection" (
  -- Unique section identifier (Primary Key, Auto Increment)
  "sectionid" int4 NOT NULL DEFAULT nextval('"pelak".pagesection_sectionid_seq'::regclass),
  
  -- Section title
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Section description
  "description" text COLLATE "pg_catalog"."default",
  
  -- Order number for sorting
  "order" int4,
  
  -- Active/inactive status (Default: true)
  "active" bool DEFAULT true,
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "pagesection_pkey" PRIMARY KEY ("sectionid")
);

ALTER TABLE "pelak"."pagesection" 
  OWNER TO "htni_admin";

-- Index for quick search of active sections
CREATE INDEX "idx_pagesection_active" ON "pelak"."pagesection" USING btree (
  "active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- Table: pagetype
-- Description: Page types of the site (article, news, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."pagetype" (
  -- Unique page type identifier (Primary Key, Auto Increment)
  "typeid" int4 NOT NULL DEFAULT nextval('"pelak".pagetype_typeid_seq'::regclass),
  
  -- Page type title
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Page type description
  "description" text COLLATE "pg_catalog"."default",
  
  -- Order number for sorting
  "order" int4,
  
  -- Active/inactive status (Default: true)
  "active" bool DEFAULT true,
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "pagetype_pkey" PRIMARY KEY ("typeid")
);

ALTER TABLE "pelak"."pagetype" 
  OWNER TO "htni_admin";

-- Index for quick search of active page types
CREATE INDEX "idx_pagetype_active" ON "pelak"."pagetype" USING btree (
  "active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- Table: language
-- Description: System languages (Persian, English, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."language" (
  -- Unique language identifier (Primary Key, Auto Increment)
  "languageid" int4 NOT NULL DEFAULT nextval('"pelak".language_languageid_seq'::regclass),
  
  -- Language code (e.g., fa, en) - Unique
  "code" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Language title
  "title" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Language description
  "description" text COLLATE "pg_catalog"."default",
  
  -- Order number for sorting
  "order" int4,
  
  -- Active/inactive status (Default: true)
  "active" bool DEFAULT true,
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "language_pkey" PRIMARY KEY ("languageid"),
  
  -- Unique Constraint: Each language code can only exist once
  CONSTRAINT "language_code_key" UNIQUE ("code")
);

ALTER TABLE "pelak"."language" 
  OWNER TO "htni_admin";

-- Index for quick search of active languages
CREATE INDEX "idx_language_active" ON "pelak"."language" USING btree (
  "active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Index for quick search by language code
CREATE INDEX "idx_language_code" ON "pelak"."language" USING btree (
  "code" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ============================================================================
-- ✅ All base tables have been created!
-- ============================================================================