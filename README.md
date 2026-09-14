# void2Empire

A real-money futures and binary options trading platform. Monorepo with a Next.js frontend and a Go backend.

## Structure

```
frontend/   Next.js 15 + TypeScript + Tailwind CSS (App Router)
backend/    Go backend — not started yet
```

## Tech Stack

| Layer          | Choice                          |
| -------------- | -------------------------------- |
| Frontend       | Next.js, TypeScript, Tailwind CSS |
| Backend        | Go (Gin/Fiber)                    |
| Database       | PostgreSQL                        |
| Realtime       | WebSocket                         |
| Cache/Queue    | Redis                             |
| Storage        | Cloudflare R2                     |
| Payments       | SSLCOMMERZ / Stripe                |

## Frontend

```bash
cd frontend
npm install
npm run dev
```

See [frontend/.env.example](frontend/.env.example) for required environment variables.

### Frontend structure

```
src/app/(auth)/          Login, register
src/app/(dashboard)/     User dashboard, profile, wallet
src/app/(trading)/       Markets, futures/binary/demo trading, orders, positions, history
src/app/(extra)/         Referral, leaderboard, P2P, asset listing applications
src/app/(support)/       Support, FAQ
src/app/(legal)/         Terms, privacy, risk disclosure
src/app/admin/           Admin panel
src/components/          UI primitives, layout, and feature components
src/lib/                 API client, WebSocket client, validators, utils
src/store/               Zustand stores (auth, account mode)
src/types/               Shared TypeScript types
src/config/              Static configuration (markets, etc.)
```

## Backend

```bash
cd backend
cp .env.example .env
go run ./cmd/api
```

Authentication (register/login/logout/me, JWT in an httpOnly cookie, PostgreSQL storage) is implemented. See [backend/README.md](backend/README.md) for details. Everything else from the proposal is not started yet.

## Disclaimer

This is a real-money trading platform. Ensure compliance with local financial regulations before deploying.
