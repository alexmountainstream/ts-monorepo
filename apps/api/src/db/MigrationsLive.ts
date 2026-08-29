import { migrate } from "drizzle-orm/effect-postgres/migrator";
import { Effect, Layer } from "effect";
import { resolve } from "node:path";
import { Database } from "./Database";

/**
 * Applies pending drizzle-kit migrations on startup so `docker compose up` +
 * `pnpm --filter api dev` works with no manual migrate step.
 *
 * Resolved from the working directory (`apps/api`), which is where both `dev`
 * and `start` run. `pnpm --filter api db:migrate` is the explicit path for CI.
 */
const migrationsFolder = resolve(process.cwd(), "drizzle");

export const MigrationsLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const db = yield* Database;
    yield* migrate(db, { migrationsFolder }).pipe(Effect.orDie);
  }),
);
