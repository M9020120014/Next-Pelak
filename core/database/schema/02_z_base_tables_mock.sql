-- ============================================================================
-- Module: Base Tables Mock Data
-- Description: Mock/seed data for base system tables
-- This file inserts initial data into userrole, userprofile, pagesection, pagetype, and language tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Mock Data: userrole
-- Description: User roles in the system
-- ----------------------------------------------------------------------------
INSERT INTO "pelak"."userrole" ("roleid", "title", "description", "order", "active", "created", "updated")
VALUES
  (1, 'Admin', 'System administrator with full access', 1, true, now(), now()),
  (2, 'User', 'Regular user with limited access', 2, true, now(), now()),
  (3, 'Moderator', 'Moderator with content management access', 3, true, now(), now())
ON CONFLICT ("roleid") DO NOTHING;

-- Reset sequence to continue from the highest roleid
SELECT setval('"pelak".userrole_roleid_seq', COALESCE((SELECT MAX("roleid") FROM "pelak"."userrole"), 1), true);

-- ----------------------------------------------------------------------------
-- Mock Data: userprofile
-- Description: Default profile images for users
-- ----------------------------------------------------------------------------
INSERT INTO "pelak"."userprofile" ("profileid", "title", "description", "imageurl", "order", "active", "created", "updated")
VALUES
  (1, 'Default Avatar 1', 'Default profile image for users', '/profile/default.png', 1, true, now(), now()),
  (2, 'Default Avatar 2', 'Alternative default profile image', '/profile/user.png', 2, true, now(), now()),
  (3, 'Default Avatar 3', 'Third default profile image option', '/profile/avatar.png', 3, true, now(), now())
ON CONFLICT ("profileid") DO NOTHING;

-- Reset sequence to continue from the highest profileid
SELECT setval('"pelak".userprofile_profileid_seq', COALESCE((SELECT MAX("profileid") FROM "pelak"."userprofile"), 1), true);

-- ----------------------------------------------------------------------------
-- Mock Data: pagesection
-- Description: Page sections of the site (page category)
-- ----------------------------------------------------------------------------
INSERT INTO "pelak"."pagesection" ("sectionid", "title", "description", "order", "active", "created", "updated")
VALUES
  (1, 'Politics and Governance', 'Political and governance related content', 1, true, now(), now()),
  (2, 'Social and Cultural', 'Social and cultural content', 2, true, now(), now()),
  (3, 'Economic and Financial', 'Economic and financial content', 3, true, now(), now()),
  (4, 'Security and Defense', 'Security and defense related content', 4, true, now(), now())
ON CONFLICT ("sectionid") DO NOTHING;

-- Reset sequence to continue from the highest sectionid
SELECT setval('"pelak".pagesection_sectionid_seq', COALESCE((SELECT MAX("sectionid") FROM "pelak"."pagesection"), 1), true);

-- ----------------------------------------------------------------------------
-- Mock Data: pagetype
-- Description: Page types of the site (article, news, etc.)
-- ----------------------------------------------------------------------------
INSERT INTO "pelak"."pagetype" ("typeid", "title", "description", "order", "active", "created", "updated")
VALUES
  (1, 'Article', 'Long-form article content', 1, true, now(), now()),
  (2, 'News', 'News and current events', 2, true, now(), now()),
  (3, 'Blog Post', 'Blog post content', 3, true, now(), now()),
  (4, 'Page', 'Static page content', 4, true, now(), now())
ON CONFLICT ("typeid") DO NOTHING;

-- Reset sequence to continue from the highest typeid
SELECT setval('"pelak".pagetype_typeid_seq', COALESCE((SELECT MAX("typeid") FROM "pelak"."pagetype"), 1), true);

-- ----------------------------------------------------------------------------
-- Mock Data: language
-- Description: System languages (Persian, English, etc.)
-- ----------------------------------------------------------------------------
INSERT INTO "pelak"."language" ("languageid", "code", "title", "description", "order", "active", "created", "updated")
VALUES
  (1, 'fa', 'فارسی', 'Persian language', 1, true, now(), now()),
  (2, 'en', 'English', 'English language', 2, true, now(), now())
ON CONFLICT ("languageid") DO NOTHING;

-- Reset sequence to continue from the highest languageid
SELECT setval('"pelak".language_languageid_seq', COALESCE((SELECT MAX("languageid") FROM "pelak"."language"), 1), true);

-- ============================================================================
-- ✅ All base tables mock data have been inserted!
-- ============================================================================