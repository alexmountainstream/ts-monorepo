import { type Todo, UpdateTodoInput } from "@ts-monorepo/domain";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TodoApiClient, todosReactivityKey } from "@/lib/api";
import { cn } from "@/lib/utils";

export function TodoList() {
  const todosResult = useAtomValue(
    TodoApiClient.query("todos", "listTodos", { reactivityKeys: [todosReactivityKey] }),
  );

  return AsyncResult.match(todosResult, {
    onInitial: () => <p className="text-muted-foreground text-sm">Loading todos…</p>,
    onFailure: () => <p className="text-destructive text-sm">Failed to load todos.</p>,
    onSuccess: (result) =>
      result.value.length === 0 ? (
        <p className="text-muted-foreground text-sm">No todos yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {result.value.map((todo) => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </ul>
      ),
  });
}

function TodoRow({ todo }: { readonly todo: Todo }) {
  const updateTodo = useAtomSet(TodoApiClient.mutation("todos", "updateTodo"), {
    mode: "promise",
  });
  const deleteTodo = useAtomSet(TodoApiClient.mutation("todos", "deleteTodo"), {
    mode: "promise",
  });

  return (
    <li className="flex items-center gap-3 rounded-md border p-3">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) =>
          updateTodo({
            params: { id: todo.id },
            payload: new UpdateTodoInput({ completed: checked === true }),
            reactivityKeys: [todosReactivityKey],
          })
        }
        aria-label={`Mark "${todo.title}" as ${todo.completed ? "not completed" : "completed"}`}
      />
      <span
        className={cn("flex-1 text-sm", todo.completed && "text-muted-foreground line-through")}
      >
        {todo.title}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete "${todo.title}"`}
        onClick={() =>
          deleteTodo({
            params: { id: todo.id },
            reactivityKeys: [todosReactivityKey],
          })
        }
      >
        <Trash2 />
      </Button>
    </li>
  );
}
