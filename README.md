<img src="public/logo.svg" alt="" width="96" height="96" />

# OpenAlfredTask

A small task manager with projects, tasks, due dates and a "Today" view. It is built with Next.js,
Prisma and PostgreSQL. Sign-in is email and password, handled by
[Better Auth](https://www.better-auth.com).

OpenAlfred is based on [OpenTask](https://github.com/flsilva/opentask) by Flavio Silva (MIT
license). The original runs on Supabase. OpenAlfred only needs PostgreSQL, so the whole thing
fits into one `docker compose` file.

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

The Compose project, the database and its user keep the name `opentask` from the original project,
so existing installs keep their data.

## MCP server

OpenAlfred has a [Model Context Protocol](https://modelcontextprotocol.io) server at `/api/mcp`,
so an AI assistant such as Claude Code can read and change your projects and tasks.

1. Sign in, open **Settings** and create an API token under "API tokens". It's shown only once.
2. Add the server to your client. For Claude Code:

   ```bash
   claude mcp add --transport http openalfred https://<your-host>/api/mcp --header "Authorization: Bearer <token>"
   ```

The tools are `list_projects`, `create_project`, `update_project`, `list_tasks`, `get_task`,
`create_task`, `update_task`, `complete_task` and `delete_task`. Dates are calendar days
(`YYYY-MM-DD`) in the time zone of your account. Projects can be archived but not deleted. A token has
the same access as your account, so keep it secret and revoke it in Settings when you no longer need it.

The endpoint is stateless Streamable HTTP and serves the 2025 and 2026 revisions of the protocol.
Clients that connect from the cloud, such as claude.ai, can't reach a server that is only available
over a VPN. See [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md) for the details.

## Differences from upstream

- Better Auth with email and password replaces Supabase Auth. There is no OAuth or magic link.
- Prisma talks to a plain PostgreSQL. The `User`, `Session`, `Account` and `Verification` tables belong
  to Better Auth.
- An MCP server with personal API tokens, see above.
- A redesigned interface with a sidebar and dark mode.
- No Google Analytics and no marketing pages: `/` opens the app.

## License

MIT, see [LICENSE](LICENSE). Copyright (c) Flavio Silva (OpenTask) and Oko-Tester (OpenAlfred).
