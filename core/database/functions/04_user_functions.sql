-- ============================================================================
-- Module: User Additional Information Functions
-- Description: Functions related to completing user additional information in 4 stages
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: pelak_user_get
-- Description: Get complete user profile information including image
-- 
-- Parameters:
--   p_userid: User identifier
-- 
-- Logic:
--   1. Check if user exists
--   2. Get user information from pelak.user table
--   3. If profileimage exists, get imageurl from pelak.userprofile table
--   4. Return complete profile information
-- 
-- Returns:
--   Success: {success: true, userid, mobile, email, firstname, lastname, profileurl, profileimage}
--   Error: {success: false, title: "User Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT pelak_user_get(1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."pelak_user_get"("p_userid" int4)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_user pelak.user%ROWTYPE;
  v_profileurl text;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- Get user information
  SELECT * INTO v_user
  FROM pelak.user
  WHERE userid = p_userid AND active = true;

  -- If profileimageid exists, get imageurl from userprofile table
  IF v_user.profileimageid IS NOT NULL THEN
    SELECT imageurl INTO v_profileurl
    FROM pelak.userprofile
    WHERE profileid = v_user.profileimageid AND active = true;
  END IF;

  -- Return complete profile information
  -- Priority is with profileimageurl from user table, otherwise from userprofile
  RETURN json_build_object(
    'success', true,
    'title', 'User Profile Retrieved',
    'message', 'Profile information retrieved successfully.',
    'userid', v_user.userid,
    'mobile', v_user.mobile,
    'email', v_user.email,
    'firstname', v_user.firstname,
    'lastname', v_user.lastname,
    'profileurl', COALESCE(v_user.profileimageurl, v_profileurl),
    'profileimage', v_user.profileimageid
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error retrieving profile information.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_user_additionala
-- Description: Complete stage 1 of user additional information
-- Stage 1 includes: National code, birth date, gender, marital status, country, province, city
-- 
-- Parameters:
--   p_userid: User identifier
--   p_nationalcode: National code (char(10))
--   p_birthday: Birth date (varchar(10))
--   p_gender: Gender (bool: true = male, false = female)
--   p_married: Marital status (bool: true = married, false = single)
--   p_countryid: Country identifier (int4, FK → project.selector)
--   p_provinceid: Province identifier (int4, FK → project.selector)
--   p_cityid: City identifier (int4, FK → project.selector)
-- 
-- Logic:
--   1. Check if user exists
--   2. Check if selectors exist if needed
--   3. Create or update additional information record
-- 
-- Returns:
--   Success: {success: true, title: "Stage 1 Completed", message: "..."}
--   Error: {success: false, title: "User Not Found" | "Selector Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT project_user_additionala(1, '1234567890', '1990-01-01', true, false, 80001, 1, 5);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_user_additionala"(
  "p_userid" int4,
  "p_nationalcode" char(10) DEFAULT NULL,
  "p_birthday" varchar(10) DEFAULT NULL,
  "p_gender" bool DEFAULT NULL,
  "p_married" bool DEFAULT NULL,
  "p_countryid" int4 DEFAULT NULL,
  "p_provinceid" int4 DEFAULT NULL,
  "p_cityid" int4 DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- Check if selectors exist if needed
  IF p_countryid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM project.selector WHERE selectorid = p_countryid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'Selected country not found.'
    );
  END IF;

  IF p_provinceid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM project.selector WHERE selectorid = p_provinceid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'Selected province not found.'
    );
  END IF;

  IF p_cityid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM project.selector WHERE selectorid = p_cityid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'Selected city not found.'
    );
  END IF;

  -- Create or update additional information record
  INSERT INTO project.useradditionalinfo (
    userid,
    nationalcode,
    birthday,
    gender,
    married,
    countryid,
    provinceid,
    cityid,
    updated
  ) VALUES (
    p_userid,
    p_nationalcode,
    p_birthday,
    p_gender,
    p_married,
    COALESCE(p_countryid, 80001),
    p_provinceid,
    p_cityid,
    NOW()
  )
  ON CONFLICT (userid) DO UPDATE SET
    nationalcode = COALESCE(EXCLUDED.nationalcode, project.useradditionalinfo.nationalcode),
    birthday = COALESCE(EXCLUDED.birthday, project.useradditionalinfo.birthday),
    gender = COALESCE(EXCLUDED.gender, project.useradditionalinfo.gender),
    married = COALESCE(EXCLUDED.married, project.useradditionalinfo.married),
    countryid = COALESCE(EXCLUDED.countryid, project.useradditionalinfo.countryid),
    provinceid = COALESCE(EXCLUDED.provinceid, project.useradditionalinfo.provinceid),
    cityid = COALESCE(EXCLUDED.cityid, project.useradditionalinfo.cityid),
    updated = NOW();

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 1 Completed',
    'message', 'Stage 1 additional information completed successfully.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error completing stage 1 additional information.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_user_additionalb
-- Description: Complete stage 2 of user additional information
-- Stage 2 includes: Job, motivation, how known, collaboration type
-- 
-- Parameters:
--   p_userid: User identifier
--   p_job: Job (text)
--   p_motivation: Motivation (text)
--   p_howknown: How known (varchar(150))
--   p_collaboration: Collaboration type (varchar(100))
-- 
-- Logic:
--   1. Check if user exists
--   2. Check if additional information record exists (stage 1 must be completed)
--   3. Update stage 2 fields
-- 
-- Returns:
--   Success: {success: true, title: "Stage 2 Completed", message: "..."}
--   Error: {success: false, title: "User Not Found" | "Stage 1 Not Completed" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT project_user_additionalb(1, 'Software Engineer', 'Interest in politics', 'Internet', 'Active');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_user_additionalb"(
  "p_userid" int4,
  "p_job" text DEFAULT NULL,
  "p_motivation" text DEFAULT NULL,
  "p_howknown" varchar(150) DEFAULT NULL,
  "p_collaboration" varchar(100) DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- Check if additional information record exists
  IF NOT EXISTS (SELECT 1 FROM project.useradditionalinfo WHERE userid = p_userid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Stage 1 Not Completed',
      'message', 'Please complete stage 1 first.'
    );
  END IF;

  -- Update stage 2 fields
  UPDATE project.useradditionalinfo
  SET job = COALESCE(p_job, job),
      motivation = COALESCE(p_motivation, motivation),
      howknown = COALESCE(p_howknown, howknown),
      collaboration = COALESCE(p_collaboration, collaboration),
      updated = NOW()
  WHERE userid = p_userid;

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 2 Completed',
    'message', 'Stage 2 additional information completed successfully.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error completing stage 2 additional information.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_user_additionalc
-- Description: Complete stage 3 of user additional information
-- Stage 3 includes: Skills, education degree, study place type, study place, field of study
-- 
-- Parameters:
--   p_userid: User identifier
--   p_skills: Skills (text)
--   p_degreeid: Education degree identifier (int4, FK → project.selector)
--   p_studyplacetypeid: Study place type identifier (int4, FK → project.selector)
--   p_studyplaceid: Study place identifier (int4, FK → project.selector)
--   p_studyfieldsid: Field of study identifier (int4, FK → project.selector)
-- 
-- Logic:
--   1. Check if user exists
--   2. Check if additional information record exists (stage 1 must be completed)
--   3. Check if selectors exist if needed
--   4. Update stage 3 fields
-- 
-- Returns:
--   Success: {success: true, title: "Stage 3 Completed", message: "..."}
--   Error: {success: false, title: "User Not Found" | "Stage 1 Not Completed" | "Selector Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT project_user_additionalc(1, 'Programming, Design', 1, 2, 3, 4);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_user_additionalc"(
  "p_userid" int4,
  "p_skills" text DEFAULT NULL,
  "p_degreeid" int4 DEFAULT NULL,
  "p_studyplacetypeid" int4 DEFAULT NULL,
  "p_studyplaceid" int4 DEFAULT NULL,
  "p_studyfieldsid" int4 DEFAULT NULL
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- Check if additional information record exists
  IF NOT EXISTS (SELECT 1 FROM project.useradditionalinfo WHERE userid = p_userid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Stage 1 Not Completed',
      'message', 'Please complete stage 1 first.'
    );
  END IF;

  -- Check if selectors exist if needed
  IF p_degreeid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM project.selector WHERE selectorid = p_degreeid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'Selected education degree not found.'
    );
  END IF;

  IF p_studyplacetypeid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM project.selector WHERE selectorid = p_studyplacetypeid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'Selected study place type not found.'
    );
  END IF;

  IF p_studyplaceid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM project.selector WHERE selectorid = p_studyplaceid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'Selected study place not found.'
    );
  END IF;

  IF p_studyfieldsid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM project.selector WHERE selectorid = p_studyfieldsid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Selector Not Found',
      'message', 'Selected field of study not found.'
    );
  END IF;

  -- Update stage 3 fields
  UPDATE project.useradditionalinfo
  SET skills = COALESCE(p_skills, skills),
      degreeid = COALESCE(p_degreeid, degreeid),
      studyplacetypeid = COALESCE(p_studyplacetypeid, studyplacetypeid),
      studyplaceid = COALESCE(p_studyplaceid, studyplaceid),
      studyfieldsid = COALESCE(p_studyfieldsid, studyfieldsid),
      updated = NOW()
  WHERE userid = p_userid;

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 3 Completed',
    'message', 'Stage 3 additional information completed successfully.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error completing stage 3 additional information.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_user_additionald
