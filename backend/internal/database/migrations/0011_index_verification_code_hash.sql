-- Password reset links carry only the token, so the reset endpoint finds its
-- row by hash rather than by user.

CREATE INDEX IF NOT EXISTS idx_verification_codes_hash_purpose
    ON verification_codes (code_hash, purpose);
