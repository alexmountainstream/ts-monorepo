import { CreateTodoInput } from "@ts-monorepo/domain";
import { useAtomSet } from "@effect/atom-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TodoApiClient, todosReactivityKey } from "@/lib/api";

export function AddTodoForm() {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createTodo = useAtomSet(TodoApiClient.mutation("todos", "createTodo"), {
    mode: "promise",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createTodo({
        payload: new CreateTodoInput({ title: trimmed }),
        reactivityKeys: [todosReactivityKey],
      });
      setTitle("");
    } catch {
      setError("Couldn't add that todo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          maxLength={280}
          disabled={isSubmitting}
          aria-label="New todo title"
        />
        <Button type="submit" disabled={isSubmitting || title.trim().length === 0}>
          Add
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </form>
  );
}
