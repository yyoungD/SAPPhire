CREATE TABLE IF NOT EXISTS job_post_attachments (
    id BIGSERIAL PRIMARY KEY,
    job_post_id BIGINT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE (job_post_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_job_post_attachments_job_post_id
    ON job_post_attachments(job_post_id);
