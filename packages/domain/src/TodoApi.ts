import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import { CreateTodoInput, Todo, TodoId, TodoNotFoundError, UpdateTodoInput } from "./Todo";

const TodoNotFound = TodoNotFoundError.pipe(HttpApiSchema.status(404));

export class TodoApiGroup extends HttpApiGroup.make("todos")
  .add(
    HttpApiEndpoint.get("listTodos", "/todos", {
      success: Schema.Array(Todo),
    }),
  )
  .add(
    HttpApiEndpoint.get("getTodo", "/todos/:id", {
      params: {
        id: TodoId,
      },
      success: Todo,
      error: [TodoNotFound],
    }),
  )
  .add(
    HttpApiEndpoint.post("createTodo", "/todos", {
      payload: CreateTodoInput,
      success: Todo.pipe(HttpApiSchema.status(201)),
    }),
  )
  .add(
    HttpApiEndpoint.patch("updateTodo", "/todos/:id", {
      params: {
        id: TodoId,
      },
      payload: UpdateTodoInput,
      success: Todo,
      error: [TodoNotFound],
    }),
  )
  .add(
    HttpApiEndpoint.delete("deleteTodo", "/todos/:id", {
      params: {
        id: TodoId,
      },
      error: [TodoNotFound],
    }),
  )
  .prefix("/api") {}

export class TodoApi extends HttpApi.make("TodoApi").add(TodoApiGroup) {}
