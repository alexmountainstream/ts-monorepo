import { TodoApi } from "@ts-monorepo/domain";
import { FetchHttpClient } from "effect/unstable/http";
import { AtomHttpApi } from "effect/unstable/reactivity";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class TodoApiClient extends AtomHttpApi.Service<TodoApiClient>()("web/TodoApiClient", {
  api: TodoApi,
  httpClient: FetchHttpClient.layer,
  baseUrl,
}) {}

export const todosReactivityKey = "todos";
