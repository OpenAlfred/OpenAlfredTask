# OpenTask

A small task manager with projects, tasks, due dates and a "Today" view. It is built with Next.js,
Prisma and PostgreSQL. Sign-in is email and password, handled by
[Better Auth](https://www.better-auth.com).

This is a self-hosted fork of [flsilva/opentask](https://github.com/flsilva/opentask) (MIT license).
The original runs on Supabase. This fork only needs PostgreSQL, so the whole thing fits into one
`docker compose` file.

## Quick start with Docker

```bash
cp .env.example .env
# Fill in POSTGRES_PASSWORD (openssl rand -hex 24) and BETTER_AUTH_SECRET (openssl rand -base64 32).
docker compose up -d --build
```

Open <http://localhost:3000>, create an account, then set `DISABLE_SIGNUP=true` in `.env` and run
`docker compose up -d` again to close registration.

Running it on a server behind WireGuard, HTTPS, backups and updates are covered in
[docs/SELF_HOSTING.md](docs/SELF_HOSTING.md) (in German).

## Develop locally

You need Node.js 22.19.0 (see `.nvmrc`) and Docker for the database.

```bash
nvm use
npm install
cp .env.example .env     # fill in POSTGRES_PASSWORD and BETTER_AUTH_SECRET,
                         # and use the same password in DATABASE_URL
docker compose up -d db  # PostgreSQL on 127.0.0.1:5432
npx prisma migrate deploy
npm run dev
```

Open <http://localhost:3000>. `npm run build` needs no environment variables.

## Configuration

Everything is read from `.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for `npm run dev` and the Prisma CLI. Docker Compose builds its own for the containers. |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Credentials of the database container. |
| `DB_PORT` | Host port of the database, bound to `127.0.0.1` only. |
| `BETTER_AUTH_URL` | The URL you open the app with, including scheme and port. |
| `BETTER_AUTH_SECRET` | Signs sessions. At least 32 characters. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | More origins that may use the app, comma-separated. Optional. |
| `DISABLE_SIGNUP` | `true` closes registration. |
| `APP_BIND`, `APP_PORT` | Host address and port of the app. |
| `CADDY_BIND`, `CADDY_HTTP_PORT`, `CADDY_HTTPS_PORT`, `APP_DOMAIN` | Only for `docker compose --profile https`. |

## Differences from upstream

- Better Auth with email and password replaces Supabase Auth. There is no OAuth or magic link.
- Prisma talks to a plain PostgreSQL. The `User`, `Session`, `Account` and `Verification` tables belong
  to Better Auth.
- No Google Analytics, and the marketing landing page redirects to the app.
- The `privacy` and `terms` pages still describe the upstream hosted service. Don't rely on them.

## License

MIT, see [LICENSE](LICENSE). Copyright (c) Flavio Silva.
