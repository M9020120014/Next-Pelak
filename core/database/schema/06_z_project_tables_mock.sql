-- ============================================================================
-- Module: Project Tables Mock Data
-- Description: Mock/seed data for project-specific tables (selectortype and selector)
-- This file inserts initial data into selectortype and selector tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Mock Data: selectortype
-- Description: Selector types used in useradditionalinfo
-- ----------------------------------------------------------------------------
INSERT INTO "project"."selectortype" ("selectortypeid", "title", "code")
VALUES
  (1, 'country', 'CO'),
  (2, 'province', 'PR'),
  (3, 'city', 'CI'),
  (4, 'degree', 'DE'),
  (5, 'studyplacetype', 'ST'),
  (6, 'studyplace', 'SP'),
  (7, 'studyfield', 'SF')
ON CONFLICT ("selectortypeid") DO NOTHING;

-- Reset sequence to continue from the highest selectortypeid
SELECT setval('"project".selectortype_selectortypeid_seq', COALESCE((SELECT MAX("selectortypeid") FROM "project"."selectortype"), 1), true);

-- ----------------------------------------------------------------------------
-- Mock Data: selector
-- Description: Selectors for countries, provinces, cities, education degrees, etc.
-- ----------------------------------------------------------------------------

-- Countries (type = 1)
INSERT INTO "project"."selector" ("selectorid", "title", "type", "parentselectorid", "txt", "order")
VALUES
  (80001, 'ایران', 1, NULL, 'جمهوری اسلامی ایران', 1),
  (80002, 'افغانستان', 1, NULL, NULL, 2),
  (80003, 'عراق', 1, NULL, NULL, 3)
ON CONFLICT ("selectorid") DO NOTHING;

-- Provinces (type = 2, parent = country)
INSERT INTO "project"."selector" ("selectorid", "title", "type", "parentselectorid", "txt", "order")
VALUES
  (1001, 'تهران', 2, 80001, 'استان تهران', 1),
  (1002, 'اصفهان', 2, 80001, 'استان اصفهان', 2),
  (1003, 'فارس', 2, 80001, 'استان فارس', 3),
  (1004, 'خراسان رضوی', 2, 80001, 'استان خراسان رضوی', 4),
  (1005, 'آذربایجان شرقی', 2, 80001, 'استان آذربایجان شرقی', 5),
  (1006, 'خوزستان', 2, 80001, 'استان خوزستان', 6),
  (1007, 'گیلان', 2, 80001, 'استان گیلان', 7),
  (1008, 'مازندران', 2, 80001, 'استان مازندران', 8)
ON CONFLICT ("selectorid") DO NOTHING;

-- Cities (type = 3, parent = province)
INSERT INTO "project"."selector" ("selectorid", "title", "type", "parentselectorid", "txt", "order")
VALUES
  -- Cities of Tehran Province
  (2001, 'تهران', 3, 1001, 'شهر تهران', 1),
  (2002, 'کرج', 3, 1001, 'شهر کرج', 2),
  (2003, 'اسلامشهر', 3, 1001, 'شهر اسلامشهر', 3),
  (2004, 'ورامین', 3, 1001, 'شهر ورامین', 4),
  
  -- Cities of Isfahan Province
  (2005, 'اصفهان', 3, 1002, 'شهر اصفهان', 1),
  (2006, 'کاشان', 3, 1002, 'شهر کاشان', 2),
  (2007, 'نجف‌آباد', 3, 1002, 'شهر نجف‌آباد', 3),
  (2008, 'خمینی‌شهر', 3, 1002, 'شهر خمینی‌شهر', 4),
  
  -- Cities of Fars Province
  (2009, 'شیراز', 3, 1003, 'شهر شیراز', 1),
  (2010, 'مرودشت', 3, 1003, 'شهر مرودشت', 2),
  (2011, 'کازرون', 3, 1003, 'شهر کازرون', 3),
  
  -- Cities of Khorasan Razavi Province
  (2012, 'مشهد', 3, 1004, 'شهر مشهد', 1),
  (2013, 'نیشابور', 3, 1004, 'شهر نیشابور', 2),
  (2014, 'سبزوار', 3, 1004, 'شهر سبزوار', 3),
  
  -- Cities of East Azerbaijan Province
  (2015, 'تبریز', 3, 1005, 'شهر تبریز', 1),
  (2016, 'مراغه', 3, 1005, 'شهر مراغه', 2),
  (2017, 'میانه', 3, 1005, 'شهر میانه', 3),
  
  -- Cities of Khuzestan Province
  (2018, 'اهواز', 3, 1006, 'شهر اهواز', 1),
  (2019, 'آبادان', 3, 1006, 'شهر آبادان', 2),
  (2020, 'دزفول', 3, 1006, 'شهر دزفول', 3),
  
  -- Cities of Gilan Province
  (2021, 'رشت', 3, 1007, 'شهر رشت', 1),
  (2022, 'انزلی', 3, 1007, 'شهر انزلی', 2),
  (2023, 'لاهیجان', 3, 1007, 'شهر لاهیجان', 3),
  
  -- Cities of Mazandaran Province
  (2024, 'ساری', 3, 1008, 'شهر ساری', 1),
  (2025, 'بابل', 3, 1008, 'شهر بابل', 2),
  (2026, 'آمل', 3, 1008, 'شهر آمل', 3)
ON CONFLICT ("selectorid") DO NOTHING;

-- Education Degrees (type = 4)
INSERT INTO "project"."selector" ("selectorid", "title", "type", "parentselectorid", "txt", "order")
VALUES
  (3001, 'دیپلم', 4, NULL, 'مدرک دیپلم', 1),
  (3002, 'کاردانی', 4, NULL, 'مدرک کاردانی', 2),
  (3003, 'کارشناسی', 4, NULL, 'مدرک کارشناسی', 3),
  (3004, 'کارشناسی ارشد', 4, NULL, 'مدرک کارشناسی ارشد', 4),
  (3005, 'دکتری', 4, NULL, 'مدرک دکتری', 5)
