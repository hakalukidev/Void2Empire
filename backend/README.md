# Backend

Go backend using Echo and PostgreSQL.

## Implemented

- Authentication: register, login, logout, current user (`/api/auth/*`), JWT stored in an httpOnly cookie, bcrypt password hashing.

## Structure

```
cmd/api/                  Entrypoint
internal/config/          Env-based configuration
internal/database/        pgxpool connection + embedded SQL migrations
internal/models/          Domain structs
internal/auth/            Register/login/logout/me — handler, service, repository, JWT, password hashing
internal/server/          Echo setup, middleware, route registration
internal/httpx/           Shared HTTP response helpers
```

## Running locally

```bash
cp .env.example .env   # adjust DATABASE_URL / PORT as needed
go run ./cmd/api
```

Requires a PostgreSQL database reachable at `DATABASE_URL`. Migrations in
`internal/database/migrations` run automatically on startup.

## API

| Method | Path              | Auth | Description                  |
| ------ | ----------------- | ---- | ----------------------------- |
| POST   | /api/auth/register | No   | Create account                |
| POST   | /api/auth/login     | No   | Log in                        |
| POST   | /api/auth/logout    | No   | Clear the auth cookie         |
| GET    | /api/auth/me         | Yes  | Get the current user          |
| GET    | /api/health          | No   | Health check                  |

## Not started yet

Trading, wallet, admin, and everything else from the proposal.
