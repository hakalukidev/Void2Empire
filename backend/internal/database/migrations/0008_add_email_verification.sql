-- Email verification via 6-digit OTP (REQ-008). Codes live in verification_codes
-- (migration 0003); this records the outcome on the user and indexes the lookup
-- the verify and resend endpoints make on every call.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_verification_codes_user_purpose_created
    ON verification_codes (user_id, purpose, created_at DESC);
