-- Backfill structured resume skills for resumes created before skill selection
-- was saved. Existing resume skill rows remain unchanged.
WITH matched_profile_skills AS (
    SELECT
        r.id AS resume_id,
        ss.id AS sap_skill_id,
        COALESCE(pp.career_years, 0) AS career_years,
        ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY ss.id) AS skill_order
    FROM resumes r
    JOIN personal_profiles pp ON pp.id = r.personal_profile_id
    JOIN sap_skills ss
      ON LOWER(COALESCE(pp.sap_skills, '')) LIKE '%' || LOWER(ss.name) || '%'
    WHERE r.deleted_at IS NULL
)
INSERT INTO resume_sap_skills (
    resume_id,
    sap_skill_id,
    proficiency_level,
    years_of_experience,
    is_primary
)
SELECT
    resume_id,
    sap_skill_id,
    CASE
        WHEN career_years >= 7 THEN 'EXPERT'
        WHEN career_years >= 4 THEN 'ADVANCED'
        WHEN career_years >= 2 THEN 'INTERMEDIATE'
        ELSE 'BEGINNER'
    END,
    LEAST(50, GREATEST(0, career_years)),
    skill_order = 1
FROM matched_profile_skills
ON CONFLICT (resume_id, sap_skill_id) DO NOTHING;
