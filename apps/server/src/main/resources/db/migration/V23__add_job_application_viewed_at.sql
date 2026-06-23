ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_job_applications_viewed_at
    ON job_applications(viewed_at);
