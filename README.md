# ts-monorepo

An [Effect](https://effect.website)-based TypeScript monorepo (pnpm workspaces).

| Package | Description |
| --- | --- |
| `apps/api` | HTTP API for a Todo app. Effect `HttpApi` server, Postgres persistence via [drizzle-orm](https://orm.drizzle.team) (`drizzle-orm/effect-postgres` + `@effect/sql-pg`). |
| `apps/web` | Vite + React client. |
| `apps/mobile` | Mobile client. |
| `packages/domain` | Shared domain model and the `HttpApi` contract (`@ts-monorepo/domain`). |
| `repos/` | Read-only vendored copies of `effect` and `drizzle-orm`, kept in sync via `git subtree`. Reference material only — never import from here. See [CLAUDE.md](./CLAUDE.md). |

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | ≥ 22 LTS | Nothing is pinned; currently developed on 26.x. |
| pnpm | 11.x | `package.json` sets `packageManager`, so `corepack enable` picks the exact version. |
| Docker + Compose | recent | Runs Postgres for the API. Your user must be able to reach the Docker daemon. |

## Quick start

```bash
pnpm install          # also runs the `prepare` patch step
docker compose up -d  # Postgres on :5432 (todo / todo / todo)
pnpm dev              # starts every app's dev server in parallel
```

- API → http://localhost:3000 (docs at `/docs`)
- Web → http://localhost:5173

The API applies pending database migrations (`apps/api/drizzle/`) automatically on
startup, so there is no manual DB setup step.

### Configuration

Everything has a working default for local development:

| Variable | Default | Used by |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://todo:todo@localhost:5432/todo` | `apps/api` |
| `PORT` | `3000` | `apps/api` |
| `VITE_API_URL` | `http://localhost:3000` | `apps/web` |

## Common commands

Run from the repo root:

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server of every app under `apps/*` in parallel. |
| `pnpm typecheck` | Type-check every workspace package. |
| `pnpm lint` | Lint every workspace package (oxlint). |
| `pnpm format` | Format every workspace package (oxfmt). |
| `pnpm build` | Build every workspace package. |

Database tasks (from `apps/api`, or `pnpm --filter api <script>`):

| Command | Description |
| --- | --- |
| `pnpm db:generate` | Generate a new migration from `src/db/schema.ts`. |
| `pnpm db:migrate` | Apply pending migrations (CI / production path). |
| `pnpm db:studio` | Open Drizzle Studio → https://local.drizzle.studio |

Stop Postgres with `docker compose down` (add `-v` to wipe the data volume).

## Notes

- **Vendored repos** (`repos/`) are managed with `git subtree`, not submodules — a
  plain `git clone` pulls everything.
- **drizzle-orm version**: pinned to the `1.0.0-rc.5-169397b` prerelease. The clean
  `1.0.0-rc.4` release is incompatible with this repo's `effect@4.0.0-rc.112`. When
  bumping the Effect RC, re-check `drizzle-orm` / `drizzle-kit` and re-vendor
  `repos/drizzle-orm` to the matching commit.
