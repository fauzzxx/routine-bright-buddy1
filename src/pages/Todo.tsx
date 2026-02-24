import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  fetchTasks,
  insertTask,
  updateTask,
  deleteTask,
  type Task,
} from "@/lib/tasks";
import { demoTasks, type DemoTask } from "@/lib/demoTasks";

export default function Todo() {
  const { user } = useAuth();
  const [items, setItems] = useState<(Task | DemoTask)[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const demoMode =
    String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === "true" ||
    !isSupabaseConfigured;

  const load = useCallback(async () => {
    setLoading(true);
    if (demoMode) {
      setItems(demoTasks.getAll());
    } else if (user?.id) {
      const list = await fetchTasks(user.id);
      setItems(list);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, [demoMode, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    if (demoMode) {
      demoTasks.add(title);
      setItems(demoTasks.getAll());
    } else if (user?.id) {
      const orderIndex = items.length;
      const res = await insertTask(user.id, title, orderIndex);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      await load();
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    if (demoMode) {
      demoTasks.update(id, { completed });
      setItems(demoTasks.getAll());
    } else {
      await updateTask(id, { completed });
      setItems((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed } : t))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (demoMode) {
      demoTasks.delete(id);
      setItems(demoTasks.getAll());
    } else {
      await deleteTask(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background font-inter pb-20">
        <Navigation />
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-lg">
            <h1 className="text-2xl font-fredoka text-slate-900 mb-6">
              To-Do
            </h1>

            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Add a task..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="rounded-2xl flex-1"
              />
              <Button
                size="icon"
                className="rounded-2xl shrink-0"
                onClick={handleAdd}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <Card className="rounded-[2rem] border-2 border-muted/50">
              <CardContent className="p-4">
                {loading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No tasks yet. Add one above.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {items.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 group"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            handleToggle(task.id, !!checked)
                          }
                        />
                        <span
                          className={`flex-1 font-medium ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 rounded-full text-destructive hover:text-destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
