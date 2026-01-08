-- ============================================================================
-- Module: Project Tables (project schema)
-- Description: Project-specific tables including selectors and user additional information
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: selectortype (Project)
-- Description: Project-specific selector types (like province, city, education degree, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "project"."selectortype" (
  -- Unique selector type identifier (Primary Key, Auto Increment)
  "selectortypeid" int4 NOT NULL DEFAULT nextval('"project".selectortype_selectortypeid_seq'::regclass),
  
  -- Selector type title
  "title" varchar(50) COLLATE "pg_catalog"."default",
  
  -- Short selector type code (2 characters)
  "code" varchar(2) COLLATE "pg_catalog"."default",
  
  -- Primary Key
  CONSTRAINT "selectortype_pkey" PRIMARY KEY ("selectortypeid")
);

ALTER TABLE "project"."selectortype" 
  OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Indexes for project.selectortype table
-- Description: Optimize queries for selector type lookups
-- ----------------------------------------------------------------------------

-- Index for filtering by code (used in all selector functions)
-- Used in: project_selector_gettree, project_selector_get, project_selector_getselector
CREATE INDEX IF NOT EXISTS "idx_selectortype_code" 
ON "project"."selectortype" USING btree ("code" ASC NULLS LAST);

-- Index for filtering by title (used in all selector functions)
-- Used in: project_selector_gettree, project_selector_get, project_selector_getselector
CREATE INDEX IF NOT EXISTS "idx_selectortype_title" 
ON "project"."selectortype" USING btree ("title" ASC NULLS LAST);

-- ----------------------------------------------------------------------------
-- Table: selector (Project)
-- Description: Hierarchical selectors specific to the project
-- Each selector can have a parent (selectorid) for tree structure
-- Example: Province → City, Education Degree → Field of Study
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "project"."selector" (
  -- Unique selector identifier (Primary Key, Auto Increment)
  "selectorid" int4 NOT NULL DEFAULT nextval('"project".selector_selectorid_seq'::regclass),
  
  -- Selector title
  "title" varchar(120) COLLATE "pg_catalog"."default",
  
  -- Selector type (Foreign Key → project.selectortype.selectortypeid)
  "type" int4,
  
  -- Parent selector identifier (Foreign Key → project.selector.selectorid)
  -- NULL = this selector is root (no parent)
  "parentselectorid" int4,
  
  -- Additional description text
  "txt" text COLLATE "pg_catalog"."default",
  
  -- Order number for sorting
  "order" int4,
  
  -- Primary Key
  CONSTRAINT "selector_pkey" PRIMARY KEY ("selectorid"),
  
  -- Foreign Key: Parent selector (CASCADE on deletion)
  CONSTRAINT "selector_parentselectorid_fkey" FOREIGN KEY ("parentselectorid") REFERENCES "project"."selector" ("selectorid") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: Selector type (CASCADE on deletion)
  CONSTRAINT "selector_type_fkey" FOREIGN KEY ("type") REFERENCES "project"."selectortype" ("selectortypeid") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "project"."selector" 
  OWNER TO "htni_admin";

-- ----------------------------------------------------------------------------
-- Indexes for project.selector table
-- Description: Optimize queries for hierarchical selector lookups
-- ----------------------------------------------------------------------------

-- Index for filtering by type (most common query pattern)
-- Used in: project_selector_get, project_selector_gettree, project_selector_getselector
CREATE INDEX IF NOT EXISTS "idx_selector_type" 
ON "project"."selector" USING btree ("type" ASC NULLS LAST);

-- Index for filtering by parent selector (hierarchical queries)
-- Used in: project_selector_tree, project_selector_getselector
-- Also optimizes foreign key checks from useradditionalinfo
CREATE INDEX IF NOT EXISTS "idx_selector_parentselectorid" 
ON "project"."selector" USING btree ("parentselectorid" ASC NULLS LAST);

-- Composite index for filtering by type AND parentselectorid
-- Used in: project_selector_getselector (WHERE type = ... AND parentselectorid = ...)
-- This index covers both conditions efficiently
CREATE INDEX IF NOT EXISTS "idx_selector_type_parentselectorid" 
ON "project"."selector" USING btree ("type" ASC NULLS LAST, "parentselectorid" ASC NULLS LAST);

-- Composite index for filtering by type with ordering
-- Used in: project_selector_get, project_selector_gettree (WHERE type = ... ORDER BY order, title)
-- This covering index includes order and title to avoid table lookups
CREATE INDEX IF NOT EXISTS "idx_selector_type_order_title" 
ON "project"."selector" USING btree ("type" ASC NULLS LAST, "order" ASC NULLS LAST, "title" ASC NULLS LAST);

-- Composite index for filtering by parentselectorid with ordering
-- Used in: project_selector_tree (WHERE parentselectorid = ... ORDER BY order, title)
-- This covering index includes order and title to avoid table lookups
CREATE INDEX IF NOT EXISTS "idx_selector_parentselectorid_order_title" 
ON "project"."selector" USING btree ("parentselectorid" ASC NULLS LAST, "order" ASC NULLS LAST, "title" ASC NULLS LAST);

-- Partial index for filtering by type where parentselectorid IS NULL (root selectors)
-- Used in: project_selector_gettree (WHERE type = ... AND parentselectorid IS NULL)
-- Partial index is more efficient for NULL checks and smaller index size
CREATE INDEX IF NOT EXISTS "idx_selector_type_root" 
ON "project"."selector" USING btree ("type" ASC NULLS LAST, "order" ASC NULLS LAST, "title" ASC NULLS LAST)
WHERE "parentselectorid" IS NULL;

-- ----------------------------------------------------------------------------
-- Table: useradditionalinfo
-- Description: User additional information specific to this project
-- This table has one record per user (one-to-one with user)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "project"."useradditionalinfo" (
  -- Using userid as Primary Key to ensure uniqueness
  "userid" int4 NOT NULL,
  
  -- User national code
  "nationalcode" char(10) COLLATE "pg_catalog"."default",
  
  -- Birth date (format: YYYY-MM-DD)
  "birthday" varchar(10) COLLATE "pg_catalog"."default",
  
  -- Marital status (true = married, false = single)
  "married" bool,
  
  -- Gender (true = male, false = female)
  "gender" bool,
  
  -- Country identifier (Foreign Key → project.selector.id)
  "countryid" int4 ,
  
  -- Province identifier (Foreign Key → project.selector.id)
  "provinceid" int4,
  
  -- City identifier (Foreign Key → project.selector.id)
  "cityid" int4,
  
  -- Residential address
  "address" text COLLATE "pg_catalog"."default",
  
  -- Job
  "job" text COLLATE "pg_catalog"."default",
  
  -- Skills
  "skills" text COLLATE "pg_catalog"."default",
  
  -- Political orientation
  "political" text COLLATE "pg_catalog"."default",
  
  -- Motivation
  "motivation" text COLLATE "pg_catalog"."default",
  
  -- How known
  "howknown" varchar(150) COLLATE "pg_catalog"."default",
  
  -- Collaboration type
  "collaboration" varchar(100) COLLATE "pg_catalog"."default",
  
  -- Education degree identifier (Foreign Key → project.selector.id)
  "degreeid" int4,
  
  -- Study place identifier (Foreign Key → project.selector.id)
  "studyplaceid" int4,
  
  -- Study place type identifier (Foreign Key → project.selector.id)
  "studyplacetypeid" int4,
  
  -- Field of study identifier (Foreign Key → project.selector.id)
  "studyfieldsid" int4,
  
  -- Consent (Default: false)
  "consent" bool DEFAULT false,
  
  -- Form completion time (NULL = form not completed)
  "formdone" timestamp(6),
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "useradditionalinfo_pkey" PRIMARY KEY ("userid"),
  
  -- Foreign Key: User (CASCADE on user deletion)
  CONSTRAINT "useradditionalinfo_userid_fkey" FOREIGN KEY ("userid") REFERENCES "pelak"."user" ("userid") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: Country (CASCADE on selector deletion)
  CONSTRAINT "useradditionalinfo_countryid_fkey" FOREIGN KEY ("countryid") REFERENCES "project"."selector" ("selectorid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: Province (CASCADE on selector deletion)
  CONSTRAINT "useradditionalinfo_provinceid_fkey" FOREIGN KEY ("provinceid") REFERENCES "project"."selector" ("selectorid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: City (CASCADE on selector deletion)
  CONSTRAINT "useradditionalinfo_cityid_fkey" FOREIGN KEY ("cityid") REFERENCES "project"."selector" ("selectorid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: Education degree (CASCADE on selector deletion)
  CONSTRAINT "useradditionalinfo_degreeid_fkey" FOREIGN KEY ("degreeid") REFERENCES "project"."selector" ("selectorid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: Study place (CASCADE on selector deletion)
  CONSTRAINT "useradditionalinfo_studyplaceid_fkey" FOREIGN KEY ("studyplaceid") REFERENCES "project"."selector" ("selectorid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: Study place type (CASCADE on selector deletion)
  CONSTRAINT "useradditionalinfo_studyplacetypeid_fkey" FOREIGN KEY ("studyplacetypeid") REFERENCES "project"."selector" ("selectorid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: Field of study (CASCADE on selector deletion)
  CONSTRAINT "useradditionalinfo_studyfieldsid_fkey" FOREIGN KEY ("studyfieldsid") REFERENCES "project"."selector" ("selectorid") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "project"."useradditionalinfo" 
  OWNER TO "htni_admin";

-- Index for quick search by province
CREATE INDEX "idx_useradditionalinfo_provinceid" ON "project"."useradditionalinfo" USING btree (
  "provinceid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index for quick search by city
CREATE INDEX "idx_useradditionalinfo_cityid" ON "project"."useradditionalinfo" USING btree (
  "cityid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index for checking duplicate national code
-- Used in: project_user_additionala (WHERE nationalcode = ... AND userid != ...)
CREATE INDEX IF NOT EXISTS "idx_useradditionalinfo_nationalcode" 
ON "project"."useradditionalinfo" USING btree ("nationalcode" ASC NULLS LAST);

-- ============================================================================
-- ✅ All project tables have been created!
-- ============================================================================