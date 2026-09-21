# Deploying void2empire to a VPS

Single VPS, Docker Compose, Caddy terminating TLS. Frontend and backend are
served from one hostname, so the auth cookie is same-origin and CORS never
applies to browser traffic.

```
                    :443
  internet ──> Caddy ──┬── /api/*  ──> backend  (Go, :8080)
                       └── /*      ──> frontend (Next.js, :3000)

  backend ──> postgres:5432   (internal network only, no published port)
  backend ──> redis:6379      (internal network only, no published port)
```

## Requirements

Hostinger's Premium/Business **shared** hosting cannot run this stack: no root,
no Docker, no PostgreSQL, and no way to keep a compiled binary listening on a
port. A VPS is a separate product, not an upgrade of a shared plan.

- Ubuntu 24.04 or newer, 2 vCPU
- **4 GB RAM minimum** if you build on the server. `next build` alone peaks
  around 1.5–2 GB and will be OOM-killed on a 2 GB box. Build in CI and pull
  images instead, and 2 GB is enough.
- 50 GB disk
- Region close to your users (Singapore or Mumbai for South Asia)

## 1. Provision and harden

```bash
# as root, on first login
adduser deploy && usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
apt update && apt upgrade -y && apt install -y fail2ban
systemctl enable --now fail2ban
```

Editing `/etc/ssh/sshd_config` directly is not enough on Hostinger's image:
it Includes `sshd_config.d/*` at the top, `50-cloud-init.conf` there sets
`PasswordAuthentication yes`, and sshd keeps the **first** value it reads for
a keyword. The override has to sort ahead of it:

```bash
sudo tee /etc/ssh/sshd_config.d/01-hardening.conf >/dev/null <<'CONF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
CONF
sudo sshd -t && sudo systemctl restart ssh
sudo sshd -T | grep -E '^(permitrootlogin|passwordauthentication) '
```

Confirm you can log in as `deploy` **before** closing the root session. The
`deploy` account has no password, so give it `NOPASSWD` sudo via
`/etc/sudoers.d/90-deploy` or sudo will be unusable.

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy   # log out and back in
```

## 3. DNS

The app is served from the apex, `void2empire.com`. Its A record already
points at the VPS; `www` stays on Hostinger's shared hosting, so the
WordPress site remains reachable there.

| Type | Name | Value        | TTL |
| ---- | ---- | ------------ | --- |
| A    | @    | 187.7.17.199 | 300 |

Caddy needs the record to resolve, and port 80 reachable, to complete the
ACME HTTP challenge.

```bash
dig +short void2empire.com
```

Because the apex is the live domain, there is no staging step: the first
successful `docker compose up` puts the app in front of real visitors. Back
up the WordPress site before starting.

## 4. Clone and configure

```bash
git clone git@github.com:hakalukidev/Void2Empire.git /opt/void2empire
cd /opt/void2empire
cp .env.production.example .env
```

Fill in `.env`. Generate real secrets — do not reuse the development values:

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -base64 32   # POSTGRES_PASSWORD
openssl rand -base64 32   # REDIS_PASSWORD
```

`.env` is gitignored. Keep it that way; it holds the signing key for every
session token the platform issues.

## 5. Launch

```bash
docker compose up -d --build
docker compose ps          # all services healthy?
docker compose logs -f caddy
```

Caddy requests the certificate on first boot. `APP_DOMAIN` is read by both
Caddy and the frontend build, so changing the domain requires a rebuild:
`docker compose up -d --build frontend`.

## 6. Verify

```bash
D=https://void2empire.com
E="check+$(date +%s)@example.com"
P='SomeStr0ng!Pass'

curl -s $D/api/health

curl -s -c /tmp/j -X POST $D/api/auth/register \
  -H 'Content-Type: application/json' \
  -d "{\"fullName\":\"Check\",\"email\":\"$E\",\"country\":\"BD\",\"phone\":\"+8801700000000\",\"password\":\"$P\"}"

curl -s -b /tmp/j $D/api/auth/me            # the user
curl -s $D/api/auth/me                      # 401
curl -s -b /tmp/j -c /tmp/j -X POST $D/api/auth/logout
curl -s -b /tmp/j $D/api/auth/me            # 401 again
```

`-c` on the logout call matters: without it curl never stores the expired
cookie the server sends back, keeps replaying the old one, and `/me` answers
200 as though logout had failed.

Note that the token is a stateless JWT. Logout clears the cookie, but a token
captured beforehand stays valid until it expires seven days later; revoking
one early would need a deny list in Redis.

Check that the `Set-Cookie` on register carries `Secure` as well as
`HttpOnly` — that only happens when `APP_ENV=production`, which the compose
file sets.

Then delete the check user:

```bash
docker compose exec postgres \
  psql -U void2empire -d void2empire -c "delete from users where email like 'check+%@example.com';"
```

## 7. Backups and housekeeping

Already in place on the VPS:

- `/etc/cron.daily/v2e-backup` — nightly `pg_dump`, gzipped into
  `/var/backups/void2empire/`, 14 days retained. Writes to `.part` and
  renames, so a dump interrupted halfway never looks complete.
- `/etc/docker/daemon.json` — `json-file` logs capped at 10 MB x 3 per
  container. Log options apply at container creation, so changing them needs
  `docker compose up -d --force-recreate`, not just a daemon restart.
- `unattended-upgrades` for security patches, `fail2ban` on the sshd jail.

Copy the dumps off the box as well — a VPS snapshot taken by the provider is
not a substitute for a dump you can restore selectively. Test a restore once
before you have real users.

<details>
<summary>The backup script, for reference</summary>

Compose keeps data in the `pgdata` volume, which survives
`docker compose down` but not `down -v`. The installed script:

```bash
# /etc/cron.daily/v2e-backup  (chmod +x)
#!/bin/sh
set -e
cd /opt/void2empire
mkdir -p /var/backups/void2empire
docker compose exec -T postgres pg_dump -U void2empire void2empire \
  | gzip > /var/backups/void2empire/$(date +%F).sql.gz
find /var/backups/void2empire -name '*.sql.gz' -mtime +14 -delete
```

</details>

## Updating

```bash
cd /opt/void2empire
git pull
docker compose up -d --build
```

Migrations under `backend/internal/database/migrations` are embedded in the
binary and applied on startup, in filename order, once each. Adding a
migration needs no separate step.

## The www hostname

`www.void2empire.com` still resolves to Hostinger's CDN and serves the
WordPress site. To fold it into the app instead, add it to the Caddy site
block as `void2empire.com, www.void2empire.com` and repoint the `www` CNAME
at the VPS. Back up WordPress first — that takes the old site offline.

## Notes

- Postgres and Redis publish no host ports; they are reachable only on the
  compose network. Do not add a `ports:` mapping for them.
- `/ws*` is proxied to the backend already, but no WebSocket handler exists
  yet, so it will 404 until one is added.
- The frontend has its own `/api/health` route. Caddy sends `/api/*` to the
  backend, so that route is only reachable inside the container, where the
  healthcheck uses it.
- `NEXT_PUBLIC_*` variables are inlined at build time. Setting them at
  runtime has no effect; they are build args in `frontend/Dockerfile`.
