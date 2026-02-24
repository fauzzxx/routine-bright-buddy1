import { supabase } from "@/integrations/supabase/client";
import type { PracticeMetrics } from "@/hooks/usePracticeMetrics";

export interface SavePracticeResultInput {
  userId: string;
  activityType: string;
  flashcardId?: string | null;
  routineId?: string | null;
  metrics: PracticeMetrics;
}

export async function savePracticeResult(
  input: SavePracticeResultInput
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("practice_results")
    .insert({
      user_id: input.userId,
      activity_type: input.activityType,
      flashcard_id: input.flashcardId ?? null,
      routine_id: input.routineId ?? null,
      engagement_score: input.metrics.engagementScore,
      motion_score: input.metrics.motionScore,
      response_time_sec: input.metrics.responseTimeSec,
      total_time_sec: input.metrics.totalTimeSec,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function getLastPracticeResults(
  userId: string,
  limit: number = 2
): Promise<Array<{ engagement_score: number; created_at: string }>> {
  const { data, error } = await supabase
    .from("practice_results")
    .select("engagement_score, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function getLastPracticeResultForRoutine(
  userId: string,
  routineId: string
): Promise<{ engagement_score: number } | null> {
  const { data, error } = await supabase
    .from("practice_results")
    .select("engagement_score")
    .eq("user_id", userId)
    .eq("routine_id", routineId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
