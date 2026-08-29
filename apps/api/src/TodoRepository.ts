import { eq } from "drizzle-orm";
import { Context, DateTime, Effect, Layer, Schema, Array, Option } from "effect";
import {
  type CreateTodoInput,
  Todo,
  TodoId,
  TodoNotFoundError,
  type UpdateTodoInput,
} from "@ts-monorepo/domain";
import { Database } from "./db/Database";
import { todos } from "./db/schema";

export class TodoRepository extends Context.Service<
  TodoRepository,
  {
    readonly list: Effect.Effect<ReadonlyArray<Todo>>;
    readonly findById: (id: TodoId) => Effect.Effect<Todo, TodoNotFoundError>;
    readonly create: (input: CreateTodoInput) => Effect.Effect<Todo>;
    readonly update: (id: TodoId, input: UpdateTodoInput) => Effect.Effect<Todo, TodoNotFoundError>;
    readonly remove: (id: TodoId) => Effect.Effect<void, TodoNotFoundError>;
  }
>()("api/TodoRepository") {
  static readonly layer = Layer.effect(
    TodoRepository,
    Effect.gen(function* () {
      const db = yield* Database;

      const list = db
        .select()
        .from(todos)
        .pipe(
          Effect.flatMap(Schema.decodeUnknownEffect(Schema.Array(Todo))),
          Effect.orDie,
        );

      const findById = Effect.fn("TodoRepository.findById")(function* (id: TodoId) {
        const result = yield* db
          .select()
          .from(todos)
          .where(eq(todos.id, id))
          .pipe(
            Effect.map(Array.head),
            Effect.orDie
          );

        return yield* Option.match(result, {
          onNone: () => Effect.fail(new TodoNotFoundError({ id })),
          onSome: (row) => Schema.decodeUnknownEffect(Todo)(row).pipe(Effect.orDie),
        });
      });

      const create = Effect.fn("TodoRepository.create")(function* (input: CreateTodoInput) {
        const now = yield* DateTime.nowAsDate;
        const todo = yield* db
          .insert(todos)
          .values({ title: input.title, completed: false, createdAt: now, updatedAt: now })
          .returning()
          .pipe(
            Effect.map(Array.head),
            Effect.orDie
          );
        return yield* Option.match(todo, {
          onNone: () => Effect.die(new Error("Failed to create todo")),
          onSome: (row) => Schema.decodeUnknownEffect(Todo)(row).pipe(Effect.orDie),
        });
      });

      const update = Effect.fn("TodoRepository.update")(function* (
        id: TodoId,
        input: UpdateTodoInput,
      ) {
        const now = yield* DateTime.nowAsDate;
        const patch: Partial<typeof todos.$inferInsert> = { updatedAt: now };
        if (input.title !== undefined) {
          patch.title = input.title;
        }
        if (input.completed !== undefined) {
          patch.completed = input.completed;
        }

        const todo = yield* db
          .update(todos)
          .set(patch)
          .where(eq(todos.id, id))
          .returning()
          .pipe(
            Effect.map(Array.head),
            Effect.orDie
          );

        return yield* Option.match(todo, {
          onNone: () => Effect.fail(new TodoNotFoundError({ id })),
          onSome: (row) => Schema.decodeUnknownEffect(Todo)(row).pipe(Effect.orDie),
        });
      });

      const remove = Effect.fn("TodoRepository.remove")(function* (id: TodoId) {
        const todo = yield* db
          .delete(todos)
          .where(eq(todos.id, id))
          .returning({ id: todos.id })
          .pipe(
            Effect.map(Array.head),
            Effect.orDie
          );
        return yield* Option.match(todo, {
          onNone: () => Effect.fail(new TodoNotFoundError({ id })),
          onSome: (row) => Effect.succeed(row.id),
        });
      });

      return TodoRepository.of({ list, findById, create, update, remove });
    }),
  );
}