-- Description: Complete stage 4 of user additional information (final confirmation)
-- Stage 4 includes: Consent
-- By confirming this stage, formdone is set to NOW()
-- 
-- Parameters:
--   p_userid: User identifier
--   p_consent: Consent (bool: true = consent, false = no consent)
-- 
-- Logic:
--   1. Check if user exists
--   2. Check if additional information record exists (previous stages must be completed)
--   3. Update consent field
--   4. If consent = true, set formdone = NOW()
-- 
-- Returns:
--   Success: {success: true, title: "Stage 4 Completed", message: "...", form_completed: true/false}
--   Error: {success: false, title: "User Not Found" | "Stage 1 Not Completed" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT project_user_additionald(1, true);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_user_additionald"(
  "p_userid" int4,
  "p_consent" bool DEFAULT false
)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
COST 100
AS $BODY$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- Check if additional information record exists
  IF NOT EXISTS (SELECT 1 FROM project.useradditionalinfo WHERE userid = p_userid) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'Stage 1 Not Completed',
      'message', 'Please complete stage 1 first.'
    );
  END IF;

  -- Update consent and formdone fields
  UPDATE project.useradditionalinfo
  SET consent = p_consent,
      formdone = CASE WHEN p_consent = true THEN NOW() ELSE formdone END,
      updated = NOW()
  WHERE userid = p_userid;

  RETURN json_build_object(
    'success', true,
    'title', 'Stage 4 Completed',
    'message', CASE WHEN p_consent = true THEN 'Form completed successfully.' ELSE 'Consent recorded.' END,
    'form_completed', p_consent
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error completing stage 4 additional information.'
  );
