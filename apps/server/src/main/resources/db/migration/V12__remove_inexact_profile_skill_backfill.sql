-- Remove prefix-based false positives introduced by the legacy profile skill
-- backfill. Example: "SAP Fiori" must not be interpreted as "SAP FI".
DELETE FROM resume_sap_skills rss
USING resumes r, personal_profiles pp, sap_skills ss
WHERE rss.resume_id = r.id
  AND r.personal_profile_id = pp.id
  AND rss.sap_skill_id = ss.id
  AND LOWER(COALESCE(pp.sap_skills, '')) LIKE '%' || LOWER(ss.name) || '%'
  AND NOT EXISTS (
      SELECT 1
      FROM REGEXP_SPLIT_TO_TABLE(COALESCE(pp.sap_skills, ''), '\\s*,\\s*') profile_skill
      WHERE LOWER(TRIM(profile_skill)) IN (LOWER(ss.name), LOWER(ss.code))
  );
