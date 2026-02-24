import { supabase } from "@/integrations/supabase/client";

export interface PlannerEvent {
  id: string;
  user_id: string;
  title: string;
  scheduled_at: string;
  activity_type: string | null;
  repeat_option: string;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchPlannerEvents(
  userId: string,
  from: Date,
  to: Date
): Promise<PlannerEvent[]> {
  const fromStr = from.toISOString();
  const toStr = to.toISOString();
  const { data, error } = await supabase
    .from("planner_events")
    .select("*")
    .eq("user_id", userId)
    .gte("scheduled_at", fromStr)
    .lte("scheduled_at", toStr)
    .order("scheduled_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as PlannerEvent[];
}

export async function insertPlannerEvent(
  userId: string,
  input: {
    title: string;
    scheduled_at: string;
    activity_type?: string | null;
    repeat_option?: string;
  }
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("planner_events")
    .insert({
      user_id: userId,
      title: input.title,
      scheduled_at: input.scheduled_at,
      activity_type: input.activity_type ?? null,
      repeat_option: input.repeat_option ?? "none",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function updatePlannerEvent(
  eventId: string,
  updates: Partial<Pick<PlannerEvent, "title" | "scheduled_at" | "activity_type" | "repeat_option">>
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("planner_events")
    .update(updates)
    .eq("id", eventId);

  return error ? { error: error.message } : {};
}

export async function deletePlannerEvent(eventId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("planner_events").delete().eq("id", eventId);
  return error ? { error: error.message } : {};
}
