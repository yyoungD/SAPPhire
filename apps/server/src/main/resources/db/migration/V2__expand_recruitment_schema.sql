ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_status;

ALTER TABLE users
    ADD CONSTRAINT chk_users_role CHECK (role IN ('PERSONAL', 'COMPANY', 'ADMIN')),
    ADD CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'));

CREATE TABLE IF NOT EXISTS files (
    id BIGSERIAL PRIMARY KEY,
    uploader_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    content_type VARCHAR(100),
    file_size BIGINT NOT NULL DEFAULT 0,
    file_category VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_files_category CHECK (file_category IN ('PROFILE_IMAGE', 'COMPANY_LOGO', 'RESUME', 'ATTACHMENT'))
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_profile_image_file
    FOREIGN KEY (profile_image_file_id) REFERENCES files(id) ON DELETE SET NULL;

ALTER TABLE personal_profiles
    ADD COLUMN IF NOT EXISTS professional_title VARCHAR(100),
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS location VARCHAR(100),
    ADD COLUMN IF NOT EXISTS career_years INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_offer_available BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS ai_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1);

ALTER TABLE company_profiles
    ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
    ADD COLUMN IF NOT EXISTS company_size VARCHAR(50),
    ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS logo_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS address VARCHAR(255),
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

ALTER TABLE company_profiles
    ADD CONSTRAINT chk_company_profiles_verification_status
    CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'));

CREATE TABLE IF NOT EXISTS sap_skills (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    skill_type VARCHAR(30) NOT NULL,
    CONSTRAINT chk_sap_skills_type CHECK (skill_type IN ('MODULE', 'SOLUTION', 'TECHNICAL'))
);

CREATE TABLE IF NOT EXISTS resumes (
    id BIGSERIAL PRIMARY KEY,
    personal_profile_id BIGINT NOT NULL REFERENCES personal_profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    summary TEXT,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    portfolio_url VARCHAR(255),
    resume_file_id BIGINT REFERENCES files(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT chk_resumes_visibility CHECK (visibility IN ('PUBLIC', 'COMPANY_ONLY', 'PRIVATE'))
);

CREATE TABLE IF NOT EXISTS resume_experiences (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    company_name VARCHAR(100) NOT NULL,
    project_name VARCHAR(150),
    position VARCHAR(100),
    role VARCHAR(100),
    project_type VARCHAR(50),
    industry VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS resume_sap_skills (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    sap_skill_id BIGINT NOT NULL REFERENCES sap_skills(id),
    proficiency_level VARCHAR(30),
    years_of_experience INT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (resume_id, sap_skill_id),
    CONSTRAINT chk_resume_sap_skills_level CHECK (
        proficiency_level IS NULL OR proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
    )
);

CREATE TABLE IF NOT EXISTS job_posts (
    id BIGSERIAL PRIMARY KEY,
    company_profile_id BIGINT NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    responsibilities TEXT,
    qualifications TEXT,
    preferred_qualifications TEXT,
    employment_type VARCHAR(30),
    experience_level VARCHAR(50),
    min_career_years INT,
    max_career_years INT,
    location VARCHAR(100),
    work_type VARCHAR(30),
    salary_min INT,
    salary_max INT,
    salary_negotiable BOOLEAN NOT NULL DEFAULT TRUE,
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT chk_job_posts_status CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'DELETED')),
    CONSTRAINT chk_job_posts_work_type CHECK (work_type IS NULL OR work_type IN ('ONSITE', 'REMOTE', 'HYBRID'))
);

CREATE TABLE IF NOT EXISTS job_post_sap_skills (
    id BIGSERIAL PRIMARY KEY,
    job_post_id BIGINT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    sap_skill_id BIGINT NOT NULL REFERENCES sap_skills(id),
    required_level VARCHAR(30),
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (job_post_id, sap_skill_id),
    CONSTRAINT chk_job_post_sap_skills_level CHECK (
        required_level IS NULL OR required_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
    )
);

CREATE TABLE IF NOT EXISTS job_tags (
    id BIGSERIAL PRIMARY KEY,
    job_post_id BIGINT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS job_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_post_id BIGINT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, job_post_id)
);

CREATE TABLE IF NOT EXISTS job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_post_id BIGINT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    resume_id BIGINT NOT NULL REFERENCES resumes(id),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_job_applications_status CHECK (
        status IN ('SUBMITTED', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN')
    )
);

CREATE TABLE IF NOT EXISTS application_status_logs (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    memo TEXT,
    changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS position_offers (
    id BIGSERIAL PRIMARY KEY,
    company_profile_id BIGINT NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    receiver_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id BIGINT REFERENCES resumes(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT',
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_position_offers_status CHECK (status IN ('SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELED'))
);

CREATE TABLE IF NOT EXISTS resume_views (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    company_profile_id BIGINT NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_reviews (
    id BIGSERIAL PRIMARY KEY,
    personal_profile_id BIGINT NOT NULL REFERENCES personal_profiles(id) ON DELETE CASCADE,
    company_profile_id BIGINT NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    rating DECIMAL(2,1) NOT NULL,
    content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_evaluations (
    id BIGSERIAL PRIMARY KEY,
    personal_profile_id BIGINT NOT NULL REFERENCES personal_profiles(id) ON DELETE CASCADE,
    resume_id BIGINT REFERENCES resumes(id) ON DELETE SET NULL,
    overall_score DECIMAL(5,2),
    summary TEXT,
    model_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_evaluation_items (
    id BIGSERIAL PRIMARY KEY,
    ai_evaluation_id BIGINT NOT NULL REFERENCES ai_evaluations(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    score DECIMAL(5,2),
    comment TEXT
);

CREATE TABLE IF NOT EXISTS ai_match_scores (
    id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    job_post_id BIGINT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (resume_id, job_post_id)
);

CREATE INDEX IF NOT EXISTS idx_files_uploader_user_id ON files(uploader_user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_personal_profile_id ON resumes(personal_profile_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_company_profile_id ON job_posts(company_profile_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status_deadline ON job_posts(status, deadline);
CREATE INDEX IF NOT EXISTS idx_job_bookmarks_user_id ON job_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_post_id ON job_applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_position_offers_receiver_user_id ON position_offers(receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_scores_job_post_id ON ai_match_scores(job_post_id);

INSERT INTO sap_skills (code, name, skill_type)
VALUES
    ('FI', 'SAP FI', 'MODULE'),
    ('CO', 'SAP CO', 'MODULE'),
    ('MM', 'SAP MM', 'MODULE'),
    ('SD', 'SAP SD', 'MODULE'),
    ('ABAP', 'ABAP', 'TECHNICAL'),
    ('BASIS', 'SAP BASIS', 'TECHNICAL'),
    ('S4HANA', 'SAP S/4HANA', 'SOLUTION'),
    ('SUCCESSFACTORS', 'SAP SuccessFactors', 'SOLUTION')
ON CONFLICT (code) DO NOTHING;
