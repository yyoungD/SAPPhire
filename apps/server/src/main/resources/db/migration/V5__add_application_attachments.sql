CREATE TABLE IF NOT EXISTS job_application_attachments (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (application_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_job_application_attachments_application_id
    ON job_application_attachments(application_id);
