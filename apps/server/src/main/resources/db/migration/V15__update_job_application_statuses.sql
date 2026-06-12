ALTER TABLE job_applications
    DROP CONSTRAINT IF EXISTS chk_job_applications_status;

UPDATE job_applications
SET status = CASE status
    WHEN 'SUBMITTED' THEN 'APPLIED'
    WHEN 'OFFERED' THEN 'ACCEPTED'
    WHEN 'WITHDRAWN' THEN 'CANCELED'
    ELSE status
END;

ALTER TABLE job_applications
    ALTER COLUMN status SET DEFAULT 'APPLIED';

ALTER TABLE job_applications
    ADD CONSTRAINT chk_job_applications_status CHECK (
        status IN ('APPLIED', 'REVIEWING', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'CANCELED')
    );
