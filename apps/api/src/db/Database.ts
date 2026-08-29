import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Context, Effect, Layer } from "effect";
import { PgClientLive } from "./PgClientLive";

const make = PgDrizzle.makeWithDefaults();

/**
 * The drizzle-orm Effect Postgres database, wrapped as an Effect service.
 *
 * `makeWithDefaults` provides no-op `EffectLogger` / `EffectCache`; `PgClientLive`
 * supplies the `PgClient`, so the layer is self-contained.
 */
export class Database extends Context.Service<Database, Effect.Success<typeof make>>()(
  "api/Database",
) {
  static readonly layer = Layer.effect(Database, make).pipe(Layer.provide(PgClientLive));
}
