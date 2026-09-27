-- Idempotency / request-replay protection (Sec 10.5). Client-supplied Idempotency-Key
-- on money endpoints; keys retained >= 24h (ASM-021). System-derived keys are made
-- permanent via journals.idempotency_key uniqueness (0007), not here.

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY,
    key TEXT NOT NULL,
    user_id UUID REFERENCES users (id),
    route TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    response_snapshot JSONB,
    status TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, route, key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON idempotency_keys (expires_at);