END;
$BODY$;

-- ----------------------------------------------------------------------------
-- Function: project_user_additional
-- Description: Get user additional information
-- 
-- Parameters:
--   p_userid: User identifier
-- 
-- Logic:
--   1. Check if user exists
--   2. Get additional information from project.user_additional_info table
-- 
-- Returns:
--   Success: {success: true, data: {...}}
--   Error: {success: false, title: "User Not Found" | "Error", message: "..."}
-- 
-- Usage Example:
--   SELECT project_user_additional(1);
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."project_user_additional"("p_userid" int4)
RETURNS "pg_catalog"."json"
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
COST 100
AS $BODY$
DECLARE
  v_info project.useradditionalinfo%ROWTYPE;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM pelak.user WHERE userid = p_userid AND active = true) THEN
    RETURN json_build_object(
      'success', false,
      'title', 'User Not Found',
      'message', 'User not found or inactive.'
    );
  END IF;

  -- Get additional information
  SELECT * INTO v_info
  FROM project.useradditionalinfo
  WHERE userid = p_userid;

  -- If additional information does not exist, return null
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', true,
      'data', NULL::json
    );
  END IF;

  -- Return additional information
  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'nationalcode', v_info.nationalcode,
      'birthday', v_info.birthday,
      'gender', v_info.gender,
      'married', v_info.married,
      'countryid', v_info.countryid,
      'provinceid', v_info.provinceid,
      'cityid', v_info.cityid,
      'address', v_info.address,
      'job', v_info.job,
      'skills', v_info.skills,
      'political', v_info.political,
      'motivation', v_info.motivation,
      'howknown', v_info.howknown,
      'collaboration', v_info.collaboration,
      'degreeid', v_info.degreeid,
      'studyplaceid', v_info.studyplaceid,
      'studyplacetypeid', v_info.studyplacetypeid,
      'studyfieldsid', v_info.studyfieldsid,
      'consent', v_info.consent,
      'formdone', v_info.formdone,
      'created', v_info.created,
      'updated', v_info.updated
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'title', 'Error',
    'message', 'Error retrieving additional information.'
  );
END;
$BODY$;

-- ============================================================================
-- ✅ All user functions have been created!
-- ============================================================================