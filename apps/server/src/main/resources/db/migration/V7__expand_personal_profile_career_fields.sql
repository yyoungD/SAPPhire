ALTER TABLE personal_profiles
    ADD COLUMN IF NOT EXISTS desired_salary VARCHAR(100),
    ADD COLUMN IF NOT EXISTS work_type VARCHAR(30),
    ADD COLUMN IF NOT EXISTS sap_skills TEXT,
    ADD COLUMN IF NOT EXISTS core_competencies TEXT;
