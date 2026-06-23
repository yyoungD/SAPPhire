CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500),
    target_url VARCHAR(500),
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notifications_type CHECK (
        type IN (
            'NEW_APPLICATION',
            'UNREAD_APPLICATION',
            'JOB_DEADLINE',
            'POSITION_OFFER',
            'SYSTEM'
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
    ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read_at
    ON notifications(user_id, read_at);
