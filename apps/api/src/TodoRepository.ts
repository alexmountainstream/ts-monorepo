import { Context, DateTime, Effect, Layer, Ref, Schema } from "effect";
import {
  CreateTodoInput,
  Todo,
  TodoId,
  TodoNotFoundError,
  type UpdateTodoInput,
} from "@ts-monorepo/domain";
import { randomUUID } from "node:crypto";

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
      const todos = yield* Ref.make(new Map<TodoId, Todo>());

      const list = Ref.get(todos).pipe(Effect.map((map) => Array.from(map.values())));

      const findById = Effect.fn("TodoRepository.findById")(function* (id: TodoId) {
        const map = yield* Ref.get(todos);
        const todo = map.get(id);
        if (todo === undefined) {
          return yield* new TodoNotFoundError({ id });
        }
        return todo;
      });

      const create = Effect.fn("TodoRepository.create")(function* (input: CreateTodoInput) {
        const now = yield* DateTime.now;
        const todo = new Todo({
          id: Schema.decodeSync(TodoId)(randomUUID()),
          title: input.title,
          completed: false,
          createdAt: now,
          updatedAt: now,
        });
        yield* Ref.update(todos, (map) => new Map(map).set(todo.id, todo));
        return todo;
      });

      const update = Effect.fn("TodoRepository.update")(function* (
        id: TodoId,
        input: UpdateTodoInput,
      ) {
        const existing = yield* findById(id);
        const now = yield* DateTime.now;
        const updated = new Todo({
          ...existing,
          title: input.title ?? existing.title,
          completed: input.completed ?? existing.completed,
          updatedAt: now,
        });
        yield* Ref.update(todos, (map) => new Map(map).set(updated.id, updated));
        return updated;
      });

      const remove = Effect.fn("TodoRepository.remove")(function* (id: TodoId) {
        yield* findById(id);
        yield* Ref.update(todos, (map) => {
          const next = new Map(map);
          next.delete(id);
          return next;
        });
      });

      return TodoRepository.of({ list, findById, create, update, remove });
    }),
  );
}
