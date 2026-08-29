import { eq } from "drizzle-orm";
import { Context, DateTime, Effect, Layer, Schema } from "effect";
import {
  type CreateTodoInput,
  Todo,
  TodoId,
  TodoNotFoundError,
  type UpdateTodoInput,
} from "@ts-monorepo/domain";
import { Database } from "./db/Database";
import { todos, type TodoRow } from "./db/schema";

const toTodo = (row: TodoRow): Todo =>
  new Todo({
    id: Schema.decodeSync(TodoId)(row.id),
    title: row.title,
    completed: row.completed,
    createdAt: DateTime.fromDateUnsafe(row.createdAt),
    updatedAt: DateTime.fromDateUnsafe(row.updatedAt),
  });

export class TodoRepository extends Context.Service<
  TodoRepository,
  {
    readonly list: Effect.Effect<Array<Todo>>;
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
          Effect.map((rows) => rows.map(toTodo)),
          Effect.orDie,
        );

      const findById = Effect.fn("TodoRepository.findById")(function* (id: TodoId) {
        const rows = yield* db.select().from(todos).where(eq(todos.id, id)).pipe(Effect.orDie);
        const row = rows[0];
        if (row === undefined) {
          return yield* new TodoNotFoundError({ id });
        }
        return toTodo(row);
      });

      const create = Effect.fn("TodoRepository.create")(function* (input: CreateTodoInput) {
        const now = yield* DateTime.nowAsDate;
        const rows = yield* db
          .insert(todos)
          .values({ title: input.title, completed: false, createdAt: now, updatedAt: now })
          .returning()
          .pipe(Effect.orDie);
        return toTodo(rows[0]!);
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

        const rows = yield* db
          .update(todos)
          .set(patch)
          .where(eq(todos.id, id))
          .returning()
          .pipe(Effect.orDie);

        const row = rows[0];
        if (row === undefined) {
          return yield* new TodoNotFoundError({ id });
        }
        return toTodo(row);
      });

      const remove = Effect.fn("TodoRepository.remove")(function* (id: TodoId) {
        const rows = yield* db
          .delete(todos)
          .where(eq(todos.id, id))
          .returning({ id: todos.id })
          .pipe(Effect.orDie);
        if (rows.length === 0) {
          return yield* new TodoNotFoundError({ id });
        }
      });

      return TodoRepository.of({ list, findById, create, update, remove });
    }),
  );
}
