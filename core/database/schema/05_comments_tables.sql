-- ============================================================================
-- Module: Comments and Interactions
-- Description: Tables related to page comments and likes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: comments
-- Description: Page comments with tree structure (each comment can have replies)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."comments" (
  -- Unique comment identifier (Primary Key, Auto Increment)
  "commentid" int4 NOT NULL DEFAULT nextval('"pelak".comments_commentid_seq'::regclass),
  
  -- Comment author user identifier (Foreign Key → user.userid, Not Null)
  "userid" int4 NOT NULL,
  
  -- Related page identifier (Foreign Key → page.pageid)
  "pageid" int4,
  
  -- Parent comment identifier (Foreign Key → comments.commentid)
  -- NULL = this comment is root (not a reply to another comment)
  "parentid" int4,
  
  -- Comment content (Not Null)
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Comment approval status (Default: false)
  -- false = pending admin approval
  -- true = approved and visible
  "approved" bool DEFAULT false,
  
  -- Soft delete status (Default: false)
  -- true = deleted (soft delete)
  -- false = active
  "deleted" bool DEFAULT false,
  
  -- Comment creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last edit time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Comment importance level (0-100)
  -- For priority sorting and display
  -- Default: 0
  "importance" int4 DEFAULT 0,
  
  -- Primary Key
  CONSTRAINT "comments_pkey" PRIMARY KEY ("commentid"),
  
  -- Foreign Key: Related page (CASCADE on page deletion)
  CONSTRAINT "comments_pageid_fkey" FOREIGN KEY ("pageid") REFERENCES "pelak"."page" ("pageid") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: Parent comment (CASCADE on parent deletion)
  CONSTRAINT "comments_parentid_fkey" FOREIGN KEY ("parentid") REFERENCES "pelak"."comments" ("commentid") ON DELETE CASCADE ON UPDATE NO ACTION,
  
  -- Foreign Key: Comment author (CASCADE on user deletion)
  CONSTRAINT "comments_userid_fkey" FOREIGN KEY ("userid") REFERENCES "pelak"."user" ("userid") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Constraint: Limit importance to 0-100
  CONSTRAINT "comments_importance_check" CHECK ("importance" >= 0 AND "importance" <= 100)
);

ALTER TABLE "pelak"."comments" 
  OWNER TO "pelak_admin";

-- Index for quick search of comments of a page
CREATE INDEX "idx_comments_pageid" ON "pelak"."comments" USING btree (
  "pageid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index for quick search of comments of a user
CREATE INDEX "idx_comments_userid" ON "pelak"."comments" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index for quick search of replies to a comment
CREATE INDEX "idx_comments_parentid" ON "pelak"."comments" USING btree (
  "parentid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index for quick search of approved comments
CREATE INDEX "idx_comments_approved" ON "pelak"."comments" USING btree (
  "approved" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Index for quick search of non-deleted comments
CREATE INDEX "idx_pelak_comment_deleted" ON "pelak"."comments" USING btree (
  "deleted" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Index for faster sorting by importance
CREATE INDEX IF NOT EXISTS "idx_comments_importance" ON "pelak"."comments" USING btree (
  "importance" "pg_catalog"."int4_ops" DESC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- Table: commentlike
-- Description: User likes for comments
-- Each user can only like a comment once
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."commentlike" (
  -- Unique like identifier (Primary Key, Auto Increment)
  "commentlikeid" int4 NOT NULL DEFAULT nextval('"pelak".commentlike_commentlikeid_seq'::regclass),
  
  -- Liking user identifier (Foreign Key → user.userid, Not Null)
  "userid" int4 NOT NULL,
  
  -- Liked comment identifier (Foreign Key → comments.commentid, Not Null)
  "commentid" int4 NOT NULL,
  
  -- Like creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "commentlike_pkey" PRIMARY KEY ("commentlikeid"),
  
  -- Foreign Key: Liking user (CASCADE on user deletion)
  CONSTRAINT "commentlike_userid_fkey" FOREIGN KEY ("userid") REFERENCES "pelak"."user" ("userid") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Foreign Key: Liked comment (CASCADE on comment deletion)
  CONSTRAINT "commentlike_commentid_fkey" FOREIGN KEY ("commentid") REFERENCES "pelak"."comments" ("commentid") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Unique Constraint: Each user can only like a comment once
  CONSTRAINT "commentlike_user_comment_unique" UNIQUE ("userid", "commentid")
);

ALTER TABLE "pelak"."commentlike" 
  OWNER TO "pelak_admin";

-- Index for quick search of likes of a user
CREATE INDEX "idx_commentlike_userid" ON "pelak"."commentlike" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index for quick search of likes of a comment
CREATE INDEX "idx_commentlike_commentid" ON "pelak"."commentlike" USING btree (
  "commentid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Composite Index for quick search of a user's like for a specific comment
CREATE INDEX "idx_commentlike_user_comment" ON "pelak"."commentlike" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST,
  "commentid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ============================================================================
-- ✅ All comments tables have been created!
-- ============================================================================