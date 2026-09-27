-- RBAC tables (Sec 9.4 Identity; ASM-010).
-- The role->permission matrix (Sec 4.1) is encoded in Go (internal/rbac) and is
-- subject to DR-026 (P1, undecided); role_permissions is therefore left empty so
-- no permission mapping is invented in SQL. Only the 7 documented role names are
-- seeded here.

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles (id),
    permission_id UUID NOT NULL REFERENCES permissions (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES users (id),
    role_id UUID NOT NULL REFERENCES roles (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users (role_id);

INSERT INTO roles (id, name, description) VALUES
    (gen_random_uuid(), 'guest', 'Unauthenticated visitor'),
    (gen_random_uuid(), 'user', 'Authenticated regular user'),
    (gen_random_uuid(), 'trader', 'User granted real-trading permission'),
    (gen_random_uuid(), 'support', 'Support staff'),
    (gen_random_uuid(), 'finance_op', 'Finance operator'),
    (gen_random_uuid(), 'admin', 'Administrator'),
    (gen_random_uuid(), 'super_admin', 'Super administrator')
ON CONFLICT (name) DO NOTHING;
