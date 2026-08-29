import { PgClient } from "@effect/sql-pg";
import { Config, Redacted } from "effect";

/**
 * Postgres connection, read from `DATABASE_URL`. Defaults to the local
 * docker-compose database so `pnpm --filter api dev` works with no env setup.
 */
export const PgClientLive = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL").pipe(
    Config.withDefault(Redacted.make("postgres://todo:todo@localhost:5432/todo")),
  ),
});