ON CONFLICT ("selectorid") DO NOTHING;

-- Study Place Types (type = 5)
INSERT INTO "project"."selector" ("selectorid", "title", "type", "parentselectorid", "txt", "order")
VALUES
  (4001, 'دانشگاه دولتی', 5, NULL, 'دانشگاه‌های دولتی', 1),
  (4002, 'دانشگاه آزاد اسلامی', 5, NULL, 'دانشگاه آزاد اسلامی', 2),
  (4003, 'دانشگاه پیام نور', 5, NULL, 'دانشگاه پیام نور', 3),
  (4004, 'دانشگاه غیرانتفاعی', 5, NULL, 'دانشگاه‌های غیرانتفاعی', 4),
  (4005, 'دانشگاه علمی کاربردی', 5, NULL, 'دانشگاه علمی کاربردی', 5)
ON CONFLICT ("selectorid") DO NOTHING;

-- Study Places (type = 6, parent = study place type)
INSERT INTO "project"."selector" ("selectorid", "title", "type", "parentselectorid", "txt", "order")
VALUES
  -- State Universities
  (5001, 'دانشگاه تهران', 6, 4001, 'دانشگاه تهران', 1),
  (5002, 'دانشگاه صنعتی شریف', 6, 4001, 'دانشگاه صنعتی شریف', 2),
  (5003, 'دانشگاه امیرکبیر', 6, 4001, 'دانشگاه صنعتی امیرکبیر', 3),
  (5004, 'دانشگاه شهید بهشتی', 6, 4001, 'دانشگاه شهید بهشتی', 4),
  (5005, 'دانشگاه اصفهان', 6, 4001, 'دانشگاه اصفهان', 5),
  (5006, 'دانشگاه شیراز', 6, 4001, 'دانشگاه شیراز', 6),
  (5007, 'دانشگاه فردوسی مشهد', 6, 4001, 'دانشگاه فردوسی مشهد', 7),
  (5008, 'دانشگاه تبریز', 6, 4001, 'دانشگاه تبریز', 8),
  
  -- Islamic Azad University
  (5009, 'دانشگاه آزاد اسلامی واحد تهران مرکز', 6, 4002, 'دانشگاه آزاد اسلامی واحد تهران مرکز', 1),
  (5010, 'دانشگاه آزاد اسلامی واحد علوم و تحقیقات', 6, 4002, 'دانشگاه آزاد اسلامی واحد علوم و تحقیقات', 2),
  (5011, 'دانشگاه آزاد اسلامی واحد اصفهان', 6, 4002, 'دانشگاه آزاد اسلامی واحد اصفهان', 3),
  
  -- Payame Noor University
  (5012, 'دانشگاه پیام نور تهران', 6, 4003, 'دانشگاه پیام نور تهران', 1),
  (5013, 'دانشگاه پیام نور اصفهان', 6, 4003, 'دانشگاه پیام نور اصفهان', 2)
ON CONFLICT ("selectorid") DO NOTHING;

-- Study Fields (type = 7)
INSERT INTO "project"."selector" ("selectorid", "title", "type", "parentselectorid", "txt", "order")
VALUES
  (6001, 'مهندسی کامپیوتر', 7, NULL, 'رشته مهندسی کامپیوتر', 1),
  (6002, 'مهندسی نرم‌افزار', 7, NULL, 'رشته مهندسی نرم‌افزار', 2),
  (6003, 'مهندسی برق', 7, NULL, 'رشته مهندسی برق', 3),
  (6004, 'مهندسی مکانیک', 7, NULL, 'رشته مهندسی مکانیک', 4),
  (6005, 'مهندسی عمران', 7, NULL, 'رشته مهندسی عمران', 5),
  (6006, 'مهندسی صنایع', 7, NULL, 'رشته مهندسی صنایع', 6),
  (6007, 'حقوق', 7, NULL, 'رشته حقوق', 7),
  (6008, 'پزشکی', 7, NULL, 'رشته پزشکی', 8),
  (6009, 'دندانپزشکی', 7, NULL, 'رشته دندانپزشکی', 9),
  (6010, 'داروسازی', 7, NULL, 'رشته داروسازی', 10),
  (6011, 'مدیریت', 7, NULL, 'رشته مدیریت', 11),
  (6012, 'حسابداری', 7, NULL, 'رشته حسابداری', 12),
  (6013, 'اقتصاد', 7, NULL, 'رشته اقتصاد', 13),
  (6014, 'علوم سیاسی', 7, NULL, 'رشته علوم سیاسی', 14),
  (6015, 'روزنامه‌نگاری', 7, NULL, 'رشته روزنامه‌نگاری', 15),
  (6016, 'زبان و ادبیات فارسی', 7, NULL, 'رشته زبان و ادبیات فارسی', 16),
  (6017, 'زبان انگلیسی', 7, NULL, 'رشته زبان انگلیسی', 17),
  (6018, 'ریاضی', 7, NULL, 'رشته ریاضی', 18),
  (6019, 'فیزیک', 7, NULL, 'رشته فیزیک', 19),
  (6020, 'شیمی', 7, NULL, 'رشته شیمی', 20)
ON CONFLICT ("selectorid") DO NOTHING;

-- Reset sequence to continue from the highest selectorid
SELECT setval('"project".selector_selectorid_seq', COALESCE((SELECT MAX("selectorid") FROM "project"."selector"), 1), true);

-- ============================================================================
-- ✅ All project mock data has been inserted!
-- ============================================================================

