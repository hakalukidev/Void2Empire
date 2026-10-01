# Backend

Go backend using Echo and PostgreSQL.

## Implemented

- **Authentication**: register, login, logout, current user (`/api/auth/*`), JWT stored in an httpOnly cookie, bcrypt password hashing. `RequireAuth` resolves the caller's role from `admin_users` on every authenticated request and puts it on the context; a lookup failure resolves to `user`, never to the highest role. `/api/auth/register` and `/api/auth/login` are rate limited per IP (10 burst, then one per two seconds) and answer `429 RATE_LIMITED`.
- **DB-free foundation** (pure domain code; compiles and is unit-tested without a database):
  - `internal/money` — decimal money type (`shopspring/decimal`), JSON-as-strings, no floats (Rule #40); configurable credit/fee rounding policy (final mode is `DR-047`, undecided).
  - `internal/statemachine` + per-domain `state.go` — the Sec 30 lifecycle machines (order, deposit, withdrawal, transaction, user, futures, binary, funding, p2p, support, listing, payment) as pure transition functions. `DR`-gated edges are deliberately omitted, not defaulted (Rule #35).
  - `internal/rbac` — the Sec 4.1 permission matrix (7 roles × capabilities) with default-deny. Final hierarchy is `DR-026` (undecided).
  - `internal/audit` — the Sec 28 append-only audit event model: PII/secret redaction, optional hash chain. Persistence lands in the DB phase.
  - `internal/server` — central error handler mapping domain errors onto the Sec 32 error codes, plus a `RequireCapability` RBAC middleware. It reads the role `RequireAuth` set, defaults to guest when none is set, and denies `real_trading` outright while `FEATURE_REAL_TRADING_ENABLED` is off (Rule #42). No route uses it yet: the first admin/trading endpoint is where it attaches.
- **Migrations** (`internal/database/migrations/*.sql`, embedded): schema for RBAC, sessions, audit log (append-only), idempotency keys, assets/accounts, and the double-entry ledger (`ledger_accounts`, `journals`, `ledger_entries`, `wallet_balances`) including the deferred `SUM(amount)=0`-per-journal balance trigger (ADR-004) and append-only guards. **Written but not applied** — no database is provisioned yet, and there is no seed data for `DR`-blocked items (`DR-005` base currency, `DR-047` precision, `DR-049` coin/market assignment).

## Structure

```
cmd/api/                  HTTP server entrypoint (auto-migrates on startup)
cmd/migrate/              Standalone migration runner
cmd/worker/               Background-worker skeleton (no jobs registered yet)
internal/config/          Env-based configuration
internal/database/        pgxpool connection + embedded SQL migrations
internal/models/          Domain structs
internal/auth/            Register/login/logout/me — handler, service, repository, JWT, password hashing
internal/server/          Echo setup, error handler, RBAC middleware, route registration
internal/httpx/           Shared HTTP response helpers (flat error body + optional Sec 32 code)
internal/money/           Decimal money type + rounding policy
internal/statemachine/    Shared state-machine helper
internal/rbac/            Permission matrix (pure)
internal/audit/           Audit event model (pure)
internal/<domain>/        Per-domain lifecycle state machines (order, deposit, ...)
```

## Running locally

```bash
cp .env.example .env   # set JWT_SECRET (openssl rand -base64 48) and DATABASE_URL
go run ./cmd/api       # HTTP server; applies migrations on startup
go run ./cmd/migrate   # apply migrations only, then exit
```

`cmd/api` refuses to start without a `JWT_SECRET` of at least 32 bytes; there is
no development default, so a forgotten variable cannot end up signing real
session tokens with a value that is public in this repository.

`cmd/api` and `cmd/migrate` require a PostgreSQL database reachable at
`DATABASE_URL`. The DB-free foundation does not:

```bash
go build ./...         # compiles with no database present
go test -race ./...    # money, state machines, RBAC, audit, server — all offline
```

`cmd/worker` loads config and waits for a termination signal; it does not connect
to the database and registers no jobs yet.

## API

| Method | Path               | Auth | Description          |
| ------ | ------------------ | ---- | -------------------- |
| POST   | /api/auth/register | No   | Create account (rate limited per IP) |
| POST   | /api/auth/login    | No   | Log in (rate limited per IP) |
| POST   | /api/auth/logout   | No   | Clear the auth cookie |
| GET    | /api/auth/me       | Yes  | Get the current user |
| GET    | /api/health        | No   | `200 {"status":"ok"}` only when PostgreSQL answers; otherwise `503 {"status":"unavailable"}` |

`/api/health` is what `backend/Dockerfile`'s `HEALTHCHECK` and
`.github/workflows/deploy.yml` compare against that exact body, so the deploy
gate fails on a dead database instead of on a process that merely started. Keep
the response a single `status` key.

`/api/auth/me` and `/api/auth/logout` are deliberately not rate limited: `/me`
runs on every page load, so a per-IP budget there would lock out everyone behind
a shared NAT or mobile carrier.

## Not started yet

Repositories/queries and applying migrations, the transactional `ledger.Post(...)`
service, idempotency storage, auth expansion (verify/reset/refresh), trading
(spot/futures/binary), funding, P2P, wallet/deposit/withdrawal endpoints, admin,
WebSocket/Redis, and integration tests — all of which need a provisioned database.
`DR`-blocked modules stay at interfaces/stubs until the client resolves them
(Rule #35).
