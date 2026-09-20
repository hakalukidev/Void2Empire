# context.md — Trading Platform (hakaluki.dev proposal) — Single Source of Truth

> **Document status:** Draft v0.1 — produced from a full analysis of `Trading_Platform_Proposal_Bangla.pdf` (7 pages, Bangla, text-only; no embedded images, diagrams or screenshots were found in the PDF).
> **Primary source:** the proposal. Everything not stated there is labelled below.
> **Page references:** `P1`–`P7` = PDF page numbers. `§n` = the proposal's own numbered section (১–১২). Sections of *this* document are written `Sec n`.

## Tag legend (used everywhere)

| Tag | Meaning |
|---|---|
| **[REQ]** | Requirement stated in the proposal. Cited with `REQ-nnn`. |
| **[TD]** | Technical decision derived from the proposal's stack (safe consequence of stated technology). |
| **[ASM]** | Assumption — proposed, not confirmed. See Sec 43 (`ASM-nnn`). |
| **[DR]** | Decision required from client/product owner before implementation. See Sec 42 (`DR-nnn`). Also serves as OPEN QUESTION. |
| **[REC]** | Recommendation — engineering advice, not binding. |
| **[IMPL]** | Implementation detail — how to build something already decided. |

**Rule:** If a statement has no tag and is not clearly a restatement of the proposal, treat it as **[REC]**. Nothing tagged `[ASM]`, `[REC]` or `[DR]` may be presented as a proposal fact.

---

# PROJECT AT A GLANCE

| Question | Answer |
|---|---|
| **What are we building?** | A centralized (no blockchain), dark-themed, responsive, "real-money" trading web application: spot trading of platform-created assets, futures (long/short, leverage), binary (UP/DOWN) trading, demo trading (virtual funds) for futures & binary, wallet/ledger, deposits/withdrawals, plus funding plans, referral, leaderboard, coin listing applications, basic P2P, support tickets, FAQ, announcements, legal pages, and an admin panel. `[REQ-001..003]` |
| **Why?** | Client wants an MVP production release of a trading platform inspired by major global trading platforms, delivered by hakaluki.dev in ~6 weeks. |
| **Who uses it?** | Traders (real and demo), the client's admin/ops staff, support staff, and guests browsing the public site. Roles beyond "user" and "admin" are **not** defined in the proposal (`DR-026`). |
| **Core modules** | Auth/Users, Wallet+Ledger, Assets/Markets, Spot orders/trades, Futures, Binary, Demo, Market data, Realtime (WebSocket), Payments, Funding, Referral, Leaderboard, Listings, P2P, Support/FAQ/Announcements, Notifications, Admin, Audit. |
| **Technology stack** `[REQ-083]` | Next.js + TypeScript + Tailwind CSS (frontend); Go with Gin **or** Fiber (backend); PostgreSQL; WebSocket; Redis (cache/queue); Cloudflare R2 or equivalent (storage); VPS/cloud server; SSLCOMMERZ **or** Stripe (subject to provider approval). |
| **Data architecture** | PostgreSQL = only authoritative store for money and trading state. Double-entry ledger with balances as a derived/guarded projection. Redis = cache, rate limits, pub/sub, queues, locks — **never** authoritative money. Demo and real data are structurally isolated. |
| **Critical external dependencies (client-provided, §8, §10)** | VPS/cloud, R2/storage, domain/DNS, SMTP, SMS/OTP, **market-data API**, **KYC/AML service**, "trading/financial API", payment-gateway merchant account + docs, SSL, monitoring/security services, legal content, licences/regulatory approvals. |
| **Most technically sensitive** | Ledger/wallet atomicity; spot pricing/matching engine (undefined); futures margin & liquidation (formulas undefined); binary settlement (payout/price source undefined); payment webhooks; withdrawals; demo/real isolation. |
| **Most important unresolved decisions** | `DR-001` counterparty model, `DR-002/003` pricing & matching, `DR-009` liquidation/negative balance, `DR-012/013` binary payout & settlement, `DR-017` withdrawal rails, `DR-023` market data vs platform-priced assets, `DR-024/045` payment provider acceptance, `DR-018` KYC gating. Full list: Sec 42. |
| **Development phases** `[REQ-084]` | Wk1–2 architecture & core; Wk3–4 trading core & advanced (spot, futures, binary, demo); Wk5–6 finalization & deployment (funding, referral, leaderboard, P2P, listing, admin, payments, testing, security review, production). Feasibility caveat: Sec 39/40. |

**Read this first — three critical observations from the analysis**

1. **The proposal describes *what* exists, almost never *how it behaves*.** Pricing, matching, margin, liquidation, payout, P2P, funding and referral rules are all unspecified. Sec 42 lists 48 decisions. Implementation of money-touching logic **must not start** on any of them until decided.
2. **Internal prices vs. external market data are in tension.** §1 says assets "launch at a fixed initial price and price rises/falls based on a configured buy/sell mechanism" (platform-driven price), while §8/§10 require a client-provided **market data API**. It is not stated which assets use which source (`DR-023`).
3. **The 6-week timeline for this scope is a proposal statement, not an engineering guarantee.** See Sec 39–40.

---

# 1. SOURCE ANALYSIS

## 1.1 Page map of the PDF

| Page | Content |
|---|---|
| P1 | Cover: prepared by hakaluki.dev; timeline 1.5 months/6 weeks; free revision 1 month; free support/bug fix 1 year; support 24/7. |
| P2 | §1 Project overview; §2 Core features — Website & User system, Trading system, Futures. |
| P3 | §2 continued — Binary, Demo trading; §3 Wallet & financial; §4 Additional features. |
| P4 | §5 Admin panel; §6 Technology stack; §7 Timeline (week 1–2 start). |
| P5 | §7 Timeline weeks 3–6; §8 Client-provided accounts/third-party services; §9 Service commitments (24/7, 1-month revision, 1-year support start). |
| P6 | §9 post-support monthly service; §10 Client responsibilities; §11 Legal & compliance; §12 Deliverables (start). |
| P7 | §12 Deliverables (end); Project summary table; footer. |

## 1.2 Source Requirements (traceability)

Terminology follows the proposal (English terms as written in it; Bangla terms transliterated in parentheses where useful).

### Overview (P2 §1)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-001 | Real-money trading web app | P2 §1; P7 summary | Modern, responsive, professional **real-money** trading platform, **dark theme**, inspired by leading global trading platforms. |
| REQ-002 | Centralized, no blockchain | P2 §1; P7 summary | System is centralized, **without blockchain infrastructure**. |
| REQ-003 | Platform-priced assets | P2 §1 | Platform assets can launch at a **fixed initial price**; price rises or falls based on **a configured buy/sell mechanism**. (Mechanism not defined → `DR-002`.) |

### Website & user system (P2 §2)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-004 | Professional homepage | P2 §2 | Public marketing homepage. |
| REQ-005 | Registration & login | P2 §2 | Account creation and sign-in. |
| REQ-006 | User dashboard | P2 §2; P6 §12 | Post-login dashboard; listed as a deliverable. |
| REQ-007 | User profile | P2 §2 | Profile management. |
| REQ-008 | Email/phone verification support | P2 §2 | Verification "support" (mandatory-ness unspecified → `DR-032`). |
| REQ-009 | Password management | P2 §2 | Password change/reset ("password management"). |
| REQ-010 | Account security | P2 §2 | Unspecified scope (2FA? sessions? → `DR-032`). |
| REQ-011 | Notifications | P2 §2 | Channels/triggers unspecified (`DR-028`). |

### Trading system (P2 §2)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-012 | Platform asset/coin creation | P2 §2 | Platform can create its own assets/coins. |
| REQ-013 | Configurable initial asset price | P2 §2; P4 §5 | Initial price configurable (by admin). |
| REQ-014 | Buy/sell system | P2 §2 | Users buy and sell assets. |
| REQ-015 | Dynamic price calculation | P2 §2 | Price computed dynamically (formula undefined → `DR-002`). |
| REQ-016 | Live price update | P2 §2 | Real-time price updates. |
| REQ-017 | Trading chart | P2 §2 | Price chart. |
| REQ-018 | Trading pair | P2 §2 | Pair concept (base/quote). |
| REQ-019 | Market & limit orders | P2 §2 | Two order types stated. |
| REQ-020 | Open orders | P2 §2 | View unfilled orders. |
| REQ-021 | Order history | P2 §2 | Past orders. |
| REQ-022 | Trade history | P2 §2 | Executed trades. |
| REQ-023 | Trading fee | P2 §2; P4 §5 | Fees exist and are admin-configurable. |
| REQ-024 | Market overview | P2 §2 | Overview of markets. |
| REQ-025 | Top gainers/losers | P2 §2 | Ranked movers (window undefined → `DR-043`). |

### Futures (P2 §2)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-026 | Long / Short | P2 §2 | Two directions. |
| REQ-027 | Leverage | P2 §2; P4 §5 | Leverage; admin-configurable. |
| REQ-028 | Margin | P2 §2 | Margin (model undefined → `DR-008`). |
| REQ-029 | Entry price | P2 §2 | Position entry price. |
| REQ-030 | Mark price | P2 §2 | Mark price (source/formula undefined → `DR-010`). |
| REQ-031 | PnL (profit/loss) | P2 §2 | Profit/loss calculation. |
| REQ-032 | Liquidation calculation | P2 §2 | Liquidation calculation (algorithm undefined → `DR-009`). |
| REQ-033 | Open position | P2 §2 | View open positions. |
| REQ-034 | Position history | P2 §2 | Closed positions. |
| REQ-035 | Order history (futures) | P2 §2 | Futures order history. |

### Binary (P3 §2)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-036 | Asset selection | P3 §2 | Choose asset. |
| REQ-037 | UP / DOWN | P3 §2 | Direction choice. |
| REQ-038 | Trade amount | P3 §2 | Stake input. |
| REQ-039 | Expiry (মেয়াদ) time | P3 §2 | Expiry selection. |
| REQ-040 | Countdown timer | P3 §2 | Visible countdown. |
| REQ-041 | Potential payout | P3 §2 | "সম্ভাব্য পে-আউট" shown before/while trading (formula undefined → `DR-012`). |
| REQ-042 | Active trades | P3 §2 | List of running trades. |
| REQ-043 | Completed trades | P3 §2 | List of settled trades. |
| REQ-044 | Win/loss history | P3 §2 | Outcome history. |

### Demo trading (P3 §2)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-045 | Demo for Futures and Binary | P3 §2 | Demo exists for **both futures and binary** (spot demo is **not** mentioned → `DR-029`). |
| REQ-046 | Virtual balance | P3 §2 | Virtual funds. |
| REQ-047 | Simulated trading | P3 §2 | Simulated trades. |
| REQ-048 | Virtual PnL | P3 §2 | Virtual profit/loss. |
| REQ-049 | Simulated liquidation | P3 §2 | Liquidation simulated in demo. |
| REQ-050 | Demo trade history | P3 §2 | History for demo. |
| REQ-051 | Mandatory demo disclaimer | P3 §2 | Every demo account must clearly show: **“ডেমো অ্যাকাউন্ট — শুধুমাত্র ভার্চুয়াল ফান্ড। কোনো প্রকৃত অর্থ নয়।”** ("Demo account — virtual funds only. No real money.") Exact wording preserved; English rendering is a translation. |

### Wallet & financial (P3 §3)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-052 | User wallet | P3 §3 | Per-user wallet. |
| REQ-053 | Available balance | P3 §3 | Explicitly "available balance". (Locked balance is **not** named — see `ASM-008`.) |
| REQ-054 | Deposit | P3 §3 | Deposit funds. |
| REQ-055 | Withdrawal request | P3 §3 | Users **request** withdrawals (implies an approval/processing step). |
| REQ-056 | Internal transfer "where applicable" | P3 §3 | Conditional; meaning undefined → `DR-030`. |
| REQ-057 | Transaction history | P3 §3 | History list. |
| REQ-058 | Transaction ID | P3 §3 | Unique ID per transaction. |
| REQ-059 | Transaction fee | P3 §3 | Fee on transactions (semantics → `DR-037`). |
| REQ-060 | Transaction status | P3 §3 | Status per transaction. |
| REQ-061 | Auditable ledger record | P3 §3 | "অডিটেবল লেজার রেকর্ড" — ledger records must be auditable. |

### Additional features (P3 §4)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-062 | Funding plan | P3 §4 | Undefined product (`DR-021`). |
| REQ-063 | Funding calculator | P3 §4 | Calculator for funding plans. |
| REQ-064 | Referral program | P3 §4 | Referral programme. |
| REQ-065 | Referral earnings | P3 §4 | Referrers earn (rates admin-configurable, P4). |
| REQ-066 | Top traders / leaderboard | P3 §4 | Leaderboard (metric undefined → `DR-022`). |
| REQ-067 | Coin/asset listing application | P3 §4 | Applications to list a coin/asset (`DR-031`). |
| REQ-068 | Markets page | P3 §4 | "মার্কেটস পেজ". |
| REQ-069 | Basic P2P marketplace | P3 §4 | Only "basic" (`DR-015`). |
| REQ-070 | Support/ticket system | P3 §4 | In-app support tickets. |
| REQ-071 | FAQ | P3 §4 | FAQ page. |
| REQ-072 | Announcements | P3 §4; P4 | Announcements (admin-managed). |
| REQ-073 | Terms & Conditions | P3 §4 | Page. **Content provided by client** (P6 §10). |
| REQ-074 | Privacy Policy | P3 §4 | Page. Content by client. |
| REQ-075 | Risk Disclosure | P3 §4 | Page. Content by client. |

### Admin panel (P4 §5)
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-076 | Users, user status, trading permission | P4 §5 | Admin manages users, statuses, trading permissions. |
| REQ-077 | Assets/coins, initial prices, markets & pairs, trading fees | P4 §5 | Admin asset & market management. |
| REQ-078 | Futures settings, leverage, binary settings | P4 §5 | Admin trading-product configuration. |
| REQ-079 | Funding plan, referral rate, leaderboard, listing applications | P4 §5 | Admin growth-feature management. |
| REQ-080 | Deposits, withdrawals, P2P, transactions | P4 §5 | Admin finance operations. |
| REQ-081 | Announcements, platform settings, **basic** admin/activity log | P4 §5 | Log is stated as **"basic"** — this document recommends stronger audit (Sec 28) as **[REC]**. |
| REQ-082 | Business settings configurable from admin "where logically possible" | P4 §5 | Soft requirement; boundaries in Sec 26. |

### Stack, timeline, dependencies, commitments, legal, deliverables
| ID | Feature | Source | Description |
|---|---|---|---|
| REQ-083 | Technology stack | P4 §6 | See Sec 6. Gin **/** Fiber and R2 **or equivalent** and SSLCOMMERZ **/** Stripe are open choices. |
| REQ-084 | ~6 weeks timeline | P1, P4–P5 §7, P7 | Wk1–2, Wk3–4, Wk5–6 (scopes in Sec 39). "Estimated" ("আনুমানিক") delivery. |
| REQ-085 | Client-provided third-party services | P5 §8 | VPS/cloud; Cloudflare R2/storage; domain & DNS; email/SMTP; SMS/OTP; market data API; KYC/AML; trading/financial API; other APIs; SSL if needed; monitoring/security service; other subscriptions. |
| REQ-086 | Payment provider | P5 §8; P7 | SSLCOMMERZ **or** Stripe, subject to suitability for client business model & jurisdiction. Scope = development-side integration of **one agreed** provider; client supplies docs + approved merchant credentials. |
| REQ-087 | 24/7 support channel | P1; P5 §9 | Dedicated channel for urgent issues (downtime, security, payment failure, critical trading errors) during development and free-support period. |
| REQ-088 | 1-month free revision | P1; P5 §9 | After production delivery; within agreed scope (UI/UX refinement, minor feature changes, configuration changes). |
| REQ-089 | 1-year free support & bug fixes | P1; P5 §9 | 12 months; covers defects in delivered scope only. Excludes new features, major redesign, third-party provider charges, major trading-system changes (quoted separately). |
| REQ-090 | Post-support monthly service | P6 §9 | Separate monthly charge: basic server monitoring, deployment help, routine maintenance, minor bug fixes, basic support, backup/operational help, minor config changes. Excludes major features/redesign/third-party fees/infra costs/major trading changes. |
| REQ-091 | Client responsibilities | P6 §10 | Domain; VPS/cloud; Cloudflare/R2 account if needed; payment merchant account; API credentials; market data/API access; business info; provider docs; legal documents/content; T&C; Privacy Policy; Risk Disclosure content; licences & regulatory approvals. |
| REQ-092 | Delay clause | P6 §10 | Delays in accounts/APIs/approvals/info may affect delivery timeline. |
| REQ-093 | Legal/compliance = client responsibility | P6 §11 | Client responsible for financial/trading licences, KYC/AML, payment regulation, consumer protection, data protection, tax, trading restrictions, binary/futures regulation. Dev team provides technical implementation only. |
| REQ-094 | Gate on public launch | P6 §11 | Real-money functionality "should be" opened to the public only after obtaining approvals and completing legal/compliance review. |
| REQ-095 | Deliverables | P6–P7 §12 | Responsive trading website; user dashboard; trading interface; wallet & transaction system; admin dashboard; backend API; database; payment gateway integration; agreed third-party integrations; **source code**; production deployment; primary bug-fixing support; 24/7 support channel; 1-month revision; 1-year support. |
| REQ-096 | Delivery type | P7 summary | "MVP production release". |

**Items the proposal does NOT mention (so are out of proven scope; do not build without a decision):** mobile native apps, spot demo trading, multi-language UI, 2FA, stop/stop-limit orders, order-book depth UI, API keys for users, staking, margin borrowing, crypto wallets/on-chain deposits, formal KYC UI (KYC is only a client-provided **service**), a staging environment, CI/CD, data-retention policy, automated backups (only "backup/operational help" in *post-support* service).

---

# 2. PROJECT OVERVIEW

| Item | Value | Tag |
|---|---|---|
| Project name | "Trading Platform" (proposal title: ট্রেডিং প্ল্যাটফর্ম ডেভেলপমেন্ট প্রপোজাল). No brand name given. | REQ |
| Vendor | hakaluki.dev (Sylhet, Bangladesh) — contact@hakaluki.dev | REQ |
| Project type | Real-money web application, MVP production release | REQ-096 |
| Business purpose | Let users trade (spot, futures, binary) platform-listed assets with real money, plus demo trading | REQ-001 |
| Primary users | Traders; admins. Others undefined | DR-026 |
| Main capabilities | See Sec 3 | REQ |
| Architecture | Centralized monolith-friendly services; no blockchain | REQ-002 |
| Real vs demo | Real-money accounts + demo (virtual) accounts for futures & binary | REQ-045 |
| Stack | Next.js/TS/Tailwind · Go (Gin/Fiber) · PostgreSQL · Redis · WebSocket · R2 | REQ-083 |
| Infra | VPS/cloud server, client-provided | REQ-085 |
| External services | Payment gateway, SMTP, SMS/OTP, market data API, KYC/AML, storage, monitoring | REQ-085 |
| Timeline | ~6 weeks (estimate) | REQ-084 |
| Delivery | Source code + production deployment + support commitments | REQ-095 |

## 2.1 The system in five minutes

- Users register, verify email/phone, log in, and see a dashboard.
- Each user has a **wallet** (available balance). Money enters via **deposits** (payment gateway) and leaves via **withdrawal requests** (processed by admin/provider). Every balance change is a **ledger** entry.
- The **spot** section lets users buy/sell platform assets on **trading pairs** with **market** and **limit** orders. Asset prices move via a "configured buy/sell mechanism" (undefined).
- The **futures** section lets users open **long/short** positions with **leverage** and **margin**; PnL and **liquidation** are computed against a **mark price**.
- The **binary** section lets users predict **UP/DOWN** for an **expiry**; payout is computed at settlement.
- **Demo** accounts run futures/binary with virtual money, shown with a mandatory disclaimer.
- Extra modules: funding plans + calculator, referral, leaderboard, coin listing applications, basic P2P, support tickets, FAQ, announcements, legal pages.
- An **admin panel** configures nearly everything and processes deposits/withdrawals/P2P/listings.
- **Realtime** price/order/position/wallet updates flow over **WebSocket**; **Redis** caches, rate-limits and fans out events; **PostgreSQL** is the only source of financial truth.

---

# 3. PRODUCT SCOPE — FEATURE INVENTORY

Notation: **Act**=actors, **In/Out**=inputs/outputs, **Rules**=business rules, **Dep**=dependencies, **St**=states, **DB**=entities, **API**=see Sec 18, **RT**=realtime, **Sec**=security, **Edge**=edge cases (Sec 36), **AC**=acceptance criteria (Sec 35). Rules marked `[REQ]` come from the proposal; everything else `[ASM]/[REC]/[DR]`.

### A. Public Website — REQ-004, 071–075
- **Purpose:** Marketing homepage, markets page (public), FAQ, legal pages (T&C, Privacy, Risk Disclosure), announcements.
- **Act:** Guest, User. **In:** none. **Out:** static/SSR pages; public market list.
- **Rules:** Legal text supplied by client `[REQ-091]`; publish/version legal pages `[REC]`; dark theme `[REQ-001]`. Risk Disclosure link visible on trading pages `[REC]`.
- **Dep:** CMS-style storage for FAQ/announcements/legal (`legal_documents`, `faqs`, `announcements`). **St:** draft/published `[ASM]`. **RT:** public price ticker optional. **Sec:** no PII; cache safely. **Edge:** legal doc updated while user consented → re-consent policy `DR-027`. **AC:** pages render, are responsive, versioned.

### B. Authentication & Identity — REQ-005, 008, 009, 010
- **Purpose:** Registration, login, verification, password management. **Act:** Guest, User.
- **In:** email/phone, password, OTP. **Out:** session/tokens. **Rules:** identifier strategy (email-only? phone-only? both?) `DR-032`; verification "support" means capability exists, mandatory-ness undefined `DR-032`.
- **Dep:** SMTP, SMS/OTP (client). **St:** user states Sec 30. **DB:** `users`, `credentials`, `verification_codes`, `sessions`, `login_attempts`. **Sec:** Sec 19. **AC:** Sec 35.

### C. User Account — REQ-006, 007, 010
- **Purpose:** Dashboard, profile, security settings. **Act:** User. **Rules:** profile fields undefined `DR-032`; changing email/phone/password requires re-authentication `[REC]`. **DB:** `user_profiles`, `sessions`, `notification_preferences`. **Edge:** suspended user viewing dashboard (read-only) `[ASM-014]`.

### D. Wallet & Financial System — REQ-052..061
- **Purpose:** Hold user funds, record every movement. **Act:** User, Admin/Finance, System.
- **In:** deposit/withdraw requests, trade/fee/settlement events. **Out:** balances, transaction history.
- **Rules:** `[REQ]` available balance, tx ID/fee/status, auditable ledger. `[ASM]` locked balance, reservations, double-entry (Sec 10). **Dep:** Payments, Admin, Audit. **St:** Sec 30. **DB:** `ledger_accounts`, `ledger_entries`, `wallet_balances`, `transactions`. **RT:** `wallet.updated`. **Sec:** highest. **Edge/AC:** Sec 10, 31, 36.

### E. Spot Trading — REQ-012..025
- **Purpose:** Buy/sell platform assets on pairs. **Act:** Trader, Admin.
- **In:** pair, side, type (market/limit), quantity/price. **Out:** orders, trades, balances, prices.
- **Rules:** `[REQ]` initial price configurable, price moves by configured buy/sell mechanism, market & limit orders, fees. **All mechanics `DR-001/002/003`.**
- **DB:** `assets`, `markets`, `orders`, `trades`, `price_ticks`, `candles`. **RT:** `market.price.updated`, `order.updated`, `trade.executed`. **AC:** Sec 11, 35.

