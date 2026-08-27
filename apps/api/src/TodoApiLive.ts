import { Effect } from "effect";
import { TodoApi } from "@ts-monorepo/domain";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { TodoRepository } from "./TodoRepository";

export const TodoApiGroupLive = HttpApiBuilder.group(TodoApi, "todos", (handlers) =>
  handlers
    .handle("listTodos", () =>
      Effect.gen(function* () {
        const repo = yield* TodoRepository;
        return yield* repo.list;
      }),
    )
    .handle("getTodo", (ctx) =>
      Effect.gen(function* () {
        const repo = yield* TodoRepository;
        return yield* repo.findById(ctx.params.id);
      }),
    )
    .handle("createTodo", (ctx) =>
      Effect.gen(function* () {
        const repo = yield* TodoRepository;
        return yield* repo.create(ctx.payload);
      }),
    )
    .handle("updateTodo", (ctx) =>
      Effect.gen(function* () {
        const repo = yield* TodoRepository;
        return yield* repo.update(ctx.params.id, ctx.payload);
      }),
    )
    .handle("deleteTodo", (ctx) =>
      Effect.gen(function* () {
        const repo = yield* TodoRepository;
        return yield* repo.remove(ctx.params.id);
      }),
    ),
);
