-- Asset catalog and per-user real/demo account containers (Sec 9.4).
-- No seed rows: the base fiat currency (DR-005), the four platform coins' market
-- assignment (DR-049) and the precision policy (DR-047) are all undecided, and
-- assets.decimals (the tradable quantization) feeds DR-047.

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    decimals INT NOT NULL CHECK (decimals >= 0 AND decimals <= 18),
    status TEXT NOT NULL,
    initial_price NUMERIC(38,18),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id),
    type TEXT NOT NULL CHECK (type IN ('real', 'demo')),
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts (user_id);
