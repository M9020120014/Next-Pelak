-- ============================================================================
-- Module: Authentication and User Management
-- Description: Tables related to users and authentication token management
-- These tables depend on userrole and userprofile and must be created after them
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: user
-- Description: System user information
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "pelak"."user" (
  -- Unique user identifier (Primary Key, Auto Increment)
  "userid" int4 NOT NULL DEFAULT nextval('"pelak".user_userid_seq'::regclass),
  
  -- User mobile number (Unique, Not Null) - for login and authentication
  "mobile" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Password hashed with bcrypt (Not Null)
  -- Value 'hasNoPassword' for users who have not set a password yet
  "userpassword" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  
  -- User first name
  "firstname" varchar(50) COLLATE "pg_catalog"."default",
  
  -- User last name
  "lastname" varchar(50) COLLATE "pg_catalog"."default",
  
  -- Registration date (Default: current time)
  "register" timestamptz(6) DEFAULT now(),
  
  -- Last successful login time
  "lastlogin" timestamptz(6),
  
  -- Number of failed login attempts (Default: 0)
  -- After 5 failed attempts, account is locked
  "failedattempt" int4 DEFAULT 0,
  
  -- Active/inactive account status (Default: true)
  "active" bool DEFAULT true,
  
  -- User email address (optional)
  "email" varchar(100) COLLATE "pg_catalog"."default",
  
  -- OTP secret key for verification (temporary, only during registration process)
  -- Becomes null after password is set
  "otpsecret" varchar(32) COLLATE "pg_catalog"."default",
  
  -- Last password change time (Default: current time)
  "passwordchanged" timestamptz(6) DEFAULT now(),
  
  -- Account lock time (NULL = not locked)
  -- After 5 failed attempts, locked for 15 minutes
  "lockeduntil" timestamptz(6),
  
  -- Record creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Last update time (Default: current time)
  "updated" timestamptz(6) DEFAULT now(),
  
  -- Profile image identifier from default image list (Foreign Key → pelak.userprofile.id)
  -- Image is selected from pelak default image list
  "profileimageid" int4,
  
  -- Profile image URL from external system
  -- This field is filled if image is uploaded from another system
  "profileimageurl" text COLLATE "pg_catalog"."default",
  
  -- User role identifier (Foreign Key → pelak.userrole.roleid)
  -- Role is selected from userrole table
  "roleid" int4,
  
  -- Primary Key
  CONSTRAINT "user_pkey" PRIMARY KEY ("userid"),
  
  -- Unique Constraint: Each mobile number can only be registered once
  CONSTRAINT "user_mobile_key" UNIQUE ("mobile"),
  
  -- Foreign Key: Profile image from userprofile table (SET NULL on delete)
  CONSTRAINT "user_profileimageid_fkey" FOREIGN KEY ("profileimageid") REFERENCES "pelak"."userprofile" ("profileid") ON DELETE SET NULL ON UPDATE CASCADE,
  
  -- Foreign Key: User role from userrole table (SET NULL on delete)
  CONSTRAINT "user_roleid_fkey" FOREIGN KEY ("roleid") REFERENCES "pelak"."userrole" ("roleid") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "pelak"."user" 
  OWNER TO "pelak_admin";

-- Index for quick search of active users
CREATE INDEX "idx_user_active" ON "pelak"."user" USING btree (
  "active" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- Unique Index for quick search by mobile number
CREATE UNIQUE INDEX "idx_user_mobile" ON "pelak"."user" USING btree (
  "mobile" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- Index for quick search by profile image
CREATE INDEX "idx_user_profileimageid" ON "pelak"."user" USING btree (
  "profileimageid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- Index for quick search by user role
CREATE INDEX "idx_user_roleid" ON "pelak"."user" USING btree (
  "roleid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- Table: refreshtoken
-- Description: Only active tokens (expiresat > NOW() and revokedat IS NULL)
-- This table keeps only active tokens for better performance
-- Expired or revoked tokens are moved to history table
-- ----------------------------------------------------------------------------
CREATE TABLE "pelak"."refreshtoken" (
  -- Unique token identifier (Primary Key, Auto Increment)
  "refreshtokenid" int4 NOT NULL DEFAULT nextval('"pelak".refreshtoken_refreshtokenid_seq'::regclass),
  
  -- Token hashed with SHA-256 (Unique, Not Null)
  -- Plain text token is never stored in database
  "tokenhash" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Token owner user identifier (Foreign Key → user.userid)
  "userid" int4 NOT NULL,
  
  -- Unique device identifier (like browser fingerprint)
  -- Each user can have multiple active tokens for different devices
  "idevice" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Token expiration time (Not Null)
  -- Usually 7 days from creation time
  "expiresat" timestamptz(6) NOT NULL,
  
  -- Token creation time (Default: current time)
  "created" timestamptz(6) DEFAULT now(),
  
  -- Token revocation time (NULL = active)
  -- This field is set on logout or rotation
  "revokedat" timestamptz(6),
  
  -- Last token usage time
  -- This field is updated on each refresh
  "lastusedat" timestamptz(6),
  
  -- Last used IP address (inet type)
  -- For audit and suspicious activity detection
  "lastusedip" inet,
  
  -- Primary Key
  CONSTRAINT "refreshtoken_pkey" PRIMARY KEY ("refreshtokenid"),
  
  -- Foreign Key: Cascade delete on user deletion
  CONSTRAINT "refreshtoken_userid_fkey" FOREIGN KEY ("userid") REFERENCES "pelak"."user" ("userid") ON DELETE CASCADE ON UPDATE NO ACTION,
  
  -- Unique Constraint: Each token hash can only exist once
  CONSTRAINT "refreshtoken_tokenhash_key" UNIQUE ("tokenhash")
);

ALTER TABLE "pelak"."refreshtoken" 
  OWNER TO "pelak_admin";

-- Index for quick search of expired tokens
CREATE INDEX "idx_refreshtoken_expiresat" ON "pelak"."refreshtoken" USING btree (
  "expiresat" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- Unique Index for quick search by token hash
CREATE INDEX "idx_refreshtoken_tokenhash" ON "pelak"."refreshtoken" USING btree (
  "tokenhash" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- Index for searching tokens of a user
CREATE INDEX "idx_refreshtoken_userid" ON "pelak"."refreshtoken" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------------------------------------------------------
-- Table: refreshtokenhistory
-- Description: History of all expired or deleted tokens
-- This table is used for audit, security and history maintenance
-- ----------------------------------------------------------------------------
CREATE TABLE "pelak"."refreshtokenhistory" (
  -- Unique token identifier (from main table)
  -- Primary Key but not Auto Increment (copied from main table)
  "refreshtokenhistoryid" int4 NOT NULL,
  
  -- Token hash
  "tokenhash" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- User identifier
  "userid" int4 NOT NULL,
  
  -- Device identifier
  "idevice" text COLLATE "pg_catalog"."default" NOT NULL,
  
  -- Token expiration time
  "expiresat" timestamptz(6) NOT NULL,
  
  -- Token creation time (from main table)
  "created" timestamptz(6) NOT NULL,
  
  -- Token revocation time (NULL = expired)
  -- If revoked by user logout, this field is set
  "revokedat" timestamptz(6),
  
  -- Last usage time
  "lastusedat" timestamptz(6),
  
  -- Last used IP address
  "lastusedip" inet,
  
  -- Archive time (Default: current time)
  -- Difference between revokedat and archivedat:
  -- - revokedat: Token revocation time by user (logout)
  -- - archivedat: Archive time (can be expired or revoked)
  "archivedat" timestamptz(6) DEFAULT now(),
  
  -- Primary Key
  CONSTRAINT "refreshtokenhistory_pkey" PRIMARY KEY ("refreshtokenhistoryid")
);

ALTER TABLE "pelak"."refreshtokenhistory" 
  OWNER TO "pelak_admin";

-- Index for searching history by archive time
CREATE INDEX "idx_refreshtokenhistory_archivedat" ON "pelak"."refreshtokenhistory" USING btree (
  "archivedat" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- Index for searching history by expiration time
CREATE INDEX "idx_refreshtokenhistory_expiresat" ON "pelak"."refreshtokenhistory" USING btree (
  "expiresat" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- Index for searching history of a user
CREATE INDEX "idx_refreshtokenhistory_userid" ON "pelak"."refreshtokenhistory" USING btree (
  "userid" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ============================================================================
-- ✅ All auth tables have been created!
-- ============================================================================