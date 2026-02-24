import { supabase } from "@/integrations/supabase/client";
import type { PerformanceTier } from "@/utils/scoring";

export interface SaveTestResultInput {
  userId: string;
  activityType: string;
  engagement: number;
  motionAccuracy: number;
  timeEfficiency: number;
  finalScore: number;
  performanceTier: PerformanceTier;
  totalTimeSec: number | null;
}

export async function saveTestResult(
  input: SaveTestResultInput
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from("test_results")
    .insert({
      user_id: input.userId,
      activity_type: input.activityType,
      engagement: input.engagement,
      motion_accuracy: input.motionAccuracy,
      time_efficiency: input.timeEfficiency,
      final_score: input.finalScore,
      performance_tier: input.performanceTier,
      total_time_sec: input.totalTimeSec,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}