### F. Futures Trading — REQ-026..035
- **Purpose:** Leveraged long/short. **Act:** Trader. **Rules:** all formulas `DR-007..011`. **DB:** `futures_markets`, `futures_orders`, `positions`, `position_events`, `liquidations`. **RT:** `position.updated`. **Sec:** liquidation idempotency. **AC:** Sec 12, 35.

### G. Binary Trading — REQ-036..044
- **Purpose:** UP/DOWN predictions with expiry. **Rules:** payout/settlement `DR-012/013/014`. **DB:** `binary_products`, `binary_trades`. **RT:** `binary.trade.updated`. **AC:** Sec 13.

### H. Demo Trading — REQ-045..051
- **Purpose:** Practice with virtual funds for futures & binary. **Rules:** disclaimer `[REQ-051]`; isolation Sec 14. **DB:** `demo_accounts` and demo-prefixed tables (Sec 9). **Edge:** spot demo not in scope `DR-029`.

### I. Market Data — REQ-016, 017, 024, 085
- **Purpose:** Supply prices/charts. **Dep:** client market-data API; platform-internal prices. **Rules:** Sec 15. **DB:** `price_ticks`, `candles`, `market_data_sources`.

### J. Funding System — REQ-062, 063 — **undefined** (`DR-021`). Sec 23.
### K. Referral System — REQ-064, 065 — rules `DR-020`. Sec 24.
### L. Leaderboard — REQ-066 — metric `DR-022`. Sec 25.
### M. Coin/Asset Listing — REQ-067 — workflow `DR-031`. Sec 26/30.
### N. P2P Marketplace (basic) — REQ-069 — rules `DR-015`. Sec 22.
### O. Notifications — REQ-011 — channels/triggers `DR-028`. Sec 29.
### P. Support/Ticket — REQ-070 — categories/SLA `DR-044`. **DB:** `support_tickets`, `ticket_messages`, `attachments`.
### Q. FAQ — REQ-071. **DB:** `faqs`. Admin editing of FAQ is not listed in §5 → `ASM-025` (managed via platform settings/CMS by admin).
### R. Announcements — REQ-072, 081. **DB:** `announcements`.
### S. Legal Pages — REQ-073..075, 091. Content by client. **DB:** `legal_documents` (versioned).
### T. Admin Panel — REQ-076..082. Sec 27.
### U. Payments — REQ-054, 086. Sec 21.
### V. Security — REQ-010. Sec 19.
### W. Audit & Logging — REQ-061, 081. Sec 28.
### X. Infrastructure — REQ-083, 085. Sec 37.
### Y. Monitoring — REQ-085 (client-provided service), REQ-090. Sec 33.

For groups J–Y, per-feature Purpose/Actors/Inputs/Outputs/Rules/etc. are given in their dedicated sections (as indicated), because they are longer than a summary block.

---

# 4. ACTORS AND ROLES

**Proposal mentions only:** "user" (ইউজার), "admin" (অ্যাডমিন), and a "support channel" (vendor-side, not an in-app role). Everything else below is `[ASM]` (`ASM-010`) pending `DR-026`.

| Role | Basis | Description |
|---|---|---|
| Guest | implied by public site | Unauthenticated visitor. |
| Registered User | `[REQ-005]` | Has account. |
| Verified User | `[ASM]` | Passed email/phone (and possibly KYC) verification; whether verification gates features is `DR-032/018`. Modeled as **flags/attributes**, not a separate role. |
| Trader (real) | `[REQ-076]` "trading permission" | A user with real-trading permission enabled by admin. Modeled as a **permission**, not a role. |
| Demo Trader | `[REQ-045]` | Same user using demo account; not a separate identity. |
| Admin | `[REQ-076..082]` | Panel operator. |
| Super Admin | `[ASM]` | Manages admins, roles, sensitive config. Recommended because admin panel controls money. |
| Support Staff | `[ASM]` | Tickets/FAQ only. |
| Finance Operator | `[ASM]` | Deposits/withdrawals/transactions approval. |
| System/Worker | `[TD]` | Non-human actor: settlement, liquidation, price ingestion, notification workers. Every automated ledger entry records `actor=system:<worker>`. |

**[REC]** Implement RBAC with permission strings (`withdrawal.approve`, `asset.create`, …) and roles as permission bundles, so `DR-026` can be resolved by configuration, not code changes.

## 4.1 Permission matrix (proposed — `[ASM-010]`)

Legend: ✔ allowed · ○ own data only · — no · ◐ read-only

| Capability | Guest | User | Trader (perm.) | Support | Finance Op | Admin | Super Admin |
|---|---|---|---|---|---|---|---|
| View public pages/markets | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Register/login | ✔ | — | — | — | — | — | — |
| Profile/security/notifications | — | ○ | ○ | ○ | ○ | ○ | ○ |
| Wallet view/history | — | ○ | ○ | ◐(ticket ctx) | ◐ all | ◐ all | ◐ all |
| Deposit | — | ○ (if allowed) | ○ | — | — | — | — |
| Withdrawal request | — | ○ (if allowed) | ○ | — | — | — | — |
| Approve/reject withdrawal | — | — | — | — | ✔ | ✔ `[DR-016]` | ✔ |
| Spot/Futures/Binary real trading | — | — | ○ | — | — | — | — |
| Demo futures/binary | — | ○ | ○ | — | — | — | — |
| Funding/referral/leaderboard view | — | ○ | ○ | — | — | ✔ | ✔ |
| Submit listing / P2P / tickets | — | ○ | ○ | — | — | — | — |
| Reply to tickets | — | — | — | ✔ | — | ✔ | ✔ |
| Manage users/status | — | — | — | ◐ | — | ✔ | ✔ |
| Toggle trading permission | — | — | — | — | — | ✔ | ✔ |
| Manage assets/markets/fees/leverage/binary | — | — | — | — | — | ✔ (maker) | ✔ (approver `[REC]`) |
| Manage admins/roles | — | — | — | — | — | — | ✔ |
| View audit log | — | — | — | — | ◐ finance scope | ✔ | ✔ |
| Manual ledger adjustment | — | — | — | — | ✔ dual-control `[DR-041]` | — | ✔ |

**Financial privileges:** only the ledger service moves money; no role (even Super Admin) edits balance columns directly `[REC]`. **Trading privileges:** real trading requires `users.status=active` **and** trading permission (`[REQ-076]`) **and** (if decided) KYC level (`DR-018`).

---

# 5. USER JOURNEYS

Format per flow: **START → validation → business logic → transaction → persistence → event → notification → END**, then **Failure paths**. Detailed financial flows are in Sec 10–14/21. Notation: `tx` = one PostgreSQL transaction. Parameter values are `[DR]` unless stated.

