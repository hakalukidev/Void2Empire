-- Double-entry ledger structure (Sec 9.4, Sec 10; ADR-004, INV-1/2/3/5).
-- Only internal/ledger may write journals, ledger_entries and wallet_balances
-- (Rule #36). All money columns NUMERIC(38,18) (ASM-006). No seed data.
--
-- ledger_accounts.owner_id points at accounts.id for user-owned accounts and is
-- NULL for platform accounts; the UNIQUE follows Sec 9.4 verbatim
-- (owner_type, owner_id, asset_id, kind). user_funding_balance is structurally a
-- ledger kind here but is excluded from every withdrawal/transfer/spot/binary/P2P
-- source lookup in the service layer (REQ-100, INV-25).

CREATE TABLE IF NOT EXISTS ledger_accounts (
    id UUID PRIMARY KEY,
    owner_type TEXT NOT NULL CHECK (owner_type IN ('user', 'platform')),
    owner_id UUID,
    asset_id UUID NOT NULL REFERENCES assets (id),
    kind TEXT NOT NULL CHECK (kind IN (
        'user_available', 'user_locked', 'user_funding_balance', 'user_profit_balance',
        'platform_fee_revenue', 'platform_house', 'external_clearing',
        'referral_expense', 'funding_reward_pool', 'p2p_escrow'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (owner_type, owner_id, asset_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_ledger_accounts_owner ON ledger_accounts (owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_ledger_accounts_asset_id ON ledger_accounts (asset_id);

CREATE TABLE IF NOT EXISTS journals (
    id UUID PRIMARY KEY,
    type TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    ref_type TEXT,
    ref_id UUID,
    description TEXT,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'system', 'provider')),
    actor_id UUID,
    correlation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journals_ref ON journals (ref_type, ref_id);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY,
    journal_id UUID NOT NULL REFERENCES journals (id),
    ledger_account_id UUID NOT NULL REFERENCES ledger_accounts (id),
    asset_id UUID NOT NULL REFERENCES assets (id),
    amount NUMERIC(38,18) NOT NULL,
    seq INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_journal ON ledger_entries (journal_id, asset_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries (ledger_account_id);

CREATE TABLE IF NOT EXISTS wallet_balances (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts (id),
    asset_id UUID NOT NULL REFERENCES assets (id),
    available NUMERIC(38,18) NOT NULL DEFAULT 0 CHECK (available >= 0),
    locked NUMERIC(38,18) NOT NULL DEFAULT 0 CHECK (locked >= 0),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (account_id, asset_id)
);

-- Append-only guards (INV-3). block_mutation() is defined in 0004.
CREATE TRIGGER trg_journals_append_only
BEFORE UPDATE OR DELETE ON journals
FOR EACH ROW EXECUTE FUNCTION block_mutation();

CREATE TRIGGER trg_ledger_entries_append_only
BEFORE UPDATE OR DELETE ON ledger_entries
FOR EACH ROW EXECUTE FUNCTION block_mutation();

-- INV-2 / ADR-004: for every (journal, asset) the signed entries must sum to zero.
-- Deferred to commit so a journal can be built up over multiple statements inside
-- one tx; the check runs once, atomically, before the tx can commit.
CREATE OR REPLACE FUNCTION check_journal_balanced() RETURNS trigger AS $$
DECLARE
    total NUMERIC(38,18);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total
    FROM ledger_entries
    WHERE journal_id = NEW.journal_id AND asset_id = NEW.asset_id;
    IF total <> 0 THEN
        RAISE EXCEPTION 'journal % is not balanced for asset %: sum=%',
            NEW.journal_id, NEW.asset_id, total;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_journal_balanced
AFTER INSERT ON ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION check_journal_balanced();
