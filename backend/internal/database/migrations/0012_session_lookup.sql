-- Every authenticated request now checks its session (internal/auth/session.go).
-- refresh_token_hash is already UNIQUE, so the lookup by hash is indexed; this
-- one serves "revoke every live session of a user" on password change/reset.

CREATE INDEX IF NOT EXISTS idx_sessions_user_live
    ON sessions (user_id) WHERE revoked_at IS NULL;
