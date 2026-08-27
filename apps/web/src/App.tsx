import { AddTodoForm } from "@/components/add-todo-form";
import { TodoList } from "@/components/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md items-start justify-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Todos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AddTodoForm />
          <TodoList />
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
