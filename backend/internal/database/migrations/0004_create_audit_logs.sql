-- Audit log (Sec 28). Append-only: no UPDATE/DELETE. For admin/financial actions it
-- is written in the same tx as the business change (if the audit write fails, the
-- action fails). Retention per DR-027. actor_type may be 'system:<worker>', so it is
-- left free-form (no CHECK); result is one of success/denied/failed.

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_type TEXT NOT NULL,
    actor_id UUID,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    before JSONB,
    after JSONB,
    reason TEXT,
    ip TEXT,
    user_agent TEXT,
    request_id TEXT,
    correlation_id TEXT,
    result TEXT NOT NULL CHECK (result IN ('success', 'denied', 'failed')),
    hash_prev TEXT,
    hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_occurred_at ON audit_logs (occurred_at);

-- Shared append-only guard; reused by the ledger tables in 0007.
CREATE OR REPLACE FUNCTION block_mutation() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION '% is append-only: % is not allowed', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION block_mutation();
