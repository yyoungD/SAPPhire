-- Restore only exact comma-separated profile skills after removing legacy
-- prefix matches such as SAP FI from SAP Fiori.
WITH exact_profile_skills AS (
    SELECT
        r.id AS resume_id,
        ss.id AS sap_skill_id,
        COALESCE(pp.career_years, 0) AS career_years,
        ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY ss.id) AS skill_order
    FROM resumes r
    JOIN personal_profiles pp ON pp.id = r.personal_profile_id
    CROSS JOIN LATERAL REGEXP_SPLIT_TO_TABLE(
        COALESCE(pp.sap_skills, ''),
        '[[:space:]]*,[[:space:]]*'
    ) profile_skill
    JOIN sap_skills ss
      ON LOWER(TRIM(profile_skill)) IN (LOWER(ss.name), LOWER(ss.code))
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
FROM exact_profile_skills
ON CONFLICT (resume_id, sap_skill_id) DO NOTHING;
