import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchTasks(
  userId: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("order_index", { ascending: true });

  if (error) return [];
  return (data ?? []) as Task[];
}

export async function insertTask(
  userId: string,
  title: string,
  orderIndex: number = 0
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title,
      completed: false,
      order_index: orderIndex,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function updateTask(
  taskId: string,
  updates: { title?: string; completed?: boolean; order_index?: number }
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId);

  return error ? { error: error.message } : {};
}

export async function deleteTask(taskId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  return error ? { error: error.message } : {};
}
