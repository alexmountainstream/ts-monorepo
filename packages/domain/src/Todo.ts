import { Schema } from "effect";

/**
 * Uniquely identifies a `Todo`.
 */
export const TodoId = Schema.String.check(Schema.isUUID()).pipe(Schema.brand("TodoId"));
export type TodoId = typeof TodoId.Type;

/**
 * The text describing a `Todo`. Must be non-empty once whitespace is trimmed.
 */
export const TodoTitle = Schema.Trim.pipe(
  Schema.check(Schema.isMinLength(1), Schema.isMaxLength(280)),
);
export type TodoTitle = typeof TodoTitle.Type;

/**
 * A single todo item.
 */
export class Todo extends Schema.Class<Todo>("domain/Todo")({
  id: TodoId,
  title: TodoTitle,
  completed: Schema.Boolean,
  createdAt: Schema.DateTimeUtcFromString,
  updatedAt: Schema.DateTimeUtcFromString,
}) {}

export type TodoEncoded = typeof Todo.Encoded;

export const decodeTodo = Schema.decodeUnknownEffect(Todo);
export const encodeTodo = Schema.encodeEffect(Todo);

/**
 * The fields required to create a new `Todo`. `id`, `completed`,
 * `createdAt` and `updatedAt` are assigned by the system.
 */
export class CreateTodoInput extends Schema.Class<CreateTodoInput>("domain/CreateTodoInput")({
  title: TodoTitle,
}) {}

export const decodeCreateTodoInput = Schema.decodeUnknownEffect(CreateTodoInput);

/**
 * The fields that may be changed on an existing `Todo`.
 */
export class UpdateTodoInput extends Schema.Class<UpdateTodoInput>("domain/UpdateTodoInput")({
  title: Schema.optional(TodoTitle),
  completed: Schema.optional(Schema.Boolean),
}) {}

export const decodeUpdateTodoInput = Schema.decodeUnknownEffect(UpdateTodoInput);

/**
 * Raised when a `Todo` cannot be found for a given `TodoId`.
 */
export class TodoNotFoundError extends Schema.TaggedError<TodoNotFoundError>()(
  "TodoNotFoundError",
  {
    id: TodoId,
  },
) {}