| # | Flow | Happy path | Failure paths |
|---|---|---|---|
| 1 | Registration `[REQ-005]` | Submit form → validate format/uniqueness/password policy `[ASM]` → hash password (Argon2id) → `tx`: create `users(status=pending_verification)`, create real wallet + demo account `[ASM-016]`, referral attribution if code present → event `user.registered` → send verification (email/SMS) | Duplicate identifier (generic response to avoid enumeration); weak password; rate-limit hit; provider send failure → user created, resend allowed |
| 2 | Email/phone verification `[REQ-008]` | Enter OTP → check hash/expiry/attempts → `tx`: mark verified, status→`active` (if that's the rule `DR-032`) → audit → notify | Expired/wrong/reused OTP; lockout after N attempts; resend throttle |
| 3 | Login | Credentials → rate limit → verify hash → (2FA if enabled) → create session, issue access+refresh tokens → audit `login.success` | Wrong creds (generic error, increment counter); locked; suspended/banned account; unverified account |
| 4 | Password reset `[REQ-009]` | Request → always respond "if account exists…" → single-use time-limited token → set new password → revoke all sessions → audit + notify | Expired/used token; reset spam throttling |
| 5 | Profile management `[REQ-007]` | Edit fields → validate → update → audit (before/after for sensitive) | Changing email/phone → re-verify; concurrent edit (optimistic version) |
| 6 | Account security `[REQ-010]` | Change password / view & revoke sessions / (2FA setup `[DR-032]`) | Reauth required; stale session |
| 7 | Deposit `[REQ-054]` | Choose amount/method → create `payment_intent`(pending) + `deposit`(pending) → redirect to provider → provider **server-side** webhook/verification → `tx`: mark deposit `completed`, ledger credit, balance update → event `wallet.updated` → notify | Cancel, failure, timeout, duplicate webhook (idempotent), amount mismatch (hold for review), provider down |
| 8 | Withdrawal request `[REQ-055]` | Request → checks (status, permission, KYC `DR-018`, limits, available) → `tx`: lock funds (reservation), create `withdrawal(pending)`, ledger hold → admin/provider processing → success: finalize ledger (locked→out), `completed`; failure/reject: release lock → notify | Insufficient funds, duplicate request (idempotency key), admin reject, provider payout failure (`DR-017`), account suspended mid-flight |
| 9 | Transaction lifecycle `[REQ-057..060]` | Any money event creates `transactions` row with public `transaction_id`, type, amount, fee, status; status changes append `transaction_status_history` | Stuck pending → reconciliation job alerts |
| 10 | Spot buy `[REQ-014]` | Select pair → enter qty/amount → server validates market active, price freshness, balance → `tx`: reserve quote funds → execute per engine (`DR-002/003`) → settle: debit quote, credit base, fees → event `trade.executed`, `wallet.updated` → notify | Insufficient balance, market disabled, stale price, slippage exceeded `[DR]`, min-notional |
| 11 | Spot sell | Mirror of buy on base asset holdings | Same |
| 12 | Market order `[REQ-019]` | Executes immediately against engine price/book | Slippage/liquidity limits `DR-002` |
| 13 | Limit order `[REQ-019]` | Reserve funds → rest as `open` → fill when price condition met (engine) → partial/full fill → release/settle | Never fills; partial fill; market disabled with open orders |
| 14 | Order cancellation | Request cancel → `tx`: lock order row, if `open`/`partially_filled` → `cancelled`, release remaining reservation → event | Already filled (return `ORDER_NOT_CANCELABLE`); cancel/fill race (row lock decides) |
| 15 | Trade execution | Engine match/price-apply → create `trades` + ledger entries atomically (Sec 11) | Rollback entire `tx` on any failure; retry safe via deterministic IDs |
| 16 | Futures long `[REQ-026]` | Select market, leverage, size → compute required margin → `tx`: lock margin, create order/position at entry price → event `position.updated` | Margin insufficient; leverage > max; market disabled |
| 17 | Futures short | Mirror of long | Same |
| 18 | Margin handling | Initial margin reserved at open; maintenance margin monitored by worker; add/remove margin `[DR-008]` | Removal that breaches maintenance blocked |
| 19 | Leverage handling | Chosen per position/market within admin max `[REQ-027]`; change on open position `[DR-007]` | Change that would breach maintenance blocked |
| 20 | PnL calculation | Unrealized against mark price (display, recomputed); realized at close → ledger | Price gap; stale mark → freeze/alert |
| 21 | Liquidation `[REQ-032]` | Worker detects mark ≤ liq price (long) → `tx`: lock position, verify still open & breach, close, settle margin/loss, fee, write `liquidations` row → event → notify | Double-processing (idempotent by position-version), race with user close, negative equity policy `DR-009` |
| 22 | Binary UP | Select asset/expiry/amount → validate → `tx`: debit stake (reserve), record entry price & server timestamp → `active` | Market closed; below min/above max; late order |
| 23 | Binary DOWN | Mirror | Same |
| 24 | Binary expiry | Worker picks `expires_at ≤ now()` → fixes settlement price per source (`DR-013`) | Price source unavailable at expiry → policy `DR-013` |
| 25 | Binary settlement | `tx`: lock trade, compare prices, compute payout, ledger credit (win) or release-to-house (loss), status `won/lost` (or tie policy) → event → notify | Double settlement prevented by `settled_at IS NULL` guard + unique ledger idempotency key |
| 26 | Demo futures trade `[REQ-045]` | Same UX/logic as futures but on demo account, demo ledger, demo tables | Attempt to mix real/demo rejected at type level |
| 27 | Demo binary trade | Same | Same |
| 28 | Funding plan participation `[REQ-062]` | **Undefined** — see Sec 23 | — |
| 29 | Referral `[REQ-064]` | Share code → new user registers with code → attribution stored immutably → reward rule triggers per `DR-020` → ledger credit | Self-referral, duplicate accounts, reversal |
| 30 | Coin listing application `[REQ-067]` | Submit → `submitted` → admin review → approve/reject (→ optional asset creation) | Missing docs; duplicate symbol |
| 31 | P2P transaction `[REQ-069]` | Undefined — Sec 22 | Dispute, timeout |
| 32 | Support ticket `[REQ-070]` | Create → `open` → staff reply → user reply → `resolved/closed` | Spam limits; attachment scan/limits |
| 33 | Admin user management | Search → view → change status/permission (reason required) → audit before/after | Self-demotion protections; last super-admin protection |
| 34 | Admin trading-permission mgmt | Toggle permission → effect on open orders/positions `DR-019` → audit | Suspension mid-trade Sec 36 |
| 35 | Admin asset mgmt | Create asset (symbol, precision, initial price `[REQ-013]`) → create markets/pairs → activate | Invalid precision, duplicate symbol, price change on active market (dangerous, Sec 26) |
| 36 | Admin withdrawal processing | Queue → review → approve/reject (dual control `[REC]`) → payout → complete/fail | Provider failure, double approval |
| 37 | Admin transaction review | Filter by status/type/user → inspect ledger lines → flag/resolve | Stuck-pending resolution |
| 38 | Admin platform configuration | Edit settings → validate → (maker/checker for dangerous) → versioned save → audit | Invalid/inconsistent configuration rejected |

---

# 6. SYSTEM ARCHITECTURE

**[TD]** Modular monolith backend in Go (Gin **or** Fiber — `ADR-002`), plus a separate worker process from the same codebase. Not microservices: 6 weeks + single-DB financial consistency favors a **monolith with strict module boundaries** `[REC]`.

## 6.1 Diagram
```mermaid
flowchart LR
  subgraph Client
    B[Browser - Next.js/TS/Tailwind]
  end
  subgraph Edge
    CF[DNS/TLS/Reverse proxy - Nginx or Caddy]
  end
  subgraph App["VPS / Cloud (client-provided)"]
    FE[Next.js server]
    API[Go API - Gin/Fiber]
    WS[Go WebSocket gateway]
    WK[Go Workers: settlement, liquidation, price, notify, reconcile]
    PG[(PostgreSQL - authoritative)]
    RD[(Redis - cache, pubsub, queues, locks)]
  end
  subgraph External["Client-provided services"]
    PAY[SSLCOMMERZ or Stripe]
    MD[Market Data API]
    KYC[KYC/AML service]
    SMTP[SMTP]
    SMS[SMS/OTP]
    R2[Cloudflare R2 / object storage]
    MON[Monitoring/Security]
  end
  B --> CF --> FE
  B --> CF --> API
  B <--> CF <--> WS
  API --> PG
  API --> RD
  WK --> PG
  WK --> RD
  WS <--> RD
  API <--> PAY
  PAY -- webhook --> API
  WK --> MD
  API --> KYC
  WK --> SMTP
  WK --> SMS
  API --> R2
  API -.-> MON
```

## 6.2 Layer descriptions
| Layer | Design |
|---|---|
| **Frontend** `[REQ-083]` | Next.js (App Router `[REC]`) + TypeScript + Tailwind; dark theme default `[REQ-001]`; server components for public pages (SEO), client components for trading UIs; charts via a charting library (choice `[DR-036]`); WebSocket client with reconnection; **no financial calculation is authoritative on client**. |
| **Backend** | Go; layered: transport (HTTP/WS) → application (use-cases) → domain (entities, rules, state machines) → infrastructure (Postgres, Redis, providers). |
| **API** | REST JSON, versioned `/api/v1`, consistent envelope (Sec 32). |
| **Database** | PostgreSQL single primary; `NUMERIC` for money; migrations via versioned SQL (`golang-migrate` or `goose` `[REC]`). |
| **WebSocket** | Go gateway inside API process at first `[REC]`, separable later; Redis pub/sub for fan-out (Sec 16/17). |
| **Redis** | Cache, rate limit, pub/sub, job queue, short locks (Sec 17). |
| **Workers** | Same Go module, separate binary `cmd/worker`: price ingestion, limit-order/liquidation scanner, binary settlement, notification dispatch, payment reconciliation, leaderboard aggregation. |
| **Job queues** | Redis-backed (`asynq` `[REC]`) for non-financial-critical jobs; **financial-critical jobs are DB-driven** (rows with status + `FOR UPDATE SKIP LOCKED`) so a Redis loss cannot lose settlement duty `[TD]`. |
| **Storage** | R2 or equivalent (S3-compatible API) `[REQ-083]`; private bucket + signed URLs for KYC docs/ticket attachments/listing docs. |
| **Payments** | Provider adapter interface (Sec 21). |
| **AuthN/AuthZ** | Sec 19. |
| **Logging/monitoring** | Sec 33. |
| **Deployment/backup/DR** | Sec 37. RPO/RTO targets `DR-046`. |

---

# 7. MONOREPO / PROJECT STRUCTURE

**[REC]** Single monorepo, no heavy tooling (no Nx/Turborepo needed for 2 apps).

```
/
├── context.md                 # this file (source of truth)
├── frontend/                  # Next.js app (user site + admin UI under /admin, or separate app dir)
├── backend/                   # Go module: API, WS, worker binaries
├── shared/
│   └── api-contract/          # OpenAPI spec (source of truth for API), generated TS types
├── infrastructure/            # docker-compose, nginx/caddy conf, systemd units, backup scripts
├── docs/                      # ADRs, runbooks, API docs (extensions of context.md)
└── .github/workflows/         # CI (lint, test, build) — CI is [REC], not in proposal
```
**Why not a `/worker` top-level dir:** worker shares domain code with API; it's `backend/cmd/worker`. **Shared types:** generated from OpenAPI (`openapi-typescript`), not hand-shared; Go and TS do not share code.

## 7.1 Go backend layout
```
backend/
├── cmd/
│   ├── api/main.go            # HTTP + WS server
│   ├── worker/main.go         # background workers
│   └── migrate/main.go
├── internal/
│   ├── platform/              # config, logger, db (pgx), redis, http server, errors, clock, idgen
│   ├── auth/  users/  rbac/
│   ├── ledger/                # ONLY module allowed to write ledger_entries/wallet_balances
│   ├── wallet/  deposits/  withdrawals/  payments/{provider, sslcommerz, stripe}
│   ├── assets/  markets/  marketdata/  pricing/
│   ├── spot/  futures/  binary/  demo/
│   ├── funding/  referral/  leaderboard/  listings/  p2p/
│   ├── support/  content/  announcements/  notifications/
│   ├── admin/  audit/  settings/
│   ├── realtime/              # ws hub, channels
│   └── jobs/                  # worker job definitions
│       # each domain: domain/ (entities, state machine, invariants), service/ (use-cases), repo/ (pgx), transport/http, events/
├── migrations/
├── api/openapi.yaml
└── test/                      # integration, concurrency, financial vectors
```
**Rules:** `domain/` imports nothing infra; `transport` never touches repos directly; **only `ledger` mutates money tables**; other modules call `ledger.Post(...)` inside the caller's `tx` (Sec 10).

## 7.2 Next.js frontend layout
```
frontend/src/
├── app/                       # routes: (public), (auth), (user), (trade), admin/
├── features/                  # auth, wallet, spot, futures, binary, demo, p2p, funding, referral, leaderboard, listings, support, admin-*
│   └── <feature>/{components, hooks, api, schemas, types, utils}
├── components/ui/             # design-system primitives
├── lib/                       # api client, ws client, format (money via decimal strings), auth helpers
├── stores/                    # UI state only (never authoritative money)
├── constants/ enums/          # fixed option sets
└── styles/
```
Money is handled as **decimal strings** end-to-end on the client; formatting only, no arithmetic authority `[TD]`.

---

# 8. DOMAIN MODULES

Common **failure conditions** everywhere: validation error, unauthorized, idempotent replay, DB serialization/deadlock retry, dependency timeout. Listed domain-specific ones below.

| Domain | Responsibility | Key entities | Events emitted | Invariants | Failure conditions |
|---|---|---|---|---|---|
| Auth | Identity, credentials, sessions, tokens | users, credentials, sessions, verification_codes | user.registered, login.success/failed | one active identifier per user; hashed secrets only | lockout, provider send fail |
| Users | Profile, status, permissions | user_profiles, user_permissions | user.status_changed | status transitions per Sec 30 | admin self-lockout |
| Accounts | Real vs demo account containers | accounts(type=real\|demo) | account.created | exactly one real + ≤ one demo per user `[ASM-016]` | — |
| Assets | Coin/asset catalog & precision | assets | asset.created/updated | symbol unique; precision immutable once traded `[REC]` | invalid precision |
| Markets | Pairs & product enablement | markets, market_configs | market.status_changed | base≠quote; config versioned | disabled with open orders |
| Orders | Spot order lifecycle | orders | order.created/updated | reserved = f(open orders) | cancel/fill race |
| Trades | Executed fills | trades | trade.executed | immutable after insert | — |
| Wallet | Balance views/history | wallet_balances, transactions | wallet.updated | Sec 31 | lock timeout |
| Ledger | Double-entry postings, reservations | ledger_accounts, journals, ledger_entries | ledger.posted | Σ(debits)=Σ(credits) per journal; append-only | imbalance → reject |
| Deposits | Deposit lifecycle | deposits, payment_intents | deposit.completed/failed | credit at most once | webhook duplicate/mismatch |
| Withdrawals | Withdrawal lifecycle | withdrawals | withdrawal.* | funds reserved before review | payout failure |
| Spot | Engine orchestration (price/matching) | — | — | per `DR-002/003` | stale price |
| Futures/Positions/Margin/Liquidation | Leveraged trading | futures_orders, positions, liquidations | position.updated, liquidation.executed | equity ≥ 0 unless `DR-009` allows | price gap |
| Binary | Prediction trades | binary_trades | binary.trade.* | settled once | price source down |
| Demo | Virtual accounts & trades | demo_* | demo.* | never touches real ledger | reset abuse |
| Funding | Funding plans & calculator | funding_plans, funding_participations | funding.* | `DR-021` | undefined |
| Referral | Codes, attribution, earnings | referral_codes, referrals, referral_earnings | referral.reward | attribution immutable | reversal |
| Leaderboard | Rank computation | leaderboard_snapshots | — | derived only | — |
| P2P | Basic offers/orders | p2p_* | p2p.* | `DR-015` | dispute |
| Listings | Coin listing applications | listing_applications | listing.* | state machine Sec 30 | duplicate |
| Notifications | Delivery & preferences | notifications, notification_deliveries | — | at-least-once, dedupe key | provider failure |
| Payments | Provider abstraction | payment_intents, payment_events | payment.* | provider webhook authoritative | signature fail |
| Admin | Privileged operations | admin_actions | admin.* | every action audited | — |
| Audit | Immutable trail | audit_logs | — | append-only | log write failure blocks sensitive op |
| Support | Tickets | support_tickets, ticket_messages | ticket.* | state machine | — |

Each domain owns: **entities**, **services** (use-cases), **repositories** (SQL), **events** (outbox rows → Redis pub/sub/notify), **APIs** (Sec 18), **dependencies** (only downward: transport→service→domain; cross-domain through service interfaces or events; only `ledger` writes money).

---

# 9. DATABASE DESIGN (PostgreSQL)

All of Sec 9 is **[TD]/[REC]** design; the proposal only mandates PostgreSQL and "auditable ledger records" `[REQ-061]`.

## 9.1 Global conventions `[TD]`
- **PK:** `id UUID` (v7 preferred for index locality `[REC]`) — plus human-facing `public_id`/`transaction_id` where needed `[REQ-058]` (e.g. `TXN-<ULID>`).
- **Timestamps:** `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()` on mutable tables; all times UTC; server time authoritative.
- **Money/quantity/price:** `NUMERIC(38,18)` (see 9.2). **Never** `float/real/double`.
- **Status columns:** `text` + `CHECK (status IN (...))` mirrored by Go enums (avoid PG enum types — hard to migrate `[REC]`).
- **Optimistic locking:** `version int NOT NULL DEFAULT 1` on mutable financial rows.
- **Soft delete:** `deleted_at` only for content (FAQ, announcements, legal drafts). **Financial and audit tables are never deleted or soft-deleted** — corrections are new compensating rows.
- **Isolation of demo:** separate PostgreSQL **schema** `demo` mirroring the money/trading tables; real tables in schema `real` (or `public`). No FK crosses schemas; DB roles/grants and Go types prevent cross-writes (Sec 14).

## 9.2 Monetary precision, rounding & fees `[TD]`, values `[DR-047]`
| Topic | Strategy |
|---|---|
| Storage | `NUMERIC(38,18)` for amounts, prices, quantities, rates. Each `assets.decimals` (0–18) defines the **tradable quantization** (e.g. fiat 2, coin 8) enforced in the application before persistence. |
| Go | `shopspring/decimal` (or equivalent); JSON transports decimals as **strings**. |
| Rounding | **[REC]** compute at full precision; quantize once at the boundary. Amounts credited to a user round **down**; fees charged round **up**; direction and mode are configurable constants tested by vectors. Final policy `DR-047`. |
| Fees | Computed server-side from the fee schedule version in force at execution; stored on the row (`fee_amount`, `fee_asset_id`, `fee_rate`, `fee_schedule_version`) so history never changes when fees change `[REQ-023, 059]`. |
| Base currency | Fiat currency(ies) of wallet **undefined** `DR-005` (BDT via SSLCOMMERZ vs USD via Stripe). |
| Reservation/release | A reservation moves funds `available → locked` inside the same `tx` as the action; release/consume moves `locked → available` or `locked → destination`. |
| Ledger | Double-entry (9.4, Sec 10). |
| Atomicity | One business action = one DB `tx` (`READ COMMITTED` + row locks; `SERIALIZABLE` optional for engine `[REC]`). |
| Idempotency | Unique `idempotency_key` on journals and on request-log table (Sec 10.5). |
| Reconciliation | Sec 10.7. |

## 9.3 ER diagram
```mermaid
erDiagram
  USERS ||--o{ SESSIONS : has
  USERS ||--|| USER_PROFILES : has
  USERS ||--o{ ACCOUNTS : owns
  ACCOUNTS ||--o{ WALLET_BALANCES : holds
  ASSETS ||--o{ WALLET_BALANCES : denominates
  ACCOUNTS ||--o{ LEDGER_ACCOUNTS : maps
  LEDGER_ACCOUNTS ||--o{ LEDGER_ENTRIES : posts
  JOURNALS ||--|{ LEDGER_ENTRIES : contains
  JOURNALS ||--o| TRANSACTIONS : explains
  USERS ||--o{ DEPOSITS : requests
  USERS ||--o{ WITHDRAWALS : requests
  DEPOSITS ||--o{ PAYMENT_INTENTS : via
  PAYMENT_INTENTS ||--o{ PAYMENT_EVENTS : receives
  ASSETS ||--o{ MARKETS : base_quote
  MARKETS ||--o{ ORDERS : receives
  ORDERS ||--o{ TRADES : fills
  MARKETS ||--o{ CANDLES : charts
  MARKETS ||--o{ POSITIONS : futures
  POSITIONS ||--o{ POSITION_EVENTS : logs
  POSITIONS ||--o| LIQUIDATIONS : may_end
  MARKETS ||--o{ BINARY_TRADES : underlies
  USERS ||--o{ BINARY_TRADES : places
  USERS ||--o{ REFERRALS : referrer
  REFERRALS ||--o{ REFERRAL_EARNINGS : yields
  USERS ||--o{ SUPPORT_TICKETS : opens
  SUPPORT_TICKETS ||--o{ TICKET_MESSAGES : has
  USERS ||--o{ LISTING_APPLICATIONS : submits
  USERS ||--o{ P2P_ORDERS : takes
  USERS ||--o{ NOTIFICATIONS : receives
  ADMIN_USERS ||--o{ AUDIT_LOGS : performs
```

## 9.4 Table inventory
`PK` = `id` unless noted. `*` = unique. Every table has `created_at`; mutable ones have `updated_at` (+ `version` if financial). "real" tables have a **twin in schema `demo`** where marked **(D)**.

### Identity
| Table | Purpose | Key columns / constraints / indexes |
|---|---|---|
| users | Identity | `email*` (nullable if phone-only `DR-032`), `phone*`, `status` (Sec 30), `email_verified_at`, `phone_verified_at`, `referral_code*`, `referred_by_user_id` FK, `trading_enabled bool DEFAULT false`, `kyc_status`, `last_login_at`. Idx: `email`, `phone`, `status`. Case-insensitive unique email (`citext`). |
| credentials | Password hash | `user_id FK*`, `password_hash`, `algo`, `changed_at`. Never returned by API. |
| user_profiles | Profile | `user_id FK*`, name, country, locale, etc. (fields `DR-032`). |
| sessions | Refresh/session records | `user_id`, `refresh_token_hash*`, `device`, `ip`, `user_agent`, `expires_at`, `revoked_at`, `rotated_from`. Idx: `user_id`, `expires_at`. |
| verification_codes | OTP/link tokens | `user_id`, `channel`, `purpose`, `code_hash`, `expires_at`, `attempts`, `consumed_at`. |
| login_attempts | Brute-force tracking | `identifier_hash`, `ip`, `success`, `at`. |
| roles, permissions, role_permissions, admin_users | RBAC `[ASM-010]` | `admin_users(user_id FK*, role_id)`; permission strings. |
| kyc_records | KYC provider result | `user_id`, `provider`, `provider_ref*`, `level`, `status`, `documents_ref` (R2 keys), `reviewed_at`. Retention `DR-027`. |
| notification_preferences | Per-channel opt-in | `user_id`, `channel`, `event_type`, `enabled`. |

### Assets & markets
| Table | Purpose | Key columns |
|---|---|---|
| assets | Coin/asset catalog `[REQ-012]` | `symbol*`, `name`, `type` (fiat/platform_coin/…), `decimals`, `status`, `initial_price` `[REQ-013]` (NUMERIC), `created_by`. |
| markets | Trading pair `[REQ-018]` | `base_asset_id`, `quote_asset_id`, `UNIQUE(base,quote,product)`, `product` (spot/futures/binary), `status`, `min_qty`, `min_notional`, `price_tick`, `qty_step`, `config_version`. |
| market_configs | Versioned settings | `market_id`, `version`, `fee_schedule`, `leverage_max`, `margin_params`, `binary_params` (jsonb validated), `effective_from`, `created_by`, `approved_by`. |
| fee_schedules | Fees `[REQ-023]` | `scope`, `maker_rate`, `taker_rate`, `fixed_fee`, `version`, `effective_from`. |
| price_ticks | Recent prices | `market_id`, `price`, `source`, `ts`; partitioned by time; short retention. |
| candles | Chart OHLCV `[REQ-017]` | `market_id`, `interval`, `open_time`, `o,h,l,c,volume`; `UNIQUE(market_id,interval,open_time)`. |
| market_data_sources | Provider config/health | `name`, `status`, `last_seen_at`. |

### Wallet & ledger (real) — see Sec 10
| Table | Purpose | Key columns |
|---|---|---|
| accounts | Real/demo container per user | `user_id`, `type` (real/demo), `status`; `UNIQUE(user_id,type)`. |
| wallet_balances (D) | Balance projection | `account_id`, `asset_id`, `available NUMERIC CHECK(>=0)`, `locked NUMERIC CHECK(>=0)`, `version`; `UNIQUE(account_id,asset_id)`. Updated **only** by ledger service in same tx as the journal. |
| ledger_accounts (D) | Chart of accounts | `owner_type` (user/platform), `owner_id`, `asset_id`, `kind` (user_available, user_locked, platform_fee_revenue, platform_house/treasury, external_clearing, referral_expense, funding_pool, p2p_escrow, …), `UNIQUE(owner_type,owner_id,asset_id,kind)`. |
| journals (D) | One balanced posting group | `id`, `type`, `idempotency_key*`, `ref_type`, `ref_id`, `description`, `posted_at`, `actor_type`, `actor_id`, `correlation_id`. |
| ledger_entries (D) | Lines | `journal_id`, `ledger_account_id`, `asset_id`, `amount NUMERIC` (signed: +debit/−credit convention documented), `seq`; **append-only** (no UPDATE/DELETE grants, trigger blocks). Constraint trigger: `SUM(amount)=0` per `(journal_id, asset_id)` at commit. |
| transactions (D) | User-facing tx record `[REQ-057..060]` | `transaction_id*` (public), `account_id`, `type` (deposit, withdrawal, trade, fee, transfer, referral, …), `amount`, `fee`, `asset_id`, `status`, `journal_id`, `ref_type/ref_id`. |
| transaction_status_history | Status audit | `transaction_id`, `from`, `to`, `actor`, `reason`, `at`. |
| balance_snapshots | Daily reconciliation | `account_id`, `asset_id`, `available`, `locked`, `ledger_sum`, `taken_at`. |
| idempotency_keys | Request replay protection | `key`, `user_id`, `route`, `request_hash`, `response_snapshot`, `status`, `expires_at`; `UNIQUE(user_id,route,key)`. |

### Payments
| Table | Key columns |
|---|---|
| deposits | `user_id`, `account_id`, `amount`, `fee`, `asset_id`, `status`, `payment_intent_id`, `transaction_id`, `provider_ref`. |
| withdrawals | `user_id`, `amount`, `fee`, `destination` (encrypted jsonb), `status`, `reserve_journal_id`, `final_journal_id`, `reviewed_by`, `review_reason`, `provider_ref`. |
| payment_intents | `provider`, `provider_ref*`, `amount`, `currency`, `status`, `deposit_id`, `expires_at`, `raw_request/response` (redacted). |
| payment_events | `provider`, `event_id*` (dedupe), `type`, `payload jsonb`, `signature_valid`, `processed_at`, `result`. |

### Spot (real)
| Table | Key columns |
|---|---|
| orders (D not required — spot has no demo `[REQ-045]`) | `user_id`, `market_id`, `side`, `type`, `price NULL`, `qty`, `filled_qty`, `status`, `reserved_amount`, `reserved_asset`, `client_order_id`, `idempotency_key`; `UNIQUE(user_id,client_order_id)`; idx `(market_id,status,price)`, `(user_id,created_at)`. |
| trades | `order_id`, `market_id`, `user_id`, `side`, `price`, `qty`, `quote_amount`, `fee`, `fee_asset`, `journal_id`, `executed_at`; immutable. |
| price_impact_state (if `DR-002` selects internal engine) | `market_id`, `state jsonb`, `version`. |

### Futures (D)
| Table | Key columns |
|---|---|
| futures_orders | `account_id`, `market_id`, `side` (long/short), `type`, `qty`, `price`, `leverage`, `status`, `client_order_id`. |
| positions | `account_id`, `market_id`, `side`, `qty`, `entry_price`, `leverage`, `initial_margin`, `maintenance_margin`, `liq_price`, `realized_pnl`, `status` (open/closed/liquidated), `opened_at`, `closed_at`, `version`. Partial unique index `(account_id,market_id,side) WHERE status='open'` if one-position-per-side `[DR-008]`. |
| position_events | Append-only log of open/add/reduce/margin change/close/liquidate with mark price. |
| liquidations | `position_id*` (UNIQUE → idempotent), `mark_price`, `loss`, `fee`, `shortfall`, `journal_id`, `at`. |
| mark_prices | `market_id`, `price`, `source`, `ts`. |

### Binary (D)
| Table | Key columns |
|---|---|
| binary_products | `market_id`, `expiries[]`, `min_amount`, `max_amount`, `payout_rate` (`DR-012`), `status`. |
| binary_trades | `account_id`, `market_id`, `direction`, `amount`, `payout_rate_snapshot`, `entry_price`, `entry_ts`, `expires_at`, `settle_price`, `settled_at`, `status`, `payout`, `journal_id`; idx `(status,expires_at)`. |

### Extras
funding_plans, funding_participations `[DR-021]` · referral_codes(=users.referral_code), referrals(`referrer_id`, `referee_id*` immutable), referral_rates (versioned), referral_earnings · leaderboard_configs, leaderboard_snapshots · listing_applications, listing_documents · p2p_offers, p2p_orders, p2p_messages, p2p_disputes `[DR-015]` · support_tickets, ticket_messages, attachments · faqs, announcements, legal_documents (versioned), user_legal_acceptances · notifications, notification_deliveries · platform_settings (versioned) · **audit_logs**, admin_actions · outbox_events (transactional outbox) · jobs (DB-driven financial jobs).

## 9.5 Relationships (explained)
- One user → one real account + at most one demo account `[ASM-016]`. Balances hang off **accounts**, not users, so the demo/real split is structural.
- Every money movement = one **journal** (balanced set of **ledger_entries**); user-facing **transactions** point to journals; deposits/withdrawals/trades/settlements reference journals by id.
- Orders → trades → journals. Positions → position_events/liquidations → journals. Binary trade → journals at entry (stake reserve) and settlement.

## 9.6 Database invariants (must be enforceable by constraint/trigger where possible)
1. `wallet_balances.available >= 0` and `locked >= 0` (CHECK) unless product explicitly allows negative (`DR-009`).
2. For every `journal` and `asset`: `SUM(ledger_entries.amount)=0` (constraint trigger, deferred to commit).
3. `ledger_entries`/`journals`/`audit_logs`/`trades`/`payment_events` are append-only.
4. `wallet_balances` for a `(account,asset)` equals the sum of its ledger accounts (verified by reconciliation; enforced by only-ledger-writes rule).
5. `journals.idempotency_key` unique; `payment_events(provider,event_id)` unique.
6. `liquidations.position_id` unique; `binary_trades.settled_at` set at most once (guarded update `WHERE status='active'`).
7. No foreign key from `demo.*` to `real.*` or vice-versa; app DB role for demo code has no grant on real ledger tables.
8. `orders.filled_qty <= qty`; `reserved_amount >= 0`.

---

# 10. WALLET AND LEDGER

**Proposal states:** wallet, available balance, deposit, withdrawal request, internal transfer (where applicable), tx history/ID/fee/status, auditable ledger `[REQ-052..061]`. **Everything below on locked balance, double-entry, holds is [TD]/[ASM].**

## 10.1 Balance model `[ASM-008]`
- **available:** spendable now. **locked:** reserved by open orders, pending withdrawals, margin, active binary stakes. **total = available + locked**.
- `wallet_balances` is a **projection**; the truth is the ledger. Both change in one `tx`.

## 10.2 Ledger posting API (`[IMPL]`)
`ledger.Post(tx, Journal{type, idempotency_key, ref, entries[]})` — the **only** function that writes `journals`, `ledger_entries`, `wallet_balances`. It (1) checks the key (returns the prior result if seen), (2) verifies balance to zero per asset, (3) locks affected balance rows `ORDER BY (account_id, asset_id)` (**deterministic order avoids deadlocks**), (4) applies deltas with CHECK safety, (5) inserts entries, (6) emits outbox event `wallet.updated`.

Entry patterns (illustrative; account names are `[TD]`):
| Event | Entries |
|---|---|
| Deposit credited | DR `external_clearing` / CR `user_available` (amount); fee: DR `user_available` / CR `platform_fee_revenue` |
| Withdrawal request | `user_available → user_locked` |
| Withdrawal complete | DR `user_locked` / CR `external_clearing` (+ fee to revenue) |
| Withdrawal rejected/failed | `user_locked → user_available` |
| Spot order placed | `user_available → user_locked` (reservation) |
| Spot fill | consume locked quote → counterparty/house per `DR-001`; credit base; fee → revenue |
| Futures open | `available → locked` (initial margin); fee |
| Futures close | release margin ± PnL vs house/counterparty; fee |
| Binary open | `available → locked` (stake) |
| Binary settle | win: stake back + payout from house; lose: stake → house |
| Referral reward | DR `referral_expense` / CR `user_available` |
| Manual adjustment | requires reason + dual control `[DR-041]` |
The **counterparty** for PnL, spot fills and binary payouts is the platform's house account or other users — **`DR-001`** — which determines platform solvency exposure and must be decided before schema finalization.

## 10.3 Flows (with failure handling)
**Deposit:** `POST /deposits` → create `deposit(pending)` + `payment_intent` → provider redirect → **provider webhook (authoritative)** → verify signature + re-query provider API `[REC]` → `tx`: dedupe `payment_events`, verify amount/currency/reference match, `Post` credit, deposit `completed`, transaction `completed`, outbox → notification. Frontend "success" redirect **never** credits funds `[REQ-related: Sec 21]`.
**Withdrawal:** request → validate (user `active`, trading/withdraw permission, KYC `DR-018`, min/max/limits `DR-016`, sufficient available, idempotency) → `tx`: `Post(available→locked)`, `withdrawal(pending)` → risk checks (velocity/IP/new-device hold `[REC]`) → Finance Operator approve/reject `[REQ-080]` → payout via provider/manual `DR-017` → `completed`: `Post(locked→external)`; `rejected/failed`: `Post(locked→available)` → notify. Every transition writes `transaction_status_history` + `audit_logs`.
**Internal transfer `[REQ-056]`:** undefined (`DR-030`): between users? between real wallet and product sub-balances? Until decided, **do not build user-to-user transfers**; transfers between spot/futures/binary sub-balances are unnecessary if one unified available balance is used `[ASM-009]`.

## 10.4 Concurrency & double-spend prevention `[TD]`
- All spend paths reserve funds via `ledger.Post` inside the same `tx` as the state change; the `CHECK(available>=0)` makes overdraft impossible even under bugs.
- Row locks on `wallet_balances` (`SELECT … FOR UPDATE` or `UPDATE … WHERE available >= $x` with row-count check); deterministic lock ordering.
- Idempotency keys (client-supplied `Idempotency-Key` header on all money endpoints; server-derived keys for system jobs e.g. `settle:<binary_trade_id>`, `liquidate:<position_id>:<version>`, `deposit:<provider>:<event_id>`).
- Redis locks are only a **throttle optimization**; correctness never depends on them.

## 10.5 Idempotency behavior
Same key + same request hash → return stored response (HTTP same status, header `Idempotent-Replay: true`). Same key + different payload → `409 IDEMPOTENCY_KEY_REUSED`. Keys retained ≥ 24h `[ASM-021]`. System-derived keys are permanent via `journals.idempotency_key` uniqueness.

## 10.6 Transactions: identity/status `[REQ-058, 060]`
Public `transaction_id` generated server-side (ULID with prefix). Status set `[ASM-018]`: `pending, processing, completed, failed, cancelled, reversed` — per-type subsets in Sec 30. **Reversals are new journals**, never edits.

## 10.7 Reconciliation & audit `[REQ-061]`
- **Continuous:** DB constraint trigger for balanced journals.
- **Periodic (e.g. hourly/daily `[REC]`):** (a) `wallet_balances` == Σ ledger entries per account; (b) Σ user liabilities + platform accounts == Σ external clearing (i.e., total system is closed); (c) deposits `completed` ↔ provider settled transactions; (d) withdrawals `completed` ↔ payout evidence; (e) locked == Σ open order/position/withdrawal/binary reservations. Any diff → alert `severity=critical`, freeze affected withdrawals `[REC]`.
- **Daily** `balance_snapshots` retained per `DR-027`.

---

# 11. SPOT TRADING ENGINE

## 11.1 What the proposal specifies `[REQ]`
Platform-created assets (012); configurable initial price (013); buy/sell (014); dynamic price calculation (015); live price updates (016); charts (017); trading pairs (018); market & limit orders (019); open orders (020); order & trade history (021–022); trading fees (023); market overview (024); top gainers/losers (025). §1: prices rise/fall "based on a configured buy/sell mechanism".

## 11.2 Feature behavior (design assuming engine decided; engine-independent parts)
| Feature | Meaning | Inputs / validation | Execution | DB / balance impact | Realtime | Failure |
|---|---|---|---|---|---|---|
| Asset creation | Admin defines symbol, decimals, initial price | symbol unique, decimals 0–18 | Insert asset (+ market) inactive → activate | `assets`, `markets`, `audit_logs` | `market.status.changed` | duplicate, invalid precision |
| Buy/Sell | Trade base asset vs quote | pair active, qty ≥ min, notional ≥ min, price tick, balance | Engine per `DR-002/003` | reserve → fill → ledger (10.2) | `order.updated`, `trade.executed`, `wallet.updated` | insufficient balance, market disabled, stale price |
| Market order | Execute now at engine price | qty or quote amount; max slippage `[DR]` | Immediate fill/partial | trade rows + journal | same | liquidity/slippage reject |
| Limit order | Rest until price satisfies | price ≥ tick, TIF `[DR-039]` | Reserved; scanned by worker/matcher | `orders.open` | `order.updated` | never fills; partial |
| Open orders/history/trades | Lists | pagination, filters | read | — | — | — |
| Fees | Deducted at fill | schedule version | computed at fill | `trades.fee*`, ledger fee entry | — | rounding |
| Live price/chart | Broadcast last price + candles | — | Price service updates ticks/candles | `price_ticks`, `candles` | `market.price.updated`, `market.candle.updated` | stale data (Sec 15) |
| Market overview / top gainers/losers | Aggregations over rolling window | window `DR-043` | materialized/cached aggregates | cache in Redis | `market.summary.updated` (optional) | — |

## 11.3 TRADING ENGINE DECISIONS REQUIRED (`DR-001, 002, 003, 023`)
The proposal does **not** say how a price "rises/falls based on a configured buy/sell mechanism", who the counterparty of a trade is, or whether orders match each other. **Do not implement until decided.** Options:

| Model | How it works | Fits proposal wording? | Pros | Cons / risks |
|---|---|---|---|---|
| **A. Central limit order book (CLOB)** | Users' limit/market orders match each other; price = last matched | Supports "limit orders", "open orders"; weak on "initial price" & "configured mechanism" | Real market semantics, no house exposure | Needs liquidity; cold start for new coins (no trades → no price); matching engine complexity (price-time priority, partial fills) |
| **B. Internal pricing engine with house as counterparty** | Price = f(initial price, net buy/sell pressure, config); platform fills at engine price | **Best literal fit** to §1 ("initial price… price rises or falls per configured buy/sell mechanism"); limit orders become "trigger when price reaches X" | Works with zero liquidity; simple; deterministic | Platform bears inventory risk; manipulation & fairness/regulatory optics (Sec 41); must define formula, caps, decay |
| **C. AMM (constant-product-like) per pair** | Reserves x·y=k determine price; each trade moves price | Matches "price moves with buying/selling" | Self-contained liquidity, well-known math | Needs seeded pool (who funds it?); slippage & rounding; limit orders need external triggers |
| **D. Formula-based price movement (non-reactive)** | Price follows admin-configured curve/time function | Poor fit to "buy/sell mechanism" | Trivial | Not market-driven; high fairness/regulatory risk |
| **E. External market-price model** | Platform mirrors prices from the client market-data API; fills at that price | Fits "market data API" dependency; conflicts with "initial price" for platform-created assets | Realistic prices | Not applicable to platform-created coins; API cost/latency |
| **Hybrid** | E for real-world-priced pairs, B/C for platform-created assets | Plausibly what client intends | Covers both statements | Two engines to build/test |

**Information missing before choosing:** (1) Is the platform the counterparty (house) or a venue between users? (2) Which assets are platform-created vs externally priced? (3) Price-impact formula and bounds (max move/trade, per day, decay/mean reversion)? (4) Order types semantics: limit = resting order or price trigger? Stop orders? (5) Fee structure (maker/taker vs flat)? (6) Liquidity/seed inventory for platform coins and who funds it? (7) Anti-manipulation controls (self-trading, wash trading, minimum hold)? (8) Circuit breakers/halts? (9) Regulatory stance for platform-priced assets (client/legal) (10) Order book depth UI needed? Until answered, code behind a `PricingEngine` / `MatchingEngine` **interface** with no default implementation in production `[REC, ADR-009]`.

## 11.4 Engine-independent guarantees `[TD]`
Every fill: single `tx`; locks order rows and balance rows in deterministic order; writes trade + journal + order status update; emits outbox events after commit; deterministic trade ID for replay safety.

---

# 12. FUTURES TRADING

## 12.1 Proposal explicitly specifies `[REQ-026..035]`
Long/short, leverage (admin-configurable `[REQ-078]`), margin, entry price, **mark price**, PnL, liquidation calculation, open positions, position history, order history, demo futures with simulated liquidation. **Nothing else** — no formulas, no margin mode, no funding rate, no fees, no maintenance ratio, no liquidation engine details.

## 12.2 Technical assumptions required for implementation (all `[ASM]` until `DR-007..011` are decided)
Standard linear-perpetual conventions **as a starting proposal only**. Let `Q` = position quantity (base units), `E` = entry price, `M` = mark price, `L` = leverage, `mmr` = maintenance margin rate, `f` = taker fee rate.

| Quantity | Proposed formula (`[ASM-030]`) |
|---|---|
| Notional | `N = Q × E` |
| Initial margin | `IM = N / L` |
| Maintenance margin | `MM = N_mark × mmr` where `N_mark = Q × M` (`mmr` admin-configured, `DR-008`) |
| Unrealized PnL (long) | `Q × (M − E)` |
| Unrealized PnL (short) | `Q × (E − M)` |
| Realized PnL | PnL at close price minus fees |
| Equity | `IM + unrealizedPnL` (isolated) |
| Liquidation trigger | `equity ≤ MM` |
| Liq. price (isolated, long) | `E × (1 − 1/L + mmr)` |
| Liq. price (isolated, short) | `E × (1 + 1/L − mmr)` |
| Opening fee | `f × N` (rate `DR-006`) |
| Funding (perp funding rate) | **Not in proposal.** Whether futures are perpetual or dated, and any funding rate, is `DR-011`. (The proposal's "Funding plan" is an unrelated product term.) |
| Mark price | Source `DR-010`: last internal price? external index? smoothed? Index price only needed if external (E). |

### 12.3 Worked examples (illustrative numbers — NOT proposal values)
Assume `mmr = 0.5%`, `L = 10`, taker fee 0.06% (`f`), isolated margin.
**Long:** Q = 2 units, E = 100 → N = 200, IM = 20, opening fee = 0.12. Mark moves to 105 → unrealized PnL = 2×5 = **+10**; equity = 30. Liq. price = 100×(1−0.1+0.005) = **90.5**. At M = 90.5: PnL = −19; equity = 1.0; MM = 2×90.5×0.005 = 0.905 → ≈ trigger. Liquidate: loss ≈ −19, remaining ≈ 1 minus liquidation fee returned per `DR-009`.
**Short:** Q = 2, E = 100, same params → IM = 20. Mark 95 → PnL = +10. Liq. price = 100×(1+0.1−0.005) = **109.5**. At M = 109.5: PnL = −19 → equity ≈ 1.0 ≈ MM → liquidate.
These become deterministic **test vectors** (Sec 34) *only after* formulas are approved.

## 12.4 Feature definitions
| Feature | Definition |
|---|---|
| Open position | Order fill creates/increases `positions` row; reserve IM + fee. Execution price rule `DR-002/010`. |
| Close position | Reduce/close at mark/market; realize PnL; release margin ± PnL. |
| Leverage handling | Chosen ≤ `leverage_max` (admin `[REQ-078]`); change on open positions restricted `DR-007`. |
| Margin | Isolated vs cross, one-way vs hedge mode: `DR-008` (default recommendation: **isolated, one-way** — simplest, lowest risk `[REC]`). |
| Liquidation process | Worker scans open positions on each mark update (indexed by `liq_price`); on breach: `tx` lock position (`FOR UPDATE`), re-verify breach with latest mark, close, post journal, insert `liquidations` (unique per position → idempotent), emit `position.updated` + notify. Insurance fund/negative equity policy `DR-009`. |
| Order/position history | From `futures_orders`, `positions`, `position_events`. |

## 12.5 Edge cases
Insufficient margin → reject before reserve. Price gap beyond liq price → close at mark (not at theoretical liq price); shortfall handled per `DR-009` (platform absorbs / insurance fund / socialized — **must be decided**). Partial fills → margin reserved proportionally. Multiple positions/orders → aggregate-exposure limits `DR-019`. Leverage changes → recompute IM/MM; block if breach. High volatility → use bounded mark price & staleness guard; pause liquidation if mark stale > threshold but **also** pause new opens. Balance near zero → cannot open; fee cannot make available negative. **Negative balance prevention:** DB CHECK; liquidation must trigger **before** equity < 0 under normal conditions; residual negative equity goes to a platform loss ledger account, never to the user's wallet, unless policy says otherwise.

---

# 13. BINARY TRADING

## 13.1 Proposal specifies `[REQ-036..044]`
Asset selection, UP/DOWN, trade amount, expiry time, countdown timer, **potential payout** display, active trades, completed trades, win/loss history, demo binary.

## 13.2 Lifecycle `[TD]` (states are ours; proposal has none)
`CREATED → ACCEPTED → ACTIVE → EXPIRING → SETTLED → WON | LOST` (+ `TIE`/`REFUNDED` if policy `DR-013`; `REJECTED`, `CANCELLED` if allowed `DR-014`).
- `CREATED`: request received, validated. `ACCEPTED`: stake reserved, entry price fixed, server timestamp recorded. `ACTIVE`: countdown running. `EXPIRING`: `now ≥ expires_at`, awaiting settlement price. `SETTLED`: price fixed, payout computed. `WON/LOST` are outcomes recorded together with the ledger journal.
- **Server time is authoritative** `[TD]`: the client countdown is decoration; entry and expiry timestamps come from the server clock (single source, NTP-synced).

## 13.3 Unresolved business rules (**do not choose silently**)
| Rule | Question | ID |
|---|---|---|
| Payout formula | Fixed % of stake (e.g. win = stake × (1+r))? Varies by asset/expiry/time? Loss = full stake? | DR-012 |
| Price source | Platform price, external market data, or feed per asset? | DR-013, DR-023 |
| Entry price | Price at request time or at server acceptance? Slippage tolerance? | DR-013 |
| Settlement price | Price at exactly `expires_at`? TWAP/last tick before? Tolerance window? | DR-013 |
| Tie behavior | equal price = loss / refund / win? | DR-013 |
| Cancellation | Allowed before expiry? Penalty? | DR-014 |
| Late orders | Cutoff before expiry? Minimum time-to-expiry? | DR-014 |
| Amount limits | Min/max stake; max concurrent trades; max exposure per asset | DR-014 |
| Expiry options | Fixed list (e.g. 30s,1m,5m…)? Custom? | DR-014 |
| Manipulation resistance | Internal price + binary = platform could influence its own outcome. Controls: price-source integrity, max tick change, audit of ticks around settlement, admin cannot alter price near active trades | DR-013/023, Sec 41 |
| Market closed / feed down at expiry | void & refund? delay? | DR-013 |
Regulatory note: binary options are restricted or prohibited in many jurisdictions — client responsibility (Sec 41).

## 13.4 Settlement worker `[IMPL]`
Poll `binary_trades WHERE status IN ('active','expiring') AND expires_at <= now()` using `FOR UPDATE SKIP LOCKED`; per trade `tx`: re-check status; determine settle price; compute outcome; `ledger.Post` with key `settle:<id>`; set `settled_at`, status; outbox. Restart-safe: unfinished rows are re-picked; idempotent by key.

---

# 14. DEMO TRADING

**Proposal:** demo for futures **and** binary; virtual balance, simulated trading, virtual PnL, simulated liquidation, demo history; mandatory disclaimer text `[REQ-045..051]`. Spot demo not mentioned (`DR-029`).

## 14.1 Isolation architecture `[TD, ADR-005]` — layered defenses
1. **Separate PostgreSQL schema `demo`** with its own `accounts/wallet_balances/ledger_*/futures_*/positions/binary_trades/transactions`. No cross-schema FKs.
2. **Separate DB role** for demo code paths with grants only on `demo.*` (+ read on shared market data). Real ledger tables are not writable from it.
3. **Type-level separation in Go:** `RealAccountID` and `DemoAccountID` are distinct types; `ledger.Post` takes an `Environment`; demo `Post` can only bind to demo schema. Functions that accept both are explicitly named `…Either` and code-reviewed.
4. **API:** demo endpoints under `/api/v1/demo/...`; real under `/api/v1/...`. Response objects carry `environment: "demo"|"real"`.
5. **WebSocket:** separate channels (`demo.*` vs real), so a client never confuses streams.
6. **UI:** persistent banner with the mandatory Bangla disclaimer text exactly as in `REQ-051` (English optional alongside), distinct color theme in demo mode, mode switch requires explicit action; no real balance or deposit button shown in demo mode.
7. **Reporting:** leaderboard, referral, admin financial totals, reconciliation **exclude demo** by construction (query `real` schema only); demo included in leaderboard only if `DR-029` says so, on a separate board.
8. **No conversion path:** no transfer, referral reward, bonus, or withdrawal function touches `demo`. Any demo→real code path is a **bug**.
Demo starting balance, top-up/reset limits, per-user cap, and whether demo prices are the same live feed: `DR-029` (recommend same live feed so simulations are realistic `[REC]`). Demo PnL/liquidation use identical formulas as real (shared pure domain functions) but persist to demo tables.

---

# 15. MARKET DATA

| Item | Content |
|---|---|
| **PROPOSAL REQUIREMENT** | Live price updates (016), charts (017), market overview (024), top gainers/losers (025); **client provides a "market data API"** and access (§8, §10). |
| **INTEGRATION CONTRACT TO BE DEFINED (`DR-023`)** | Provider name, protocol (REST/WebSocket/FIX), symbol list & mapping, update frequency, historical candles availability & intervals, rate limits, auth, SLAs, licensing/redistribution terms, cost, latency, handling of platform-created assets (which the external provider cannot know). |
| Ingestion `[TD]` | Worker `marketdata` connects to provider, normalizes to internal `Tick{market_id, price(decimal), ts, source}`, validates (positive, within % band vs previous, monotonic ts), writes to Redis (latest) + batches to `price_ticks`, aggregates candles. |
| Platform-created assets | Prices come from the **internal pricing engine** (Sec 11). `markets.price_source` ∈ {`internal`,`external:<provider>`,`hybrid`} `[TD]`. |
| Normalization | Decimal parsing; symbol mapping table; timestamp → UTC; drop out-of-order ticks. |
| Caching | Latest price per market in Redis with TTL; last-known in memory. |
| Broadcasting | Redis pub/sub → WS gateway → `market.price.updated`. Throttle to ≤ N msg/s/market `[REC]`. |
| Historical candles / charts | Store 1m base candles; roll up 5m/15m/1h/4h/1d; frontend requests via REST + live updates via WS. Backfill from provider if available (`DR-036`). |
| Symbol management | Admin (assets/markets) `[REQ-077]`; mapping to provider symbols in `market_data_sources`. |
| **Stale data handling** `[TD]` | Each tick has `ts`. Staleness threshold per market (`ASM-024`, e.g. > 10 s `[REC]`, configurable). When stale: UI shows "delayed" state; **market/futures/binary opens are rejected** (`MARKET_DATA_STALE`); liquidations and settlements follow the specific rule for staleness (Sec 12/13, `DR-009/013`) — never settle on stale data silently. |
| **Provider unavailable** | Retry with backoff; mark `market_data_sources.status=degraded/down`; alert; markets with external price → `halted` after threshold; internal-priced markets continue only if design allows; admin banner/announcement; no fabricated prices. |

---

# 16. REALTIME SYSTEM (WebSocket)

Proposal: "WebSocket" for realtime `[REQ-083]`. All below is **[TD]** design; event names are technical choices, **not proposal requirements**.

| Aspect | Design |
|---|---|
| Endpoint | `wss://<domain>/ws` (single connection per client tab). |
| Authentication | Public channels: anonymous. Private channels: client obtains short-lived (60 s) **WS ticket** via `POST /api/v1/ws/ticket` (auth'd) and sends it in the first message or query; server validates once, binds `user_id`. Expired tickets rejected. |
| Channels | Public: `market.<market_id>.price`, `market.<market_id>.candles.<interval>`, `markets.summary`. Private (server derives from auth, client cannot request others' channels): `user.orders`, `user.trades`, `user.positions`, `user.wallet`, `user.binary`, `user.notifications`. Demo: `demo.user.*`. |
| Subscription | JSON messages `{op:"subscribe", channels:[…]}`; authorization checked per channel; max channels per connection `[ASM]`. |
| Events (proposed names) | `market.price.updated`, `market.candle.updated`, `market.status.changed`, `order.created`, `order.updated`, `trade.executed`, `position.updated`, `liquidation.executed`, `binary.trade.updated`, `wallet.updated`, `notification.created`, `announcement.created`, `system.maintenance`. |
| Envelope | `{ "event": "...", "channel": "...", "seq": 1234, "ts": "...", "data": {...} }`; monotonically increasing `seq` per channel for ordering/gap detection; `event_id` for dedupe. |
| Heartbeat | Server ping every 20–30 s; client pong within timeout else close; client also sends app-level `ping`. |
| Reconnection | Client exponential backoff + jitter; on reconnect: re-auth (new ticket), resubscribe, then **REST snapshot** for state (orders, positions, wallet) and resume from stream — WS is not a source of truth. If `seq` gap detected → resync. |
| Rate limiting | Per connection messages/sec cap; max connections per user/IP; subscribe-flood protection. |
| Authorization | Server-side per channel; suspended users' private channels closed. |
| Stale connections | Idle timeout; drop on failed pong. |
| Ordering | Per-channel `seq`; events emitted **after** DB commit via outbox → Redis → gateway, so clients never see uncommitted state. |
| Duplicates | Clients dedupe by `event_id`; handlers idempotent. |
| Scaling | Multiple API instances subscribe to Redis pub/sub; sticky sessions not required. |
| Backpressure | Slow consumers: bounded send queue, drop non-critical (price) frames, disconnect if critical queue overflows. |

---

# 17. REDIS

**Rule:** No authoritative financial state in Redis `[TD]`. Loss of Redis must degrade performance/features, **never** lose or corrupt money.

| Responsibility | In Redis? | Notes |
|---|---|---|
| Latest price/market summary cache | Yes | TTL'd; rebuilt from DB/provider. |
| Rate limiting (login, OTP, API, WS) | Yes | Sliding window/token bucket; on Redis outage: fail **closed** for auth/OTP/withdraw, fail **open with in-memory fallback** for read endpoints `[REC]`. |
| Pub/sub for WS fan-out | Yes | Lossy by design; clients resync via REST. |
| Non-critical job queue (emails/SMS, leaderboard recompute) | Yes | Persistent jobs also mirrored in DB `notification_deliveries` for retries `[REC]`. |
| Short-lived locks (dedupe, thundering herd) | Yes | Optimization only; DB row locks are the correctness mechanism. |
| Session/refresh tokens | **No** (PostgreSQL `sessions`); Redis may cache revocation list. |
| OTP codes | DB hashed (`verification_codes`) `[REC]`; Redis may hold attempt counters. |
| Balances, reservations, orders, positions, ledger, settlement queue | **No — PostgreSQL only.** |
| Idempotency keys for money | **PostgreSQL** (`idempotency_keys`, `journals`). |

Key naming: `<env>:<domain>:<entity>:<id>`; every key has TTL unless it is a queue/stream. Persistence: AOF `everysec` `[REC]` (still non-authoritative). Eviction: `allkeys-lru` **not** on the instance holding queues — use separate DB/instance `[REC]`.

---

# 18. API DESIGN

**[TD]** REST/JSON, base `/api/v1`, OpenAPI 3.1 in `backend/api/openapi.yaml` (source of truth for contract). Names are technical choices, not proposal text.

## 18.1 Conventions
- Plural nouns, `snake_case` JSON fields, decimals as **strings**, ISO-8601 UTC timestamps, IDs as UUID/prefixed strings.
- Auth: `Authorization: Bearer <access_token>` (Sec 19). Admin API under `/api/v1/admin/*` with separate authorization.
- Pagination: cursor (`?limit=50&cursor=…`); sorting via `sort=`.
- Money-mutating endpoints **require** `Idempotency-Key` header (else `400 IDEMPOTENCY_KEY_REQUIRED`).
- `X-Request-ID` echoed; used as correlation ID.
- Response envelope:
```json
{ "data": { }, "meta": { "request_id": "..." } }
{ "error": { "code": "INSUFFICIENT_BALANCE", "message": "...", "details": {}, "request_id": "..." } }
```

## 18.2 Endpoint catalogue (representative)
| Module | Endpoint | Auth / Authz | Idem. | Rate limit `[ASM-022]` | Side effects |
|---|---|---|---|---|---|
| Auth | `POST /auth/register` | public | — | 5/min/IP | user, accounts, verification send |
| | `POST /auth/verify-email`, `/auth/verify-phone` | public/user | — | 10/15 min | mark verified |
| | `POST /auth/login` | public | — | 10/min/IP + per-identifier | session, audit |
| | `POST /auth/refresh`, `/auth/logout`, `/auth/logout-all` | refresh token | — | 30/min | rotate/revoke |
| | `POST /auth/password/forgot`, `/auth/password/reset` | public | — | 3/hour/identifier | token, revoke sessions |
| | `POST /auth/password/change` | user + reauth | — | 5/hour | revoke other sessions |
| Users | `GET/PATCH /me`, `GET /me/sessions`, `DELETE /me/sessions/{id}` | user | — | 60/min | audit sensitive |
| Wallet | `GET /wallet/balances`, `GET /wallet/transactions`, `GET /wallet/transactions/{transaction_id}` | user | — | 60/min | — |
| Deposits | `POST /deposits` → `{deposit_id, payment_url}` | user, trading/kyc gate | required | 10/min | deposit+intent |
| | `GET /deposits/{id}` | owner | — | | status poll |
| | `POST /webhooks/payments/{provider}` | provider signature (no user auth) | dedupe by event id | provider IP allowlist `[REC]` | credit ledger |
| Withdrawals | `POST /withdrawals` | user + step-up | required | 5/hour | reserve funds |
| | `POST /withdrawals/{id}/cancel` | owner | required | | release if `pending` |
| Markets | `GET /markets`, `/markets/{id}`, `/markets/{id}/candles?interval=`, `/markets/summary`, `/markets/gainers-losers` | public | — | 120/min | cache |
| Spot | `POST /spot/orders` `{market_id, side, type, quantity, price?, client_order_id}` | user + trading perm | required | 30/min | reserve, execute |
| | `DELETE /spot/orders/{id}`; `GET /spot/orders?status=`; `GET /spot/trades` | owner | required (delete) | | |
| Futures | `POST /futures/orders`; `GET /futures/positions`; `POST /futures/positions/{id}/close`; `POST /futures/positions/{id}/margin`; `GET /futures/orders`, `/futures/positions/history` | user + trading perm | required | 30/min | margin lock, ledger |
| Binary | `POST /binary/trades` `{market_id, direction, amount, expiry_seconds}`; `GET /binary/trades?status=active|completed`; `GET /binary/quote?…` (payout preview) | user + trading perm | required | 20/min | stake lock |
| Demo | `/demo/futures/*`, `/demo/binary/*`, `POST /demo/reset` `[DR-029]` | user | required | | demo schema only |
| Funding | `GET /funding/plans`, `POST /funding/calculate`, `POST /funding/participations` `[DR-021]` | user | required (participate) | | |
| Referral | `GET /referrals/me`, `/referrals/earnings` | user | — | | |
| Leaderboard | `GET /leaderboard?period=` | public/user `[DR-022]` | — | | cached |
| Listings | `POST/GET /listings/applications` | user | required (POST) | 3/day | files → R2 |
| P2P | `/p2p/offers`, `/p2p/orders/*` `[DR-015]` | user | required | | |
| Support | `POST/GET /tickets`, `POST /tickets/{id}/messages` | user | — | 10/hour | attachment upload |
| Content | `GET /faq`, `/announcements`, `/legal/{slug}` | public | — | | cached |
| Notifications | `GET /notifications`, `POST /notifications/{id}/read`, `GET/PUT /notification-preferences` | user | — | | |
| Realtime | `POST /ws/ticket` | user | — | 10/min | |
| Admin | see Sec 27 — e.g. `GET /admin/users`, `PATCH /admin/users/{id}/status`, `PUT /admin/users/{id}/trading-permission`, `POST /admin/assets`, `PUT /admin/markets/{id}/config`, `POST /admin/withdrawals/{id}/approve`, `GET /admin/audit-logs` | admin RBAC per permission | required for state changes | 120/min | audit log mandatory |

## 18.3 Representative examples
**Create spot limit order**
```
POST /api/v1/spot/orders
Idempotency-Key: 6f1c…
{ "market_id": "mkt_01H…", "side": "buy", "type": "limit",
  "quantity": "10.50000000", "price": "1.2500", "client_order_id": "web-8231" }
→ 201 { "data": { "id":"ord_…","status":"open","reserved":{"asset":"USD","amount":"13.125"},"fee_estimate":"…" } }
→ 422 { "error": { "code":"INSUFFICIENT_BALANCE", ... } }
→ 409 { "error": { "code":"DUPLICATE_REQUEST", ... } }   # same key, different body
```
**Binary trade**
```
POST /api/v1/binary/trades
{ "market_id":"…", "direction":"up", "amount":"25.00", "expiry_seconds":60 }
→ 201 { "data": { "id":"bin_…","status":"active","entry_price":"…","expires_at":"…","payout_rate":"…" } }   # fields depend on DR-012/013
```
**Validation:** server-side schema validation (Go `validator`), unknown fields rejected, decimals parsed strictly (no exponent notation), quantity/price quantized to market steps.

## 18.4 WebSocket events are documented separately in Sec 16.

---

# 19. AUTHENTICATION AND SECURITY

Proposal: registration/login, email/phone verification, password management, account security, security review in weeks 5–6 `[REQ-005..010, 084]`. **Everything below is [TD]/[REC]/[ASM]**; the proposal doesn't specify mechanisms.

| Area | Design |
|---|---|
| Password hashing | **Argon2id** (params tuned ≥ 64 MiB/3 iters `[REC]`); pepper from secret store optional; min length 8–12 + breached-password check `[ASM]`; no composition rules theater. |
| Registration/verification | Email link/OTP and/or SMS OTP `[DR-032]`; OTP 6 digits, hashed, TTL 5–10 min, max 5 attempts, resend cooldown 60 s `[ASM]`. Enumeration-safe responses. |
| Access tokens | **JWT** (asymmetric ES256/EdDSA), 10–15 min TTL, claims: `sub`, `sid`, `roles`, `env`; **not** used as sole authority for money (server checks user status in DB/cache) `[ASM-001]`. |
| Refresh tokens | Opaque random 256-bit, stored **hashed** in `sessions`, rotation on each use with reuse detection (reuse ⇒ revoke session family); 7–30 day TTL. |
| Cookies vs headers | **[REC]** Refresh token in `HttpOnly; Secure; SameSite=Strict` cookie; access token in memory. Gives CSRF surface only on `/auth/refresh` → protected by SameSite + CSRF token/double-submit or Origin check. Other API calls use Bearer header (not CSRF-prone). |
| Session management | List/revoke sessions; logout revokes refresh; password change/reset revokes all; admin can force logout. |
| Device management | Record device/IP/UA; alert on new device (email) `[REC]`. |
| 2FA | **Not in proposal.** `[REC]` TOTP 2FA for admins (mandatory) and for withdrawals (optional/user) — `DR-032`. |
| RBAC | Permission-based (Sec 4); checked in middleware + service layer; **deny by default**. Admin panel on separate route group, IP allowlist optional `[REC]`. |
| Account lockout / brute force | Per-identifier + per-IP counters (Redis + DB audit); progressive delay; temporary lock (15 min) after N failures; CAPTCHA (Turnstile) on repeated failures `[REC]`. |
| Rate limiting | Sec 18 table; fail-closed for auth. |
| CSRF | See cookies row; SameSite; Origin/Referer validation on state changes using cookies. |
| XSS | React escaping; no `dangerouslySetInnerHTML` except sanitized content (FAQ/legal/announcement rendered via sanitizer, e.g. DOMPurify/`bluemonday`); strict CSP with nonces. |
| SQLi | Parameterized queries only (pgx); no string-built SQL; lint rule. |
| SSRF | Outbound calls only to allowlisted provider hosts; user-supplied URLs never fetched; R2 uploads via presigned PUT with content-type/size limits. |
| CORS | Explicit allowlist of the app origins; no wildcard with credentials. |
| Secure headers | HSTS, CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors none, Permissions-Policy. |
| Secrets | Env vars injected by deployment tool/secret manager; never in repo; rotation runbook; separate secrets per environment. |
| File uploads | Type/size allowlist, AV scan optional, random keys, private bucket + signed URLs. |
| Audit logs | Sec 28. |
| **Financial-operation security** | Step-up auth (password re-entry or 2FA) for withdrawal, withdrawal destination change, password/email/phone change; **withdrawal hold** after credential change/new device `[REC]` (`DR-016`); velocity limits; suspicious-activity flags (many failed logins → withdrawal, IP/geo change) `[REC]`; **idempotency** on all money routes; **replay protection** for webhooks via signature + timestamp tolerance + event-id dedupe; request signing not required. |
| Admin security | Mandatory 2FA `[REC]`, short sessions, dual control for dangerous actions, all actions audited, no shared accounts. |
| Dependency security | Pin/scan dependencies (`govulncheck`, `npm audit`); the proposal's "security review" (week 5–6) is not a full penetration test — recommend an independent pentest before real-money public launch `[REC]`. |

---

# 20. KYC / AML

**Proposal:** KYC/AML **service** is a client-provided third-party dependency `[REQ-085]`; KYC/AML requirements are the **client's legal responsibility** `[REQ-093]`. The proposal does **not** list KYC screens, levels, or gating rules as features.

**Design (integration boundary only) `[TD]`:**
- `kyc` module wraps provider behind interface `KycProvider{Start(user) → session; Webhook → result; Status(ref)}`. Provider choice/contract `DR-018`.
- States `[ASM-020]`: `not_started → pending → in_review → approved | rejected | expired | resubmit_required`.
- Documents stored only via provider or in **private R2** with restricted access + retention `[DR-027]`; PII minimized in logs.
- **Effect of status on functionality (all `DR-018`, do not assume):** e.g. deposit/withdrawal/trading gates by level, withdrawal limits by level. Implement gates as **configurable policy** (`platform_settings.kyc_requirements`) with default = *no gating* until client specifies.
- **On failure:** user notified with reason category (not raw AML details); can resubmit if provider allows; admin sees status; funds are **never auto-confiscated** by code; freeze/hold actions require admin + audit.
- AML monitoring/transaction screening/sanctions checks: provider-dependent, out of proposal's stated scope; hooks: `transactions` events can be sent to provider `[REC]`.
- **Legal statement:** which KYC/AML rules apply depends on the applicable jurisdiction and client-provided requirements; engineering does not determine them (Sec 41).

---

# 21. PAYMENTS

**Proposal:** SSLCOMMERZ **or** Stripe, subject to eligibility/approval; scope includes development-side integration of **one** agreed provider; client supplies merchant account, docs, credentials `[REQ-086, 091]`.

## 21.1 Architecture `[TD]`
```
PaymentProvider interface {
  CreatePayment(ctx, req) (redirectURL/clientSecret, providerRef)
  VerifyWebhook(headers, body) (Event, error)          // signature/IPN validation
  QueryPayment(providerRef) (Status)                   // server-to-server verification
  Refund(providerRef, amount) (…)                      // if supported
  Payout(…) (…)                                        // only if provider supports; DR-017
}
adapters: sslcommerz, stripe   // selected via PAYMENT_PROVIDER env / platform setting
```
**Important gap `DR-017/024/045`:** Deposits are card/wallet/mobile-banking **pay-ins**. The proposal does not state how **withdrawals** are paid out (SSLCOMMERZ and Stripe are primarily collection gateways; payouts to users require separate products/eligibility) — plan for **manual admin payout with proof recording** as the safe default `[ASM-026]` until the client confirms. Also verify the provider permits the client's business category (binary/futures/trading platforms are commonly restricted/high-risk categories) — a **go/no-go dependency**, not an engineering matter.

## 21.2 Flow rules
| Step | Rule |
|---|---|
| Creation | Server creates `payment_intent`(pending) with amount/currency computed server-side; unique merchant reference. |
| Redirect/return | Return URL only shows *status polled from our server*. **Frontend success is never proof of payment.** |
| Webhook/IPN | **Authoritative.** Verify signature/hash + timestamp tolerance; store raw event in `payment_events` (unique `(provider,event_id)`); then call `QueryPayment` (SSLCOMMERZ validation API / Stripe retrieve) to confirm amount, currency, status; only then credit ledger. |
| Success | `tx`: intent `succeeded`, deposit `completed`, ledger credit, transaction row, outbox. |
| Failure/cancel | Intent `failed/cancelled`; deposit `failed/cancelled`; no ledger entry. |
| Pending | Stays `pending`; reconciliation job polls provider for intents older than N minutes; expire after T. |
| Duplicate callback | Dedupe by event id and by `deposit.status`; returns `200` without side effects. |
| Amount mismatch/late success after cancel | `requires_review` state; Finance Operator resolves; no auto-credit. |
| Refund (where applicable) | Provider refund + compensating ledger journal (`reversed`); allowed only per policy `DR-017`. |
| Reconciliation | Daily: provider settlement report vs `payment_intents`/`deposits`; mismatches alert `critical`. |
| Fees | Provider fees (client cost) vs platform deposit fee `[REQ-059]` semantics `DR-037`. |

---

# 22. P2P MARKETPLACE (basic)

**Proposal:** "বেসিক P2P মার্কেটপ্লেস" (Basic P2P marketplace) in extra features `[REQ-069]`; admin manages "P2P" `[REQ-080]`. **No rules stated.**

| Topic | Status |
|---|---|
| What is traded? (platform coin ↔ fiat? asset ↔ asset?) | **DR-015** |
| Buyer/seller roles, ad (offer) creation, order creation | **DR-015** — typical model: maker posts offer, taker opens order |
| Escrow | **DR-015** — if platform-held: seller's asset locked via ledger (`p2p_escrow` account); if fiat leg is off-platform, payment confirmation is evidence-based |
| Payment confirmation (fiat off-platform) | **DR-015** — buyer marks paid; seller confirms; proof upload (R2) |
| Dispute handling & admin intervention | **DR-015** — admin can release/refund escrow (dual-control, audited) `[REC]` |
| Timeout / cancellation | **DR-015** — auto-cancel and release escrow after X min unpaid |
| Fraud prevention | **DR-015** — limits, new-account restrictions, KYC gating, reputation |
| Fees | **DR-015/006** |
| Settlement | Ledger journal `escrow → buyer` on release |
**[REC]** If time is short (Sec 39), P2P is the safest module to **defer or reduce** because it carries dispute/fraud complexity while described as "basic". Implement nothing until `DR-015` is answered. Admin-side P2P moderation `[REQ-080]` is part of the module.

---

# 23. FUNDING SYSTEM

**What the proposal says:** "ফান্ডিং প্ল্যান" (funding plan), "ফান্ডিং ক্যালকুলেটর" (funding calculator) `[REQ-062, 063]`; admin manages "ফান্ডিং প্ল্যান" `[REQ-079]`. **That is all.**

**What is undefined (`DR-021`):** what a funding plan *is* (investment product? loan/credit to traders? prop-firm style funded account? deposit bonus? staking-like?), interest rate, duration, eligibility, repayment, profit-sharing, risk/loss model, who bears risk, whether funds are real, what the calculator computes (returns? repayments?), and legal classification (potentially regulated as investment/lending — client responsibility, Sec 41).

**Engineering stance:** Do not assume any rate, duration or profit model. Model the module generically **only after** `DR-021`. Until then: `funding_plans` table for admin-defined parameters (name, min/max, duration, rate fields as nullable decimals) may be created, but **no ledger-affecting participation flow** is implemented. The calculator is a **pure server-side function** of the admin-defined plan parameters and user inputs, with the formula documented and unit-tested once specified; the frontend calculator is display-only.

---

# 24. REFERRAL SYSTEM

**Proposal:** referral program, referral earnings, admin-configurable referral rate `[REQ-064, 065, 079]`.

| Topic | Design / status |
|---|---|
| Referral code | Per-user unique code `[TD]` (`users.referral_code`). Format/length `[ASM]`. |
| Relationship | Referee registers with code/link → `referrals(referrer_id, referee_id*)` **immutable** attribution `[ASM-027]`; single level unless `DR-020` says multi-level. |
| Earnings | `referral_earnings` rows; source event (e.g. referee trading fee), rate at time (versioned `referral_rates`), status. **What triggers earnings** (signup bonus? % of fees? % of deposits?): `DR-020`. |
| Rates | Admin-configured, versioned, effective-dated `[REQ-079]`. |
| Reward eligibility | `DR-020`: minimum activity, KYC verification, real trades only (demo **never** counts), cap per referrer. |
| Timing | Instant vs periodic payout vs after settlement/clearing `DR-020`. |
| Self-referral / duplicates | `[REC]` block same-user/same-identifier; device/IP heuristics flag for admin review; can't be perfectly prevented; reward eligibility gates (KYC) are the strong control. |
| Reversal | If underlying trade/deposit is reversed or fraud found → compensating ledger journal (`DR-020`). |
| Ledger | Paid from `referral_expense` platform account; every payout has journal + transaction record. |

---

# 25. LEADERBOARD

**Proposal:** "টপ ট্রেডার্স / লিডারবোর্ড" and admin management of "লিডারবোর্ড" `[REQ-066, 079]`.

**Undefined `DR-022`:** ranking metric (PnL? ROI? volume? win rate?), products included (spot/futures/binary), time periods (daily/weekly/monthly/all-time), min activity, real-only vs demo board, whether display names are anonymized, update frequency, tie-breaks, what admin can configure (visibility, periods, excluded users).
**[REC]** Compute from ledger/trade tables via worker into `leaderboard_snapshots` (never live-computed from user requests); demo excluded from real board; expose **pseudonymous display names** by default (privacy) with opt-out; exclude suspended/banned users; admin can hide entries. Ranking formula must be documented in this file once chosen.

---

# 26. ASSET AND MARKET MANAGEMENT

**Admin manages** assets/coins, initial prices, markets/pairs, fees, futures settings, leverage, binary settings `[REQ-076..078]`.

| Config | Boundary / danger | Change policy `[REC]` |
|---|---|---|
| Create asset | symbol/decimals **immutable after first trade/balance** | immediate for inactive asset; audited |
| Initial price | Only changeable while market has **no trades/positions**; after that it's a market-maker action | immutable once trading starts (changes need Super Admin + scheduled + reason) |
| Create market/pair | base≠quote; product flags | inactive → activate (maker/checker) |
| Disable market/asset | Impacts open orders/positions/binary trades | **Scheduled** with grace: stop new orders → cancel/settle open → final; never delete |
| Fees | Affects new trades only; **versioned**, effective-dated | scheduled or immediate for new orders only; store fee snapshot per trade |
| Leverage max | Lowering can push open positions into liquidation | apply to **new** positions; for existing require notice/auto-deleverage plan (`DR-007`) |
| Futures params (mmr, etc.) | Changing mmr affects liquidation prices of open positions | versioned; new positions only unless `DR-008` |
| Binary params (payout %, expiry list, limits) | Must not alter **existing** trades (snapshot payout on trade) | versioned; new trades only |
| Pricing/engine params | Affects price paths | Super Admin, scheduled, audit before/after |
| Manual price changes | **Dangerous** — could manipulate active binary/futures outcomes | **Disallow** via UI while any exposure exists `[REC]`; if ever allowed: Super Admin + reason + audit + notify |
All config in `market_configs`/`platform_settings` is **versioned (append-only)**, has `effective_from`, `created_by`, `approved_by` (for dangerous ones), and a **rollback = new version** copying an old one. Every change → audit log with before/after (Sec 28).

---

# 27. ADMIN PANEL

**Proposal scope `[REQ-076..082]`:** users, user status, trading permission, assets/coins, initial prices, markets & pairs, trading fees, futures settings, leverage, binary settings, funding plans, referral rates, leaderboard, listing applications, deposits, withdrawals, P2P, transactions, announcements, platform settings, **basic** admin/activity log. Business settings should be configurable from the panel "where logically possible".

Column meanings: **Perm** = permission string; **Conf** = confirmation UI; **Rev** = reversibility; **Risk** = financial risk (H/M/L). All audited (Sec 28) with actor, before/after, reason.

| Admin area | Actions | Perm | Validation | Conf | Rev | User impact | Risk |
|---|---|---|---|---|---|---|---|
| Users | list/search/view; edit limited profile | `user.read/update` | — | — | yes | — | L |
| User status | suspend/activate/ban | `user.status.update` | reason required; can't act on self/last super-admin | modal + reason | yes (new change) | login/trading blocked per policy | M |
| Trading permission | enable/disable real trading | `user.trading.update` | reason | modal | yes | blocks new orders; open exposure policy `DR-019` | M |
| Assets/coins | create/edit/disable | `asset.manage` | Sec 26 | modal | disable=reversible | listing visibility | H |
| Initial prices | set before launch | `asset.price.set` | only pre-trading | double confirm + Super Admin | no once traded | price basis | H |
| Markets & pairs | create/enable/disable | `market.manage` | Sec 26 | modal | yes | availability | H |
| Trading fees | edit schedule | `fee.manage` | bounds, versioned | modal | new version | new trades only | M |
| Futures settings/leverage | edit | `futures.config` | bounds, maker/checker | double confirm | new version | new positions only | H |
| Binary settings | edit | `binary.config` | bounds | double confirm | new version | new trades only | H |
| Funding plans | create/edit | `funding.manage` | `DR-021` | modal | yes | — | M |
| Referral rates | edit | `referral.config` | bounds | modal | new version | future rewards | M |
| Leaderboard | config/hide entries | `leaderboard.manage` | — | modal | yes | ranking visibility | L |
| Listing applications | review/approve/reject | `listing.review` | reason | modal | reject reversible before asset creation | applicant notified | L–M |
| Deposits | view/resolve requires_review | `deposit.review` | evidence | modal | compensating journal | balance | H |
| Withdrawals | approve/reject/mark paid | `withdrawal.approve` | amount/limits/KYC; **maker≠checker for > threshold** `[REC]` | double confirm | reject reversible before payout; after payout not | funds leave | **H** |
| P2P | view/resolve disputes | `p2p.manage` | `DR-015` | double confirm | limited | escrow release | H |
| Transactions | view/filter/export; flag | `transaction.read` | export masked/logged | — | — | — | L |
| Manual balance adjustment | credit/debit with reason | `ledger.adjust` | `DR-041`, dual control | double confirm | compensating journal | balance | **H** |
| Announcements | CRUD | `announcement.manage` | sanitized content | modal | yes | UI banner | L |
| Platform settings | edit (maintenance mode, limits, contact info) | `settings.manage` | schema-validated | modal | versioned | platform-wide | M–H |
| Admin/activity log | view/search/export | `audit.read` | — | — | append-only | — | L |
| Admin/role management | create admins/roles | `admin.manage` (Super Admin) | 2FA | double confirm | yes | — | H |
Admin UI never computes financial values; it calls server use-cases. Bulk actions limited and audited per item.

---

# 28. AUDIT LOGGING

**Proposal:** only a "basic admin/activity log" `[REQ-081]` and "auditable ledger records" `[REQ-061]`. **[REC]** treat audit as a first-class, append-only subsystem (financial platform).

| Field | Description |
|---|---|
| `id`, `occurred_at` | UUID + UTC time |
| `actor_type`, `actor_id` | user / admin / system:<worker> / provider |
| `action` | e.g. `auth.login.success`, `admin.withdrawal.approve` |
| `target_type`, `target_id` | affected entity |
| `before`, `after` | JSON diffs (secrets/PII redacted; sensitive fields hashed/masked) |
| `reason` | mandatory for admin sensitive actions |
| `ip`, `user_agent`, `request_id`/`correlation_id` | |
| `result` | success/denied/failed |
| `hash_prev`, `hash` | optional hash chain for tamper evidence `[REC]` |

**Minimum events:** login/logout/fail, password change/reset, role & permission changes, admin actions, wallet operations (via journals), deposits, withdrawals & each status change, trading-permission changes, fee/leverage/binary/futures config, asset creation & price changes, market configuration, payment events (received/verified/rejected), liquidation, settlement, manual adjustments, KYC status changes, listing decisions, legal-doc publishes.
**Rules:** append-only (no UPDATE/DELETE grants); written in the **same tx** as the business change for admin/financial actions (if audit write fails, the action fails); retention `DR-027`; searchable in admin panel with filters; exports are themselves audited.

---

# 29. NOTIFICATION SYSTEM

**Proposal:** "নোটিফিকেশন" only (in feature list `[REQ-011]`); SMTP and SMS/OTP are client-provided `[REQ-085]`. Channels beyond email/SMS/in-app (push) are not mentioned.

| Aspect | Design |
|---|---|
| Channels `[ASM-023]` | Email (SMTP), SMS (OTP + critical alerts), **in-app** (DB + WS `notification.created`). |
| Triggers (proposed) | Registration/verification, password reset/change, new-device login, deposit created/completed/failed, withdrawal requested/approved/rejected/completed, order filled/cancelled, liquidation, binary settled, referral reward, ticket reply, listing decision, P2P events, announcements, KYC status. Which are user-optional vs mandatory: `DR-028`. |
| Architecture | Domain events → **outbox** → notification worker → template render (i18n-ready) → channel adapters → `notification_deliveries` (status, attempts, provider_msg_id). |
| Preferences | `notification_preferences(user, event_type, channel)`; security/financial-critical notices cannot be disabled `[REC]`. |
| Retry | Exponential backoff (e.g. 5 attempts); provider failover only if a second provider exists (`DR-028`); permanent failure logged, never blocks the business action. |
| Idempotency | Dedupe key `(event_id, channel, user)`. |
| Content safety | No secrets/OTP in logs; templates reviewed; SMS cost controls (rate limits per user). |
| Language | Proposal is written in Bangla; UI/notification languages `DR-033`. |

---

# 30. STATE MACHINES

Legend: transitions listed as `FROM → TO (trigger, actor)`. **Anything not listed is invalid** and must return `409 INVALID_STATE_TRANSITION`. States are **[TD]/[ASM]** (proposal defines none, except that transaction status and withdrawal "request" exist).

### USER
```mermaid
stateDiagram-v2
  [*] --> pending_verification: register
  pending_verification --> active: verified (system)
  active --> suspended: admin suspend
  suspended --> active: admin activate
  active --> banned: admin ban
  suspended --> banned: admin ban
  banned --> suspended: super-admin restore
  pending_verification --> banned: admin ban
```
`trading_enabled` is a separate flag `[REQ-076]`. DB: `users.status`, `audit_logs`, sessions revoked on suspend/ban.

### ORDER (spot)
```mermaid
stateDiagram-v2
  [*] --> open: accepted, funds reserved
  open --> partially_filled: partial fill
  partially_filled --> filled: rest filled
  open --> filled: full fill
  open --> cancelled: user/admin cancel
  partially_filled --> cancelled: cancel remainder
  open --> rejected: [pre-accept failure only]
  open --> expired: TIF/expiry (if supported)
```
Terminal: `filled, cancelled, rejected, expired`. Invalid: any transition from terminal. Cancel releases remaining reservation.

### TRADE
`executed` only (immutable). Corrections by reversal journal + `trade_reversals` row, not edit.

### DEPOSIT
`pending → processing → completed`; `pending/processing → failed | cancelled | expired`; `processing → requires_review → completed | failed`. `completed → reversed` only via refund/chargeback workflow (admin) + compensating journal.

### WITHDRAWAL
```mermaid
stateDiagram-v2
  [*] --> pending: request + funds locked
  pending --> approved: admin approve
  pending --> rejected: admin reject (release funds)
  pending --> cancelled: user cancel (release)
  approved --> processing: payout started
  processing --> completed: payout success (finalize ledger)
  processing --> failed: payout failed (release or retry per policy)
  failed --> pending: retry (admin)
```
Automatic approval rules `DR-016`. `completed` is terminal.

### TRANSACTION (user-facing)
`pending → processing → completed | failed | cancelled`; `completed → reversed` (compensating). Status changes append `transaction_status_history`.

### FUTURES POSITION
```mermaid
stateDiagram-v2
  [*] --> open: fill
  open --> open: add/reduce/margin change
  open --> closed: user close / reduce to zero
  open --> liquidated: breach (worker)
```
`liquidated`, `closed` terminal. Liquidation vs user-close race: whichever locks the row first wins; the other sees non-`open` and no-ops.

### BINARY TRADE
`created → accepted → active → expiring → settled → won | lost` (`tie/refunded` per `DR-013`); `created → rejected`; `active → cancelled` only if `DR-014` allows.

### P2P ORDER `[DR-015]` (proposed)
`created → awaiting_payment → paid_marked → released` ; `awaiting_payment → cancelled | expired`; `paid_marked → disputed → released | refunded`.

### SUPPORT TICKET
`open → in_progress → waiting_user → resolved → closed`; `resolved → reopened(open)` within window; `closed` terminal.

### LISTING APPLICATION
`submitted → under_review → approved | rejected | needs_info`; `needs_info → under_review`; `approved → listed` (asset created) ; `rejected` terminal (re-apply creates new).

### PAYMENT (intent)
`created → pending → succeeded | failed | cancelled | expired`; `pending → requires_review`; `succeeded → refunded | partially_refunded` (if supported).

Each transition is implemented by a **domain function** (pure) validating the allowed-transition table, invoked inside the `tx` that writes side effects and audit rows.

---

# 31. CRITICAL FINANCIAL INVARIANTS

Violation of any item is a **severity-1 defect**. Each has an enforcement mechanism and a test (Sec 34). IDs are referenced by tests as `INV-nn`.

| ID | Invariant | Enforcement |
|---|---|---|
| INV-01 | Money cannot appear from nowhere: every credit has a matching debit in the same journal. | Balanced-journal constraint trigger; `ledger.Post` validation. |
| INV-02 | Money cannot disappear without an auditable reason: no delete/update on ledger, only compensating journals. | Append-only grants/triggers. |
| INV-03 | `available` never < 0 and `locked` never < 0 (unless `DR-009` explicitly permits a specific negative-capable account). | DB CHECK + conditional update. |
| INV-04 | `locked` equals Σ of valid live reservations (open orders, pending withdrawals, open position margin, active binary stakes, escrow). | Reconciliation job; tests. |
| INV-05 | Every balance change has exactly one journal (and ≥ 1 ledger entry). | Only `ledger.Post` can write `wallet_balances`; DB role grants. |
| INV-06 | Duplicate webhook cannot duplicate funds. | `payment_events` unique event-id; `journals.idempotency_key`. |
| INV-07 | Retrying an API request cannot duplicate a financial action. | `Idempotency-Key` + request hash. |
| INV-08 | Demo funds never enter real accounting; no cross-schema references. | Separate schema/roles/types (Sec 14). |
| INV-09 | A binary trade settles at most once. | Guarded status update + key `settle:<id>`. |
| INV-10 | A futures position liquidates at most once; liquidation is idempotent. | Unique `liquidations.position_id`; key `liquidate:<id>:<ver>`. |
| INV-11 | A spot order never fills beyond its quantity; partial fills sum ≤ qty. | CHECK + locked row. |
| INV-12 | Concurrent orders cannot spend the same funds twice. | Row locks/conditional updates in reservation. |
| INV-13 | Fees are computed server-side from the versioned schedule and stored on the row; history is immutable. | Domain service + snapshot columns. |
| INV-14 | A deposit is credited once and only after provider-verified success. | Deposit state machine + webhook verification. |
| INV-15 | A withdrawal's funds are reserved before it is reviewed; completion consumes the reservation; failure releases it exactly once. | State machine + journal keys. |
| INV-16 | Total system closure: Σ all ledger accounts per asset = 0 (i.e. user liabilities + platform accounts = external clearing). | Reconciliation. |
| INV-17 | Client-provided amounts/prices/PnL are never trusted; server recomputes. | Server-authoritative use-cases. |
| INV-18 | A suspended/banned user cannot create new financial obligations; existing ones are handled per policy. | Middleware + service checks. |
| INV-19 | Config changes never retroactively alter executed trades/settled outcomes. | Snapshots + versioned configs. |
| INV-20 | Every admin financial or configuration action has an audit row written in the same transaction. | Same-tx audit write. |
| INV-21 | Time-based outcomes (expiry) use server time only. | Server clock; no client timestamps in logic. |
| INV-22 | Rounding is deterministic and identical between calculation and posting (no penny drift: Σ split parts = whole). | Central money package + vectors. |
| INV-23 | Frontend/Redis state is never a source of truth for balances or orders. | Architecture rule. |
| INV-24 | Ledger imbalance or reconciliation drift triggers alert and withdrawal freeze. | Monitoring (Sec 33). |

---

# 32. ERROR HANDLING

Consistent error model (envelope in Sec 18). `retry` = whether the client may retry **with the same idempotency key**. Log level: `INFO` expected, `WARN` suspicious/business, `ERROR` server fault, `CRIT` invariant/security.

| Code | HTTP | Retry | Log | Category / message guidance |
|---|---|---|---|---|
| `VALIDATION_FAILED` (details per field) | 400/422 | no | INFO | Validation |
| `IDEMPOTENCY_KEY_REQUIRED` | 400 | no | INFO | Duplicate control |
| `AUTH_REQUIRED` / `TOKEN_EXPIRED` | 401 | after refresh | INFO | AuthN |
| `INVALID_CREDENTIALS` (generic) | 401 | no | WARN | AuthN — never reveals which field |
| `ACCOUNT_LOCKED` / `ACCOUNT_SUSPENDED` | 403 | no | WARN | AuthN/Z |
| `FORBIDDEN` / `PERMISSION_DENIED` | 403 | no | WARN | AuthZ |
| `TRADING_NOT_ENABLED` | 403 | no | INFO | Business |
| `VERIFICATION_REQUIRED` / `KYC_REQUIRED` | 403 | no | INFO | Business `[DR-018]` |
| `INSUFFICIENT_BALANCE` | 422 | no | INFO | Business |
| `INSUFFICIENT_MARGIN` | 422 | no | INFO | Business |
| `INVALID_ORDER` (tick/step/min-notional) | 422 | no | INFO | Business |
| `MARKET_UNAVAILABLE` / `MARKET_HALTED` | 409 | later | INFO | Business |
| `MARKET_DATA_STALE` | 503 | yes (short) | WARN | Dependency |
| `ORDER_NOT_CANCELABLE` / `INVALID_STATE_TRANSITION` | 409 | no | INFO | State |
| `DUPLICATE_REQUEST` / `IDEMPOTENCY_KEY_REUSED` | 409 | no | WARN | Duplicate |
| `LIMIT_EXCEEDED` (amount, exposure) | 422 | no | INFO | Business |
| `NOT_FOUND` | 404 | no | INFO | |
| `RATE_LIMITED` (+`Retry-After`) | 429 | yes | WARN | Rate limit |
| `PROVIDER_ERROR` (payment/KYC/SMS/market) | 502 | yes | ERROR | Provider |
| `PROVIDER_TIMEOUT` | 504 | yes | ERROR | Provider |
| `DB_TIMEOUT` / `SERIALIZATION_CONFLICT` | 503/409 | yes | ERROR | DB (auto-retry inside server ×N first) |
| `INTERNAL_ERROR` | 500 | maybe | ERROR (with stack) | never leak internals |
| `LEDGER_INVARIANT_VIOLATION` | 500 | no | **CRIT** + page | Invariant |
**Rules:** Money endpoints return a definitive outcome or a queryable `pending` status; on ambiguity (timeout after commit) client re-queries by idempotency key / `client_order_id`. Errors localized by code on the client (`DR-033`); server messages are English-neutral.

---

# 33. OBSERVABILITY

Monitoring/security services are **client-provided** `[REQ-085]`; the tooling below is a **[REC]** (self-hostable: Prometheus/Grafana/Loki, or hosted equivalent, incl. Sentry-style error tracking).

| Area | Design |
|---|---|
| Structured logging | JSON logs (`slog`/`zerolog`): `ts, level, service, env, request_id, user_id(hash), route, latency_ms, err_code`. **Never** log passwords, OTPs, tokens, full card/bank data, KYC docs. |
| Correlation IDs | `X-Request-ID` generated at edge, propagated to logs, DB `application_name`/journal `correlation_id`, audit rows, jobs. |
| Metrics | RED per route; DB pool/latency; Redis latency; WS connections/msgs/drops; **business metrics**: orders/s, fills, deposits/withdrawals by status, pending-age, settlement lag (`now − expires_at` for unsettled binary), liquidation lag, price staleness per market, provider error rates, reconciliation drift (must be 0). |
| Tracing | OpenTelemetry traces API→DB→provider `[REC]`. |
| Health | `/healthz` (liveness: process), `/readyz` (readiness: DB ping, Redis ping, migrations version), `/internal/status` (workers heartbeat, market data freshness). |
| Alerting (critical) | Reconciliation drift ≠ 0; ledger invariant violation; webhook signature failures spike; payment `requires_review` backlog; settlement/liquidation lag > threshold; stale price on any active market; DB replication/backup failure; disk/memory; 5xx rate; auth-failure spike; admin actions outside hours `[REC]`. |
| Error monitoring | Sentry-style with PII scrubbing. |
| Runbooks | `docs/runbooks/*` for each critical alert. |
| 24/7 support link | Alerts route to the vendor's 24/7 channel during dev/free-support period `[REQ-087]`; after that, per monthly service `[REQ-090]`. |

---

# 34. TESTING STRATEGY

| Level | Scope & tools `[REC]` |
|---|---|
| Unit | Go `testing` + `testify`: domain rules, state machines, money/rounding, fee/PnL/liquidation math (**table-driven with deterministic vectors**). Frontend: Vitest/RTL for components/hooks. |
| Integration | Real PostgreSQL + Redis (Testcontainers): repos, ledger posting, migrations up/down, constraint triggers. |
| API | Contract tests from OpenAPI (schemathesis/Newman); authZ matrix tests (every endpoint × role). |
| Database | Migration tests on prod-like data; invariants checks (INV-01..24) as SQL assertions; append-only enforcement tests. |
| WebSocket | Auth, subscription authorization, seq ordering, reconnect resync, slow consumer. |
| Financial calculation | Vectors below; property-based tests (Σ debits = Σ credits for random sequences; no negative balances; rounding sums). |
| Concurrency | Parallel goroutine tests: N concurrent orders/withdrawals on one balance; parallel webhook duplicates; liquidation vs close race; settlement double-run; `-race` in CI. |
| Security | SAST (`gosec`, `govulncheck`, ESLint security), dependency audit, DAST (ZAP) on staging, authZ bypass tests, rate-limit tests; independent pentest before public real-money launch `[REC]`. |
| E2E | Playwright: register→verify→deposit(sandbox)→trade→withdraw; admin flows; demo banner presence. |
| Load | k6: price fan-out (WS), order placement, login; targets set by client `[DR]` (no numeric SLA in proposal). |
| Failure recovery | Kill API mid-tx, kill worker mid-settlement, Redis down, provider timeout, DB failover/restore drill. |

## 34.1 Deterministic financial test scenarios
All numbers are **illustrative test vectors pending decisions** (fees, formulas marked `DR`); they must be updated to the approved rules.

| # | Scenario | Given | Steps | Expected |
|---|---|---|---|---|
| T1 | Deposit | user avail 0 USD; deposit 100.00; fee 0 | valid webhook | avail 100.00; 1 journal, balanced; txn `completed` |
| T2 | Duplicate webhook | as T1 | same event twice | avail 100.00 (not 200); second returns 200 no-op; 1 journal |
| T3 | Withdrawal | avail 100 | request 40 | avail 60, locked 40, txn `pending` |
| T3b | Withdrawal rejected | after T3 | admin reject | avail 100, locked 0 |
| T3c | Withdrawal completed | after T3 | approve+paid | avail 60, locked 0, external_clearing −40 |
| T4 | Insufficient balance | avail 10 | withdraw 40 / buy 50 | `INSUFFICIENT_BALANCE`; no journal |
| T5 | Spot market buy (assumed taker 0.1%, price 2.00) | avail 100 USD | buy 10 units | cost 20.00; fee 0.02 (round up to tick); avail 79.98; base +10 |
| T6 | Spot sell | holds 10 base @ price 2.50 | sell 10 | proceeds 25.00; fee 0.025 → rounded per policy; quote credit net |
| T7 | Limit buy | avail 100 | limit 10 @ 1.50 | locked 15.00 (+fee reserve `[DR]`); order `open`; cancel → avail 100 |
| T8 | Partial fill | T7 | fill 4 | locked reduces to 9.00; `partially_filled`; base +4 |
| T9 | Concurrent orders | avail 100, two parallel buys costing 70 | run concurrently ×1000 | exactly one succeeds; avail never < 0 (INV-03/12) |
| T10 | Futures long (see 12.3) | avail 100; L=10; E=100; Q=2; fee 0.06% | open | IM 20, fee 0.12; avail 79.88; locked 20 |
| T10b | Long PnL | M=105 | close | +10 − fees; released margin 20+10−fees |
| T11 | Futures short | same | M=95 close | +10 |
| T12 | Liquidation | T10, M=90.5 | worker run ×2 | position `liquidated` once; second run no-op (INV-10) |
| T13 | Binary win (assumed payout 80%) | stake 10; entry 100; settle 101; UP | expiry | net +8; stake returned; journal keys once |
| T14 | Binary loss | settle 99 | expiry | −10 to house |
| T14b | Binary double settlement | run worker twice / crash mid-way | | one settlement (INV-09) |
| T15 | Idempotent retry | POST order twice same key | | same order returned; one reservation |
| T16 | Demo isolation | demo balance 10,000 | any demo op | zero rows in real ledger; real balances unchanged (INV-08) |
| T17 | Rounding | split 0.01 among 3 | | parts sum to exactly 0.01 |
| T18 | Stale price | last tick 60 s old | open futures | `MARKET_DATA_STALE` |

---

# 35. ACCEPTANCE CRITERIA

Legend: **[REQ]** = derived directly from a proposal requirement; **[PROPOSED]** = engineering criterion not stated by the proposal (must not be presented as proposal fact). Criteria depending on unresolved decisions cannot be finalized until then.

| Feature | Acceptance criteria |
|---|---|
| Registration/Login `[REQ-005]` | User can register & log in [REQ]; duplicate identifiers rejected [PROPOSED]; passwords stored hashed with Argon2id [PROPOSED]; generic errors, rate limited [PROPOSED]. |
| Verification `[REQ-008]` | Email and/or phone verification is supported [REQ]; OTP expiry/attempt limits enforced [PROPOSED]. |
| Password mgmt `[REQ-009]` | Reset and change work; sessions revoked [PROPOSED]. |
| Profile/dashboard/notifications | Pages exist and are responsive [REQ-001]; in-app notifications delivered [PROPOSED]. |
| Wallet `[REQ-052..061]` | Available balance shown [REQ]; transaction ID/fee/status shown [REQ]; every balance change has a balanced journal [REQ-061 + PROPOSED]; reconciliation passes [PROPOSED]. |
| Deposit `[REQ-054]` | Via configured provider [REQ-086]; credit only after verified webhook [PROPOSED]; duplicate webhook does not double-credit [PROPOSED]. |
| Withdrawal `[REQ-055]` | User can request [REQ]; verification/limits (per `DR-016/018`) enforced; available balance sufficient; amount reserved atomically; transaction ID generated [REQ-058]; duplicates prevented via idempotency; status changes auditable; failure/rejection restores reserved funds [all PROPOSED except request+ID]. |
| Spot `[REQ-012..025]` | Admin can create asset with configurable initial price [REQ]; market and limit orders [REQ]; open orders/history/trades visible [REQ]; live price & chart update [REQ]; fees applied [REQ]; price-movement behavior per approved `DR-002` (**pending**). |
| Futures `[REQ-026..035]` | Long/short with leverage/margin [REQ]; entry/mark price, PnL, liquidation price shown [REQ]; open positions/history [REQ]; formulas per approved `DR-007..011` and matching vectors (**pending**); liquidation idempotent [PROPOSED]. |
| Binary `[REQ-036..044]` | Choose asset, UP/DOWN, amount, expiry [REQ]; countdown visible [REQ]; potential payout shown [REQ]; active/completed/win-loss lists [REQ]; settlement once [PROPOSED]; payout/price rules per `DR-012/013` (**pending**). |
| Demo `[REQ-045..051]` | Futures & binary demo with virtual balance/PnL/liquidation/history [REQ]; disclaimer text shown on every demo account view [REQ-051]; no effect on real wallets [PROPOSED but critical]. |
| Funding `[REQ-062,063]` | Plan list and calculator exist [REQ]; behavior pending `DR-021`. |
| Referral `[REQ-064,065]` | Referral program/earnings exist; admin can set rates [REQ]; rules pending `DR-020`. |
| Leaderboard `[REQ-066]` | Top traders shown [REQ]; formula pending `DR-022`. |
| Listing `[REQ-067]` | User submits; admin reviews [REQ-079]; workflow pending `DR-031`. |
| P2P `[REQ-069]` | Basic marketplace; admin can manage [REQ-080]; rules pending `DR-015`. |
| Support/FAQ/Announcements/Legal `[REQ-070..075]` | Tickets creatable/answerable; FAQ, announcements, T&C/Privacy/Risk pages viewable [REQ]; legal content supplied by client [REQ-091]. |
| Admin `[REQ-076..082]` | Each listed management area available [REQ]; admin/activity log exists [REQ]; all sensitive actions audited with before/after [PROPOSED]; RBAC enforced [PROPOSED]. |
| Payments `[REQ-086]` | One agreed provider integrated in dev-side scope [REQ]; sandbox tests pass; webhook verification [PROPOSED]. |
| Deployment `[REQ-095]` | Production deployment done on client-provided infra [REQ]; TLS; backups configured [PROPOSED]. |
| Support commitments `[REQ-087..090]` | Channel established; revision & bug-fix windows tracked [REQ]. |

---

# 36. EDGE-CASE CATALOGUE

| Edge case | Expected handling |
|---|---|
| Duplicate requests | Idempotency key → replay stored response; different body → 409. |
| Network failure after server commit | Client re-queries by idempotency key/`client_order_id`; server never double-executes. |
| Database timeout | `tx` rolled back; retry if safe; return 503 with retry; never partial ledger. |
| Redis failure | Cache → DB/provider fallback; rate limits fail closed on auth; WS fan-out degraded (clients poll); financial jobs unaffected (DB-driven). |
| WebSocket disconnect | Client backoff reconnect + REST resync; UI shows "reconnecting". |
| Provider timeout (payment) | Keep `pending`; reconcile job polls; never guess success. |
| Provider timeout (market data) | Stale handling Sec 15. |
| Duplicate webhook | Dedup; 200 no-op. |
| Out-of-order webhooks (e.g. failed after success) | State machine + provider query as truth. |
| Stale price | Reject opens; defined behavior for settlement/liquidation (`DR-009/013`). |
| Rapid price movement / gaps | Price bands; circuit breaker `[DR]`; liquidation at mark; shortfall policy. |
| Simultaneous orders/withdrawals | Row locks; only funds-affordable subset succeeds. |
| Account suspended during trade | In-flight request re-checks status inside `tx`; existing positions handled per `DR-019` (default: allowed to close/cancel only `[ASM]`). |
| Asset disabled with active orders | Stop new orders; cancel/settle per scheduled policy (Sec 26). |
| Market disabled | Reject new orders; open orders cancelled with release; positions/binary trades settle by policy. |
| Partial execution | Reservation reduced proportionally; remaining stays open. |
| Liquidation race | Row lock + re-check + unique liquidation row. |
| Settlement race | Guarded update + idempotency key. |
| Server restart during transaction | Postgres rollback; outbox/DB jobs resume; no double effect. |
| Worker restart | Jobs are DB rows with `SKIP LOCKED`; lease timeouts; idempotent handlers. |
| Message duplication / ordering | Consumers idempotent; WS `seq`/`event_id`. |
| Clock skew | Server NTP; expiry uses DB `now()` in same statement. |
| User changes password mid-withdrawal | Existing pending withdrawal continues or held per `DR-016`; sessions revoked. |
| Payment amount mismatch | `requires_review`. |
| Demo balance exhausted | Reset flow per `DR-029`; never top-up from real wallet. |
| Admin changes fee while order open | Fee snapshot at fill vs at placement rule `DR-006` (recommend at fill using version at placement `[REC]`). |
| Very large numbers / precision overflow | Validate ≤ `NUMERIC(38,18)`; reject exponent notation. |

---

# 37. DEPLOYMENT

Proposal: VPS/cloud server, R2/storage, domain/DNS, SMTP, SMS, market data API, KYC/AML, financial APIs, SSL, monitoring — **all client-provided**; delivery includes "production deployment" `[REQ-085, 091, 095]`. The client supplies infrastructure; the vendor deploys. Specific topology is **[REC]**.

| Component | Design |
|---|---|
| Topology (MVP) | 1 VPS (or 2: app + DB) with Docker Compose or systemd; scale later. Single-node = **single point of failure** — acknowledge to client `[DR-046]`. |
| Reverse proxy/TLS | Caddy or Nginx; TLS via client-provided certificate or Let's Encrypt (auto); HSTS; HTTP→HTTPS; WS upgrade routes. |
| Frontend | Next.js in Node container (`next start`) or static+SSR behind proxy. |
| Go API + worker | Separate containers/units from same image; graceful shutdown (drain WS, finish `tx`); ≥ 2 API replicas when sized. |
| PostgreSQL | Version pinned (e.g. 16); managed DB preferred if client can provide, else self-hosted with WAL archiving; `synchronous_commit=on`; connection pool (pgxpool/pgbouncer). |
| Redis | Separate instance/volume for queues; password + private network only; AOF. |
| Domain/DNS | Client-provided; records for app, api (or same origin), ws; DNS TTL low during cutover. |
| Storage | R2 bucket(s): `kyc-private`, `attachments-private`, `public-assets`; presigned URLs; lifecycle rules; keys not in repo. |
| Env & secrets | See Sec 38; delivered via secret manager/`.env` with `600` perms; never committed. |
| Migrations | Versioned SQL; run by `cmd/migrate` in deploy step; **expand→migrate→contract** for zero-downtime; backups before migrating; never edit applied migrations. |
| Backups | Nightly full + continuous WAL (PITR); off-site (R2/other) encrypted; **restore drills** quarterly `[REC]`; Redis not required to be restored. RPO/RTO `DR-046`. The proposal only mentions "backup/operational help" in the **post-support monthly service** `[REQ-090]` — backup setup at delivery is [REC] and should be confirmed in scope. |
| Logging/monitoring | Sec 33; log rotation; alert routes. |
| Environments | Production (proposal); **staging** `[REC]` (proposal silent) with payment sandbox and demo data; `DR-048`. |
| CI/CD | GitHub Actions `[REC]`: lint, test, build images, deploy via SSH/compose; manual approval for production. |
| Rollback | Keep previous image tags; backward-compatible migrations; feature flags for risky modules; DB rollback = restore or forward-fix; runbook. |
| Go-live gate | **Real-money functionality must not be opened publicly until approvals and legal/compliance review are complete** `[REQ-094]`. Implement a platform kill-switch/`real_trading_enabled` setting `[REC]`. |
| Hardening | Firewall (only 80/443/SSH-key), fail2ban, SSH key-only, unattended security updates, non-root containers, DB not internet-exposed. |

---

# 38. ENVIRONMENT VARIABLES

No real credentials. Prefix conventions: `APP_`, `DB_`, `REDIS_`, `AUTH_`, `PAY_`, `SMTP_`, `SMS_`, `MD_`, `KYC_`, `S3_`, `MON_`. **R** = required, **O** = optional, **E** = differs per environment (dev/staging/prod).

| Variable | Used by | R/O | E | Notes |
|---|---|---|---|---|
| `APP_ENV` | all | R | E | `development|staging|production` |
| `APP_BASE_URL`, `API_BASE_URL`, `WS_URL` | FE, BE | R | E | |
| `APP_ALLOWED_ORIGINS` | BE | R | E | CORS allowlist |
| `LOG_LEVEL` | BE | O | E | |
| `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` | FE | R | E | public, non-secret only |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | FE | O | E | if CAPTCHA |
| `DB_URL` (or `DB_HOST/PORT/NAME/USER/PASSWORD/SSLMODE`) | BE, worker | R | E | |
| `DB_URL_DEMO` / role for demo schema | BE | R | E | separate role `[ADR-005]` |
| `DB_MAX_CONNS`, `DB_STATEMENT_TIMEOUT` | BE | O | E | |
| `REDIS_URL`, `REDIS_QUEUE_URL` | BE, worker | R | E | |
| `AUTH_JWT_PRIVATE_KEY`, `AUTH_JWT_PUBLIC_KEY`, `AUTH_JWT_KID` | BE | R | E | asymmetric |
| `AUTH_ACCESS_TTL`, `AUTH_REFRESH_TTL` | BE | O | | defaults documented |
| `AUTH_PASSWORD_PEPPER` | BE | O | E | |
| `AUTH_COOKIE_DOMAIN` | BE | R | E | |
| `PAY_PROVIDER` (`sslcommerz|stripe`) | BE | R | E | `DR-024` |
| `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_SANDBOX`, `SSLCOMMERZ_IPN_URL` | BE | R if SSLCOMMERZ | E | |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` | BE, FE(pub) | R if Stripe | E | |
| `PAY_WEBHOOK_TOLERANCE_SECONDS` | BE | O | | |
| `SMTP_HOST/PORT/USER/PASSWORD/FROM`, `SMTP_TLS` | worker | R | E | client-provided |
| `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_SENDER_ID` | worker | R (if phone OTP) | E | `DR-028` |
| `MD_PROVIDER`, `MD_API_URL`, `MD_WS_URL`, `MD_API_KEY`, `MD_STALE_AFTER_SECONDS` | worker | R (if external prices) | E | `DR-023` |
| `KYC_PROVIDER`, `KYC_API_KEY`, `KYC_WEBHOOK_SECRET` | BE | O until `DR-018` | E | |
| `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_PRIVATE`, `S3_BUCKET_PUBLIC` | BE | R | E | R2 is S3-compatible |
| `MON_SENTRY_DSN`, `MON_OTEL_ENDPOINT` | all | O | E | |
| `FEATURE_REAL_TRADING_ENABLED` (kill-switch default `false`) | BE | R | E | `[REQ-094]` |
| `ADMIN_BOOTSTRAP_EMAIL` | migrate/seed | O | E | one-time super-admin |

### `.env.example`
```dotenv
# ---- App ----
APP_ENV=development
APP_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:8080
WS_URL=ws://localhost:8080/ws
APP_ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=debug
FEATURE_REAL_TRADING_ENABLED=false
# ---- Frontend (public only) ----
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
# ---- Database ----
DB_URL=postgres://app:CHANGE_ME@localhost:5432/trading?sslmode=disable
DB_URL_DEMO=postgres://app_demo:CHANGE_ME@localhost:5432/trading?sslmode=disable
# ---- Redis ----
REDIS_URL=redis://localhost:6379/0
REDIS_QUEUE_URL=redis://localhost:6379/1
# ---- Auth ----
AUTH_JWT_PRIVATE_KEY=path-or-inline-key
AUTH_JWT_PUBLIC_KEY=path-or-inline-key
AUTH_JWT_KID=dev-1
AUTH_ACCESS_TTL=15m
AUTH_REFRESH_TTL=720h
AUTH_COOKIE_DOMAIN=localhost
# ---- Payments (choose one) ----
PAY_PROVIDER=sslcommerz
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_SANDBOX=true
SSLCOMMERZ_IPN_URL=http://localhost:8080/api/v1/webhooks/payments/sslcommerz
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
# ---- Email / SMS ----
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=no-reply@example.com
SMS_PROVIDER=
SMS_API_KEY=
SMS_SENDER_ID=
# ---- Market data ----
MD_PROVIDER=
MD_API_URL=
MD_WS_URL=
MD_API_KEY=
MD_STALE_AFTER_SECONDS=10
# ---- KYC/AML ----
KYC_PROVIDER=
KYC_API_KEY=
KYC_WEBHOOK_SECRET=
# ---- Storage (R2/S3-compatible) ----
S3_ENDPOINT=
S3_REGION=auto
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_PRIVATE=
S3_BUCKET_PUBLIC=
# ---- Monitoring ----
MON_SENTRY_DSN=
MON_OTEL_ENDPOINT=
```

---

# 39. DEVELOPMENT PHASES

The proposal gives an **estimated** six-week schedule `[REQ-084]`. Below it is translated into engineering phases **without changing scope**. **Feasibility caveat:** the proposal's scope (wallet/ledger, spot engine, futures with liquidation, binary settlement, demo isolation, payments, P2P, funding, referral, leaderboard, listing, full admin, security review, deployment) is very large for six weeks, and several core mechanisms are undefined (Sec 42). The timeline does **not** by itself guarantee feasibility; delays in client-provided accounts/APIs/approvals may also extend it `[REQ-092]`. `[REC]`: agree on "must / should / could" priorities (`DR-038`) and a definition of what "MVP" contains before Week 1.

### Phase 1 — Architecture & Core setup (Proposal Week 1–2)
| Item | Content |
|---|---|
| Objectives | Foundations that everything else depends on. |
| Modules (proposal) | Architecture, UI/UX design, authentication, user dashboard, database, wallet/ledger `[REQ §7]`. |
| Additional required (inferred) | Repo/CI, config, migrations, RBAC skeleton, audit skeleton, idempotency framework, money package, outbox. |
| Dependencies | Client: domain, VPS, SMTP/SMS accounts; decisions `DR-005, 026, 032, 047`. |
| Deliverables | Running auth flows, user dashboard shell, schema v1 with real+demo schemas, ledger posting service with tests, design system & dark theme. |
| Testing | Unit + integration for auth and ledger (INV-01..07); property tests for ledger. |
| Completion criteria | User registers/verifies/logs in; sandbox deposit path can credit ledger via test harness; all ledger invariants tested; API contract v1 drafted. |

### Phase 2 — Trading core & advanced features (Week 3–4)
| Item | Content |
|---|---|
| Modules | Asset management, buy/sell engine, dynamic pricing, live market updates, charts, trading history; futures & binary; demo trading `[REQ §7]`. |
| Dependencies | **Blocking decisions:** `DR-001/002/003/023` (engine), `DR-006` (fees), `DR-007..011` (futures), `DR-012..014` (binary), `DR-029` (demo); market-data API access. |
| Deliverables | Spot flow, futures with liquidation worker, binary with settlement worker, demo schema wiring, WebSocket price/order/position events, admin config for these products. |
| Testing | Deterministic vectors T5–T18; concurrency & race tests; WS tests. |
| Completion | All products operate on sandbox/staging with reconciliation passing; INV-01..24 tests green. |

### Phase 3 — Finalization & deployment (Week 5–6)
| Item | Content |
|---|---|
| Modules | Funding, referral, leaderboard; P2P, coin listing; admin panel; payment integration; testing, security review, bug fixing; production deployment `[REQ §7]`. |
| Dependencies | `DR-015/016/017/018/020/021/022/024/031/045`; payment merchant account & approval; legal content `[REQ-091]`; licences `[REQ-093]`. |
| Deliverables | Complete admin panel; payment integration verified in sandbox then production; security review report; deployment + runbooks. |
| Testing | E2E, load, security scans, failure drills, restore test. |
| Completion | Acceptance criteria (Sec 35) met for delivered scope; deployment in production **with real-money kill-switch OFF** until client confirms compliance `[REQ-094]`. |

### Critical path
`DR-001/002/003` → ledger schema & engine → futures/binary → demo; `DR-024/045` (payment approval) → deposit/withdrawal → any real-money testing; `DR-023` market-data contract → prices → futures/binary; client-provided VPS/domain/SMTP/SMS early; legal content before launch. **If payment approval or market data access is late, the end-to-end real-money path cannot complete regardless of code readiness.**

---

# 40. PROJECT RISKS

Likelihood/impact are qualitative (Low/Med/High/Critical); no numeric probabilities are claimed.

| Risk | Impact | Likelihood | Mitigation | Owner | Dependency |
|---|---|---|---|---|---|
| Financial correctness (ledger bugs, rounding, races) | Critical | Med–High under time pressure | Double-entry ledger, invariants, property/concurrency tests, reconciliation, reviews of money code | Tech lead/QA | Sec 10, 31 |
| Regulatory/licensing (real-money trading, binary/futures) | Critical | High (jurisdiction dependent) | Client legal review; kill-switch; gating; docs [REQ-093/094] | Client | Legal counsel/licences |
| Payment-provider approval / category restrictions | Critical | High | Early merchant application; confirm category; manual-deposit fallback design; adapter pattern | Client + PM | `DR-024/045` |
| Withdrawal rail undefined (payouts) | High | High | Manual payout with proof as MVP; confirm provider payout capabilities | Client + Tech lead | `DR-017` |
| Market-data dependency (cost, latency, availability, licensing) | High | Med | Provider abstraction; stale handling; halt rules; caching | Tech lead | `DR-023` |
| KYC/AML dependency | High | Med | Provider interface; configurable gating; delays tolerated | Client | `DR-018` |
| Trading-engine complexity/undefined mechanism | Critical | High | Decide `DR-001..003` first; engine interfaces; spike; fixtures | Product + Tech lead | Sec 11.3 |
| Futures/liquidation correctness & insolvency (house exposure) | Critical | Med | Approved formulas, conservative defaults (isolated, low leverage), risk limits, insurance-fund policy | Product + Tech lead | `DR-007..011` |
| Binary manipulation/settlement disputes | High | Med | Price-source integrity, tick audit, server time | Tech lead | `DR-012..014` |
| Concurrent transaction handling | Critical | Med | Row locking, idempotency, load/race tests | Backend | Sec 10.4 |
| Security (auth, admin, payments) | Critical | Med | Sec 19, review, pentest, 2FA for admin | Security | — |
| Infrastructure failure (single VPS, backups) | High | Med | Backups + restore drills, monitoring, documented RPO/RTO | DevOps/Client | `DR-046` |
| Timeline compression (6 weeks) | High | High | Prioritization (`DR-038`), defer P2P/funding depth, freeze scope, decisions early | PM | Sec 39 |
| Ambiguous business rules | High | High | Sec 42 sign-off gate before coding affected modules | Product | Client |
| Third-party API changes | Med | Med | Adapters, contract tests, version pins | Backend | providers |
| Demo/real contamination | Critical | Low–Med | Sec 14 layered isolation, tests | Backend/QA | — |
| Data protection/PII (KYC docs) | High | Med | Minimization, private storage, retention policy, access logs | Client + Security | `DR-027` |
| Scope creep vs. warranty exclusions | Med | Med | Change management (Sec 48); warranty excludes new features/major trading changes `[REQ-089]` | PM | — |

---

# 41. LEGAL AND COMPLIANCE BOUNDARY

**Proposal position `[REQ-093, 094]`:** the platform involves real-money trading; the **client** is responsible for complying with applicable laws and regulations, potentially including financial/trading licences, KYC/AML, payment regulation, consumer protection, data protection, tax, trading restrictions, and binary/futures regulation. The development team provides **technical implementation only** and does **not** provide legal, financial or regulatory approval. Real-money functionality should be opened to the public **only after** the required approvals and proper legal/compliance review.

**This document does not provide legal advice.** Engineering takes the following as **inputs the client/legal team must provide** (technical compliance dependencies):

| Area | What engineering needs from client/legal | Related sections |
|---|---|---|
| Licensing | Confirmation which licence(s) apply and which products (spot/futures/binary/P2P/funding) are permitted; supported jurisdictions; product feature flags per jurisdiction | `DR-025`; Sec 26 |
| KYC/AML | Required verification levels, screening, transaction limits, reporting duties, record-keeping periods | Sec 20; `DR-018` |
| Payment regulation | Permitted payment methods, provider terms, safeguarding of client funds, refund/chargeback rules | Sec 21; `DR-017/024/045` |
| Consumer protection | Required disclosures (Risk Disclosure text), cooling-off, complaint handling, leverage caps for retail | Sec 3.S; `DR-007` |
| Data protection | Lawful bases, retention/deletion rules, cross-border transfer limits, breach notification process | `DR-027`; Sec 19 |
| Taxation | Tax reporting/withholding, statement/export formats | Not in proposal scope; new requirement if needed |
| Trading restrictions | Geo-blocking, restricted persons, product prohibitions, position limits | `DR-019/025` |
| Binary/futures regulation | Whether offered at all; risk warnings; leverage/margin rules | `DR-007/012` |
| Legal content | T&C, Privacy Policy, Risk Disclosure text and versions `[REQ-091]` | Sec 3.S |
The system will implement **technical controls** (feature flags, geo/IP gating hooks, KYC gates, limits, audit, retention jobs, kill-switch) as configurable capabilities; **what** to configure is the client's decision.

---

# 42. DECISIONS REQUIRED BEFORE IMPLEMENTATION

> **These cannot be safely inferred. Implementation of the dependent modules must not begin until the decision is recorded here and in an ADR.** "Blocks" lists what is blocked. Priority: **P0** = blocks core money logic/schema; **P1** = blocks a full module; **P2** = can proceed with default but needs confirmation.

| ID | Decision required | Why it matters | Options / suggested default (**not decided**) | Blocks | Pri |
|---|---|---|---|---|---|
| DR-001 | Trading counterparty model: platform as house vs users vs both | Determines ledger accounts, solvency exposure, regulatory character | House / peer-to-peer / hybrid | Ledger design, spot, futures, binary | P0 |
| DR-002 | Exact spot pricing mechanism ("configured buy/sell mechanism") | Defines core product | CLOB / internal engine / AMM / formula / external / hybrid (Sec 11.3) | Spot, charts | P0 |
| DR-003 | Order matching mechanism & order semantics (limit = resting vs trigger; partial fills; TIF) | Engine architecture | see DR-002 | Spot orders | P0 |
| DR-004 | Supported assets at launch & quote currency | Seed data, markets | Client list | Assets/markets | P1 |
| DR-005 | Supported fiat currencies / wallet base currency(ies) | Ledger units, payments | BDT / USD / multi | Wallet, payments | P0 |
| DR-006 | Fee structure: spot maker/taker, futures, binary, deposit, withdrawal, P2P; fee-at-placement vs at-fill | Revenue & ledger | % / fixed / tiered | All trading | P0 |
| DR-007 | Leverage limits (max, per asset, per user); leverage change rules | Risk | e.g. conservative caps | Futures | P0 |
| DR-008 | Margin model: isolated vs cross; one-way vs hedge; maintenance margin rate | Liquidation math | Isolated+one-way (recommended for MVP) | Futures | P0 |
| DR-009 | Liquidation algorithm; partial liquidation; insurance fund; negative-equity policy | Solvency | Full liquidation at mark + platform loss account | Futures | P0 |
| DR-010 | Mark price source/formula; index price | Fairness, liquidation | Last internal / external index / EMA | Futures | P0 |
| DR-011 | Futures type (perpetual vs dated) and funding-rate rules (not to be confused with "Funding plan") | Ongoing charges | none / perpetual with funding | Futures | P1 |
| DR-012 | Binary payout formula, per-asset/expiry variance | Core economics | fixed % (e.g. r) of stake | Binary | P0 |
| DR-013 | Binary price source, entry price, settlement price/window, tie behavior, feed-outage policy | Integrity/disputes | see 13.3 | Binary | P0 |
| DR-014 | Binary expiry options, min/max stake, cancellation, late-order cutoff, max concurrent | Limits | list | Binary | P1 |
| DR-015 | P2P rules: assets, roles, escrow, payment proof, dispute, timeout, fees, fraud controls | Fund safety | see Sec 22 | P2P | P1 |
| DR-016 | Withdrawal rules: manual vs auto approval, limits, cooling periods, thresholds for dual control | Security | manual-all at MVP (recommended) | Withdrawals | P0 |
| DR-017 | Deposit/withdrawal methods and payout rails; refunds/chargebacks | Payments feasibility | manual payout MVP | Payments, withdrawals | P0 |
| DR-018 | KYC provider, levels, and what each level gates (deposit/withdraw/trade/limits) | Compliance gating | none / tiered | Users, wallet | P1 |
| DR-019 | User trading restrictions & limits; behavior for suspended users' open exposure | Risk | close-only on suspend | Admin, trading | P1 |
| DR-020 | Referral rules: trigger, rate basis, levels, eligibility, timing, caps, reversal | Payouts | % of fees etc. | Referral | P1 |
| DR-021 | Funding plan definition, calculator formula, participation flow, risk/legal model | Undefined product | — | Funding | P1 |
| DR-022 | Leaderboard metric, period, product scope, privacy, refresh | Ranking | PnL / ROI / volume | Leaderboard | P2 |
| DR-023 | Market data provider/contract and mapping to platform-priced assets | Prices | see Sec 15 | Market data, futures, binary | P0 |
| DR-024 | Payment provider selection (SSLCOMMERZ vs Stripe) and merchant approval status | Integration | one provider | Payments | P0 |
| DR-025 | Supported jurisdictions / geo restrictions / blocked countries | Compliance | list | Registration, gating | P1 |
| DR-026 | Roles, permissions, admin hierarchy (Super Admin, Support, Finance) | Security | Sec 4 matrix | Admin, RBAC | P1 |
| DR-027 | Data retention & deletion policy (logs, KYC docs, audit, tickets) | Compliance/cost | — | DB, audit | P2 |
| DR-028 | Notification providers, channels, triggers, mandatory vs optional | Delivery | email+SMS+in-app | Notifications | P2 |
| DR-029 | Demo: starting balance, reset/top-up rules, spot demo?, leaderboard inclusion, same price feed | Demo behavior | — | Demo | P1 |
| DR-030 | "Internal transfer (where applicable)" meaning | Undefined | user-to-user / between sub-wallets / none | Wallet | P1 |
| DR-031 | Listing application: fields, fee, criteria, workflow, outcome (auto-create asset?) | Process | — | Listings | P2 |
| DR-032 | Auth details: identifier(s), mandatory verification, 2FA, profile fields, password policy | UX/security | email+optional phone; 2FA for admin | Auth | P1 |
| DR-033 | UI languages (Bangla/English), currency/locale formatting | UX | EN / BN / both | Frontend | P2 |
| DR-034 | Session/token policy (TTL, device limits) | Security | Sec 19 | Auth | P2 |
| DR-035 | Trading hours/maintenance windows | Ops | 24/7 | Trading | P2 |
| DR-036 | Chart intervals, historical candle source & backfill for platform assets, charting library | UX | 1m…1d | Charts | P2 |
| DR-037 | Meaning of "transaction fee" (deposit/withdrawal/trade/network) | Ledger | — | Wallet | P1 |
| DR-038 | MVP priority (must/should/could) given 6-week schedule | Feasibility | — | Planning | P0 |
| DR-039 | Extra order types (stop, TIF), min sizes, price bands | Engine | limit+market only | Spot | P1 |
| DR-040 | Custody & reserves: where real money sits, reconciliation to bank/provider | Solvency/compliance | — | Finance ops | P0 |
| DR-041 | Manual ledger adjustments by admin allowed? approval flow | Fraud control | dual control | Admin/ledger | P1 |
| DR-042 | Does the wallet hold assets (coins) as well as fiat? (Implied by spot trading) | Ledger design | multi-asset wallet | Wallet | P0 |
| DR-043 | Top gainers/losers window & minimum volume | Display | 24h | Markets | P2 |
| DR-044 | Support ticket categories/SLA; FAQ/announcement authoring workflow | Ops | — | Support | P2 |
| DR-045 | Provider acceptance of futures/binary/trading merchant category | Go/no-go | — | Payments | P0 |
| DR-046 | Backup/RPO/RTO targets, HA expectations | Infra | — | Deployment | P1 |
| DR-047 | Precision & rounding policy per asset; fee rounding | Ledger | Sec 9.2 | Money package | P0 |
| DR-048 | Number of environments (staging?), sandbox credentials | Delivery | dev+staging+prod | DevOps | P2 |

---

# 43. ASSUMPTIONS

| ID | Assumption | Reason | Affected | Risk if incorrect | Status |
|---|---|---|---|---|---|
| ASM-001 | JWT access tokens + rotating opaque refresh tokens | Stack implies SPA+API; auth mechanism unspecified | Auth, WS | Rework of auth/session code | Proposed |
| ASM-002 | Modular monolith + worker binary (not microservices) | 6-week timeline; single-DB consistency | All | Low | Proposed |
| ASM-003 | Gin chosen over Fiber | Standard `net/http` compatibility; proposal allows either | Backend | Low (refactor of transport) | Proposed |
| ASM-004 | Argon2id password hashing | Industry standard | Auth | Low | Proposed |
| ASM-005 | UUID PKs + public prefixed IDs | Auditability, safe exposure | DB | Low | Proposed |
| ASM-006 | `NUMERIC(38,18)` for all money/quantities | Avoid float; wide range | DB, Go | Migration if narrower/wider needed | Proposed |
| ASM-007 | All timestamps UTC, server-authoritative | Expiry/settlement correctness | All | Low | Proposed |
| ASM-008 | Wallet has `available` **and** `locked` balances | Needed for order/margin/withdrawal reservations though only "available" is named | Wallet | Design mismatch | Proposed |
| ASM-009 | One unified real balance shared by spot/futures/binary (no per-product sub-wallets) | Simplicity; "internal transfer where applicable" ambiguous | Wallet | Add sub-wallets later | Proposed |
| ASM-010 | Roles: Guest, User, Support, Finance Operator, Admin, Super Admin, System | Proposal only mentions user/admin | Admin, RBAC | Permission rework | Proposed |
| ASM-011 | Real trading requires `trading_enabled` flag set by admin (default false) | Proposal lists "trading permission" | Users, trading | Onboarding friction | Proposed |
| ASM-012 | Refresh token in HttpOnly cookie | XSS resilience | Auth/FE | CSRF handling changes | Proposed |
| ASM-013 | Workers run as separate process from same codebase | Isolation of financial jobs | Ops | Low | Proposed |
| ASM-014 | Suspended users can log in read-only and close/cancel but not open new exposure | Safer than lockout when funds exist | Users, trading | Policy mismatch (`DR-019`) | Proposed |
| ASM-015 | Transactional outbox for events/notifications | Consistency between DB and events | Events | Low | Proposed |
| ASM-016 | Each user gets one real account and one demo account created at registration | Demo for futures/binary | Accounts | Extra/less accounts | Proposed |
| ASM-017 | Single wallet base currency at launch (TBD) | Simplify | Wallet, payments | Multi-currency refactor | Proposed (`DR-005`) |
| ASM-018 | Transaction statuses `pending, processing, completed, failed, cancelled, reversed` | "Transaction status" requested but values unspecified | Wallet | Label changes | Proposed |
| ASM-019 | Deposit/withdrawal amounts positive, limited by configurable min/max | Basic safety | Wallet | Low | Proposed |
| ASM-020 | KYC states as listed in Sec 20 | Needed for integration boundary | KYC | Low | Proposed |
| ASM-021 | Idempotency keys retained ≥ 24 h | Practical retry window | API | Duplicate risk after window (mitigated by system keys) | Proposed |
| ASM-022 | Rate-limit numbers in Sec 18 are starting values | No proposal values | API | Too strict/loose | Proposed |
| ASM-023 | Notification channels = email, SMS, in-app | SMTP/SMS listed as client services | Notifications | Push requested later | Proposed |
| ASM-024 | Price-stale threshold configurable, default ~10 s | Safety | Market data | False halts / late halts | Proposed |
| ASM-025 | FAQ/legal/announcement content managed via admin (FAQ editing not explicitly listed) | Otherwise static | Admin | Content changes need deploy | Proposed |
| ASM-026 | Withdrawals paid **manually by admin with proof** at MVP | Provider payout support unknown | Withdrawals | Manual workload | Proposed |
| ASM-027 | Referral attribution immutable, single level | Simplicity, fraud reduction | Referral | Multi-level demand | Proposed |
| ASM-028 | Leaderboard excludes demo and suspended users; pseudonymous names | Privacy/fairness | Leaderboard | Product expectation mismatch | Proposed |
| ASM-029 | Redis pub/sub is lossy; WS clients resync via REST | Simplicity | Realtime | Missed transient events | Proposed |
| ASM-030 | Futures formulas in Sec 12.2 are a *starting proposal* pending `DR-007..011` | Nothing in proposal | Futures | Wrong money math if adopted unreviewed | Proposed — **not approved** |
| ASM-031 | Client will accept English identifiers/API/DB naming; UI language per `DR-033` | Engineering norm | All | Low | Proposed |
| ASM-032 | Spot has no demo mode | Proposal lists demo only for futures & binary | Demo | Spot demo requested | Proposed |

---

# 44. ARCHITECTURAL DECISIONS (ADR)

Status values: **Accepted (proposal)** = dictated by the proposal; **Proposed** = awaiting acceptance; add new ADRs to `docs/adr/` and summarize here.

| ID | Decision | Context | Alternatives | Reason | Impact | Status |
|---|---|---|---|---|---|---|
| ADR-001 | Next.js+TS+Tailwind, Go, PostgreSQL, Redis, WebSocket, R2, VPS | Proposal §6 | Any other stack | Contractual stack | Everything | Accepted (proposal) |
| ADR-002 | Go framework: Gin (Fiber allowed by proposal) | Proposal says "Gin / Fiber" | Fiber | Mature, `net/http`-compatible middleware ecosystem | Transport layer only | Proposed |
| ADR-003 | Modular monolith + separate worker binary in one repo | Timeline & consistency | Microservices | Simpler ACID | Deployment | Proposed |
| ADR-004 | Double-entry ledger with append-only journals; balances as guarded projection | `[REQ-061]` auditable ledger | Single mutable balance column | Auditability, reconciliation | Schema, all money code | Proposed (strongly recommended) |
| ADR-005 | Demo isolated in separate PG schema + role + Go types | `[REQ-045..051]` | Flag column on shared tables | Prevent contamination | DB, APIs | Proposed (strongly recommended) |
| ADR-006 | `NUMERIC(38,18)` + shopspring/decimal; decimals as JSON strings | Never floats | integer minor units | Multi-asset flexibility | DB/API | Proposed |
| ADR-007 | JWT (asym) + refresh rotation, HttpOnly cookie for refresh | Security | Server-side sessions only | SPA/WS fit | Auth | Proposed |
| ADR-008 | Transactional outbox + DB-driven financial jobs (`SKIP LOCKED`); Redis only for non-critical queues | Redis non-authoritative | Redis queues for settlement | Durability | Workers | Proposed |
| ADR-009 | Pricing/matching behind interfaces; **no production default until DR-001..003 decided** | Undefined mechanism | Pick model now | Avoid silent invention | Spot/futures/binary | Proposed |
| ADR-010 | Redis never authoritative for money | Loss tolerance | — | Safety | Redis usage | Proposed |
| ADR-011 | REST + OpenAPI contract; generated TS types | Frontend/back alignment | GraphQL | Simplicity | API | Proposed |
| ADR-012 | Payment adapter interface; provider via config | Provider TBD | Hard-code one | Flexibility | Payments | Proposed |
| ADR-013 | Audit rows in same tx for admin/financial actions | Reliability | async audit | No unaudited action | Admin | Proposed |
| ADR-014 | Global real-trading kill-switch (`FEATURE_REAL_TRADING_ENABLED`) | `[REQ-094]` | none | Legal gating | Deployment | Proposed |

---

# 45. GLOSSARY

| Term | Simple explanation |
|---|---|
| Asset / Coin | A tradable item defined on the platform (e.g. a platform-created token or a currency). |
| Market | A place where an asset (or pair) can be traded. |
| Trading pair | Two assets traded against each other (BASE/QUOTE), e.g. ABC/USD: you buy/sell ABC using USD. |
| Order | An instruction to buy or sell. **Market order** = now at available price; **limit order** = only at your price or better. |
| Open order | An order not yet fully filled or cancelled. |
| Trade | An executed fill (result of an order). |
| Position | Your open futures exposure (long or short) in a market. |
| Long / Short | Betting price goes up / down. |
| Leverage | Multiplier letting you control a bigger position with less money (10× = position 10× your margin). |
| Margin | Funds locked as collateral for a leveraged position. Initial margin opens it; maintenance margin keeps it alive. |
| Entry price | Price at which the position opened. |
| Mark price | Reference price used to value positions and trigger liquidation (source undefined). |
| PnL | Profit and loss. Unrealized = open position; realized = after closing. |
| Liquidation | Forced closing of a position when margin no longer covers losses. |
| Binary trade | A yes/no bet on price direction (UP/DOWN) at a fixed expiry time. |
| Expiry | Time a binary trade ends and is judged. |
| Payout | Amount received if a binary trade wins (formula undefined). |
| Settlement | Final calculation & payment of a trade/position outcome. |
| Funding plan | Proposal's product name; undefined (not the same as futures funding rate). |
| Referral | Inviting another user; the inviter may earn a reward. |
| Wallet | User's holdings of balances. |
| Ledger | Permanent record of every money movement (double-entry: each movement has equal debit and credit). |
| Available balance | Money the user can spend right now. |
| Locked balance | Money reserved (open orders, margin, pending withdrawal…) and not spendable. |
| Journal | One balanced group of ledger entries for a single business event. |
| Idempotency | Repeating the same request has the same effect as doing it once. |
| Demo account | Practice account with virtual money (no real money), clearly labelled. |
| Real-money account | Account using real deposited funds. |
| Reconciliation | Checking that our records match reality (ledger vs balances vs payment provider). |
| Webhook / IPN | Server-to-server message from a payment provider announcing payment status. |
| KYC/AML | Identity verification / anti-money-laundering controls. |
| P2P | Peer-to-peer trading directly between users. |

---

# 46. AI AGENT DEVELOPMENT RULES

**Any AI coding agent working on this repository MUST follow these rules.**

1. Read `context.md` before modifying code.
2. Treat `context.md` as the project's primary contextual specification.
3. Never invent an undocumented business rule.
4. Never silently alter a financial rule.
5. Never modify financial calculations without tests.
6. Never modify database schema without considering migrations and existing data.
7. Never expose secrets.
8. Never place authoritative financial state in frontend state.
9. Never trust client-side financial calculations.
10. Server-side validation is authoritative.
11. PostgreSQL is authoritative for persisted financial state.
12. Redis is not an authoritative financial ledger.
13. Financial operations must be atomic and idempotent.
14. Every balance mutation must be auditable.
15. Every sensitive admin operation must be auditable.
16. Real-money and demo environments must remain isolated.
17. Never bypass authorization for convenience.
18. Never disable security checks simply to make a feature work.
19. Do not make broad architectural changes without documenting them.
20. When requirements are ambiguous: **stop**, identify the ambiguity, inspect `context.md`, inspect the existing code, ask for a decision if necessary.
21. Before implementing a feature: identify the domain, relevant entities, APIs, state transitions, financial effects, edge cases, and tests.
22. Before changing an existing feature: understand current behavior, identify dependencies, check affected modules, preserve backward compatibility unless explicitly instructed otherwise.
23. Do not put unnecessary business logic into UI rendering.
24. Keep business logic in dedicated services/use-cases/domain modules.
25. Keep reusable hooks, models, enums, utilities and shared functions in appropriate dedicated modules.
26. Prefer strong typing.
27. Use enums/constants for fixed option sets instead of arbitrary strings where appropriate.
28. Functions should have sensible default handling and explicitly handle null/undefined/error cases.
29. Avoid deeply nested conditional logic; use clear strategies/state machines/switch statements.
30. Keep API contracts explicit (OpenAPI is the source of truth).
31. Add tests for every critical business rule.
32. Update documentation whenever architecture or business behavior changes.
33. Never declare a feature "complete" solely because the code compiles.
34. A feature is complete only when: implementation exists, validation exists, error handling exists, tests exist, security has been considered, relevant documentation is updated.

**Additional project-specific rules (derived from this analysis):**
35. Do not implement any module listed as blocked in Sec 42 (`DR-*`) beyond interfaces/stubs; do not "pick a sensible default" for P0 items.
36. Only `internal/ledger` may write `journals`, `ledger_entries`, `wallet_balances`. Reject changes that do otherwise.
37. Demo code must never import real-ledger packages or use the real DB role (Sec 14).
38. Tag every new rule you add to this file with `[REQ] [TD] [ASM] [DR] [REC] [IMPL]`, and never present a non-`REQ` item as a proposal fact.
39. Never treat a payment redirect/frontend callback as proof of payment.
40. Money values are decimals (strings in JSON); no `float32/float64` for money anywhere.
41. The disclaimer text of `REQ-051` must be preserved verbatim in the UI on all demo views.
42. Keep `FEATURE_REAL_TRADING_ENABLED=false` by default in every non-approved environment.

---

# 47. CODING STANDARDS

### 47.1 Frontend (TypeScript / Next.js / React / Tailwind)
| Topic | Standard |
|---|---|
| TS config | `strict: true`, `noUncheckedIndexedAccess`; no `any` (use `unknown` + parsing). |
| Naming | Components `PascalCase`; hooks `useXxx`; functions/vars `camelCase`; constants `UPPER_SNAKE`; types/interfaces `PascalCase`; enums as `const` objects or TS enums in `enums/`. |
| Files | Components `PascalCase.tsx`; others `kebab-case.ts`; one main export per file; tests `*.test.ts(x)`. |
| Structure | `features/<domain>/{components,hooks,api,schemas,types,utils}`; shared UI in `components/ui`; pages thin (compose features). |
| Data | React Query (server state); Zustand/Context only for UI state; **never store authoritative balances**; validate API responses with Zod against generated types. |
| Money | Decimal strings; use `decimal.js` for display math only; formatting helpers in `lib/format`. |
| Forms | react-hook-form + Zod; server errors mapped by `error.code`. |
| Errors | Error boundaries per route; user-safe messages; no raw server text. |
| Styling | Tailwind utility classes; design tokens in config; dark theme default; responsive mobile-first; accessible (labels, focus). |
| API client | Single typed client, attaches auth + `Idempotency-Key` on money POSTs, `X-Request-ID`. |
| Security | No `dangerouslySetInnerHTML` unsanitized; no secrets in `NEXT_PUBLIC_*`. |
| Imports | Absolute (`@/`), no cross-feature deep imports (use feature `index.ts`). |
| Testing | Vitest/RTL, Playwright E2E. |
| Lint | ESLint + Prettier, CI-enforced. |

### 47.2 Backend (Go / Gin / PostgreSQL / Redis)
| Topic | Standard |
|---|---|
| Layout | Sec 7.1; `internal/<domain>/{domain,service,repo,transport,events}`. |
| Naming | Go idioms: `MixedCaps`, short receivers, packages lowercase singular; files `snake_case.go`. |
| Layers | transport → service (use-case, owns `tx`) → domain (pure) / repo (SQL); domain has no I/O; services take interfaces. |
| Errors | Typed domain errors mapped to API codes (Sec 32); wrap with `%w`; no panics in request paths; no string matching on errors. |
| Context | `context.Context` first param; deadlines on all outbound calls/DB. |
| DB | `pgx`/`sqlc` (typed queries); explicit `tx` boundaries in services; never SQL string concat; `FOR UPDATE` order documented. |
| Money | `decimal.Decimal` only; central `money` package for quantize/round/fee; ban `float64` via linter for money packages. |
| Config | Single typed config loaded from env; fail fast on missing required. |
| Logging | `slog` structured; no secrets; include `request_id`. |
| API responses | Envelope of Sec 18; consistent codes; OpenAPI updated in same PR. |
| Redis | Wrapper with key builders and TTLs; no business truth. |
| Concurrency | Prefer DB constraints over in-process locks; goroutines with `errgroup`; graceful shutdown. |
| Testing | Table-driven tests; `-race`; integration with real PG; golden vectors for money. |
| Lint/CI | `golangci-lint`, `govulncheck`, `gosec`. |
| Imports | Std / third-party / internal grouping; no import cycles; domains depend on `platform` and other domains only via interfaces. |

---

# 48. CHANGE MANAGEMENT

Every substantial change (PR/ADR) must answer:

| Question | Content |
|---|---|
| **WHY?** | Requirement/`REQ-ID`, `DR-ID`, or bug reference |
| **WHAT?** | Behavior change summary |
| **WHERE?** | Modules/tables/endpoints/UI |
| **IMPACT?** | Users, money flows, other modules, backward compatibility |
| **RISKS?** | Financial, security, data integrity |
| **TESTS?** | New/updated tests incl. vectors; invariants touched |
| **MIGRATION?** | Schema/data migration + rollback/forward-fix plan |
| **DOCUMENTATION?** | `context.md` sections, OpenAPI, runbooks updated |

**Rules:** (1) Any change to architecture or a business/financial rule **must update `context.md` in the same PR** (tag correctly; move items between `DR`/`ASM`/`REQ` only with client evidence). (2) Resolved `DR-*` items are marked *Resolved* with date, decision, approver, and a matching ADR. (3) Money-touching changes need two reviewers. (4) Warranty boundary: new features, major redesigns, third-party charges, and major trading-system changes are outside free support `[REQ-089]` and go through a quoted change request; minor revisions in agreed scope fall under the 1-month revision window `[REQ-088]`. (5) Keep a `CHANGELOG` and document version at top of this file.

---

# 49. IMPLEMENTATION ORDER

Derived from dependencies (not just the proposal's weekly list). Each step's *why*:

| # | Step | Why here |
|---|---|---|
| 0 | **Decision gate**: resolve P0 `DR` items or agree interfaces-only (`DR-001..003, 005, 006, 012, 013, 016, 017, 023, 024, 038, 040, 042, 045, 047`) | Money schema and engines can't be safely built otherwise. |
| 1 | Repo/bootstrap (monorepo, CI, config, lint) | Everything builds on it. |
| 2 | Infrastructure & environments (dev/staging, PG, Redis, secrets) | Need real PG features (locks, triggers). |
| 3 | Database foundation + migrations + money package | Types/constraints are hard to change later. |
| 4 | Auth + Users + RBAC skeleton + audit skeleton + idempotency framework | Every later endpoint uses them. |
| 5 | **Ledger + Wallet** (+ reconciliation checks) | All money features depend on it; highest risk → earliest and most-tested. |
| 6 | Assets & Markets (+ admin config versions) | Trading needs catalog. |
| 7 | Market data + pricing interfaces + WebSocket/realtime + Redis | Prices are inputs to spot/futures/binary and UI. |
| 8 | Payments (sandbox) → Deposits → Withdrawals | Needed to test real-money flows end-to-end; long external lead time, so start integration early even though the proposal lists it in weeks 5–6. |
| 9 | Spot engine (after `DR-002/003`) | First trading product; validates ledger reservations. |
| 10 | Demo infrastructure (schema, role, types) | Must exist **before** futures/binary so they're built demo-aware, not retrofitted. |
| 11 | Futures (margin, PnL, liquidation worker) | Builds on ledger + mark price. |
| 12 | Binary (settlement worker) | Builds on ledger + price source. |
| 13 | Notifications | Consumes events from above. |
| 14 | Admin panel (grown incrementally alongside each domain; completed here) | Depends on domain use-cases. |
| 15 | Referral, Funding, Leaderboard | Depend on trades/ledger; low coupling. |
| 16 | Listings, P2P | Lowest priority/risk-heavy; after core. |
| 17 | Support, FAQ, announcements, legal pages (can be parallel from step 4) | Independent content modules. |
| 18 | Hardening: testing (E2E, load, concurrency), security review/pentest, performance | Before go-live. |
| 19 | Deployment, backups/restore drill, monitoring, runbooks | Production readiness. |
| 20 | Launch gate: legal/compliance sign-off, kill-switch flip by client | `[REQ-094]`. |

---

# 50. REQUIREMENT COVERAGE CHECK

Second pass against the PDF (all 7 pages re-read). "Covered" = the requirement is documented **in this file**; where the proposal itself is silent on behavior, status is "Covered — behavior undefined (DR-x)" — i.e., the *requirement* is captured and the *gap* is flagged, not silently filled.

| Requirement | Source | Context Section | Status |
|---|---|---|---|
| Real-money, dark-theme, responsive, professional UI | P2 §1 (REQ-001) | Sec 1.2, 2, 3.A, 47.1 | Covered |
| Centralized, no blockchain | P2 §1, P7 (REQ-002) | Sec 1.2, 2, 6 | Covered |
| Platform assets, fixed initial price, price via buy/sell mechanism | P2 §1 (REQ-003) | Sec 1.2, 11 | Covered — mechanism undefined (DR-002) |
| Homepage | P2 §2 (REQ-004) | 3.A | Covered |
| Registration & login | P2 §2 (REQ-005) | 3.B, 5 (#1,3), 19 | Covered |
| User dashboard / profile | P2 §2 (REQ-006/007) | 3.C, 5 | Covered |
| Email/phone verification support | P2 §2 (REQ-008) | 3.B, 5 (#2), 19 | Covered — mandatory-ness undefined (DR-032) |
| Password management | P2 §2 (REQ-009) | 5 (#4), 19 | Covered |
| Account security | P2 §2 (REQ-010) | 19 | Covered — scope undefined (DR-032) |
| Notifications | P2 §2 (REQ-011) | 29 | Covered — triggers/channels DR-028 |
| Asset/coin creation, configurable initial price | P2 §2 (REQ-012/013) | 11, 26, 27 | Covered |
| Buy/sell, dynamic price, live price | P2 §2 (REQ-014..016) | 11, 15, 16 | Covered — mechanism DR-002 |
| Trading chart | P2 §2 (REQ-017) | 11, 15 | Covered — intervals DR-036 |
| Trading pairs | P2 §2 (REQ-018) | 9, 11, 26 | Covered |
| Market & limit orders, open orders, order/trade history | P2 §2 (REQ-019..022) | 5, 11, 18, 30 | Covered — semantics DR-003 |
| Trading fee | P2 §2 (REQ-023) | 9.2, 26 | Covered — structure DR-006 |
| Market overview, top gainers/losers | P2 §2 (REQ-024/025) | 11, 15, 18 | Covered — window DR-043 |
| Futures: long/short, leverage, margin | P2 §2 (REQ-026..028) | 12 | Covered — DR-007/008 |
| Futures: entry/mark price, PnL, liquidation | P2 §2 (REQ-029..032) | 12 | Covered — formulas DR-009/010 (proposed only as ASM-030) |
| Open position, position & order history | P2 §2 (REQ-033..035) | 12, 18 | Covered |
| Binary: asset, UP/DOWN, amount, expiry, countdown | P3 §2 (REQ-036..040) | 13 | Covered |
| Binary: potential payout, active/completed, win-loss history | P3 §2 (REQ-041..044) | 13 | Covered — formula DR-012/013 |
| Demo trading (futures & binary), virtual balance/PnL/liquidation/history | P3 §2 (REQ-045..050) | 14 | Covered — DR-029 |
| Demo disclaimer text | P3 §2 (REQ-051) | 14, 46 (#41) | Covered |
| Wallet, available balance | P3 §3 (REQ-052/053) | 10 | Covered |
| Deposit | P3 §3 (REQ-054) | 10, 21 | Covered |
| Withdrawal request | P3 §3 (REQ-055) | 10, 5 (#8), 27 | Covered — rules DR-016/017 |
| Internal transfer (where applicable) | P3 §3 (REQ-056) | 10.3 | Covered — meaning undefined (DR-030) |
| Transaction history/ID/fee/status | P3 §3 (REQ-057..060) | 9.4, 10.6, 30 | Covered — fee DR-037 |
| Auditable ledger records | P3 §3 (REQ-061) | 9, 10, 28, 31 | Covered |
| Funding plan & calculator | P3 §4 (REQ-062/063) | 23 | Covered — product undefined (DR-021) |
| Referral program & earnings | P3 §4 (REQ-064/065) | 24 | Covered — DR-020 |
| Top traders / leaderboard | P3 §4 (REQ-066) | 25 | Covered — DR-022 |
| Coin/asset listing application | P3 §4 (REQ-067) | 3.M, 5 (#30), 30 | Covered — DR-031 |
| Markets page | P3 §4 (REQ-068) | 3.E/3.I, 18 | Covered |
| Basic P2P marketplace | P3 §4 (REQ-069) | 22, 30 | Covered — rules DR-015 |
| Support/ticket system | P3 §4 (REQ-070) | 3.P, 5 (#32), 30 | Covered |
| FAQ, announcements | P3 §4 (REQ-071/072) | 3.Q/R, 18 | Covered |
| T&C, Privacy Policy, Risk Disclosure | P3 §4, P6 §10 (REQ-073..075, 091) | 3.S, 41 | Covered (content client-provided) |
| Admin: users, status, trading permission | P4 §5 (REQ-076) | 27, 4 | Covered |
| Admin: assets, initial price, markets/pairs, fees | P4 §5 (REQ-077) | 26, 27 | Covered |
| Admin: futures settings, leverage, binary settings | P4 §5 (REQ-078) | 26, 27 | Covered |
| Admin: funding, referral rate, leaderboard, listings | P4 §5 (REQ-079) | 27 | Covered |
| Admin: deposits, withdrawals, P2P, transactions | P4 §5 (REQ-080) | 27 | Covered |
| Admin: announcements, platform settings, basic activity log | P4 §5 (REQ-081) | 27, 28 | Covered (audit strengthened as REC) |
| Configurable business settings where possible | P4 §5 (REQ-082) | 26 | Covered |
| Technology stack | P4 §6 (REQ-083) | 6, 7, ADR-001 | Covered |
| 6-week timeline & week scopes | P1, P4–P5 §7 (REQ-084) | 39 | Covered |
| Client-provided third-party services | P5 §8 (REQ-085) | 1.2, 6, 37, 38 | Covered |
| Payment provider (SSLCOMMERZ/Stripe), scope of one integration | P5 §8 (REQ-086) | 21, 38 | Covered — DR-024/045 |
| 24/7 support channel | P1, P5 §9 (REQ-087) | 33, 48 | Covered (operational; no in-app build) |
| 1-month free revision | P1, P5 §9 (REQ-088) | 48 | Covered |
| 1-year free support & bug fixes (scope limits) | P1, P5–P6 §9 (REQ-089) | 48, 40 | Covered |
| Post-support monthly service | P6 §9 (REQ-090) | 33, 37, 48 | Covered |
| Client responsibilities | P6 §10 (REQ-091) | 1.2, 37, 39, 41 | Covered |
| Delay clause | P6 §10 (REQ-092) | 39, 40 | Covered |
| Legal/compliance = client responsibility; public launch gating | P6 §11 (REQ-093/094) | 41, 37, 46 (#42) | Covered |
| Deliverables incl. source code, DB, production deployment | P6–P7 §12 (REQ-095) | 7, 37, 39 | Covered |
| MVP production release | P7 (REQ-096) | Glance, 39 | Covered — MVP contents to be agreed (DR-038) |
| KYC/AML service (client-provided) | P5 §8 | 20, 41 | Covered — levels/gating DR-018 |
| Market data API (client-provided) | P5 §8, P6 §10 | 15 | Covered — contract DR-023 |

**Honest limitations of this analysis:** (1) The PDF is 7 pages of text with no images/diagrams; all content was read from extracted text and cross-checked page by page. (2) Page numbers cited are PDF pages `P1–P7`; the proposal's own sections are `§1–§12`. (3) Every item flagged `Covered — … DR-x` is documented as a *requirement with an explicit gap*, not as a finished specification of behavior. (4) All formulas, values and thresholds in this file that are not tagged `[REQ]` are illustrative or proposed and **must not be implemented as facts** until approved.

*— End of context.md —*
