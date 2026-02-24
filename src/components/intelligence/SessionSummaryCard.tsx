import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { computePracticeOverallScore, getPracticeAITip } from "@/utils/scoring";
import type { PracticeMetrics } from "@/hooks/usePracticeMetrics";

export interface SessionSummaryCardProps {
  metrics: PracticeMetrics;
  onContinue: () => void;
  activityLabel?: string;
}

function deriveCompletionConsistency(engagement: number, motion: number): string {
  const avg = (engagement + motion) / 2;
  if (avg >= 75) return "High";
  if (avg >= 50) return "Medium";
  return "Building";
}

function deriveFocusStability(engagement: number): string {
  if (engagement >= 70) return "Stable";
  if (engagement >= 50) return "Moderate";
  return "Variable";
}

function deriveReasoningInsight(engagement: number, motion: number): string {
  if (engagement >= 70 && motion >= 70) return "You were more focused during the final phase.";
  if (engagement >= 60) return "Focus was consistent through the session.";
  return "Try to face the camera a bit more next time for better tracking.";
}

/**
 * Shown after practice: Session Intelligence Summary with engagement, consistency,
 * focus stability, AI reasoning; then continue. Does not change completion logic.
 */
export function SessionSummaryCard({
  metrics,
  onContinue,
  activityLabel = "Practice",
}: SessionSummaryCardProps) {
  const overall = computePracticeOverallScore(
    metrics.engagementScore,
    metrics.motionScore
  );
  const tip = getPracticeAITip(metrics.engagementScore, metrics.motionScore);
  const completionConsistency = deriveCompletionConsistency(metrics.engagementScore, metrics.motionScore);
  const focusStability = deriveFocusStability(metrics.engagementScore);
  const reasoningInsight = deriveReasoningInsight(metrics.engagementScore, metrics.motionScore);

  return (
    <Card className="rounded-[2rem] border-2 border-primary/20 overflow-hidden shadow-vibrant">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-fredoka text-lg">Session Intelligence Summary</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground">Engagement Score</p>
            <p className="font-fredoka text-lg text-primary">{metrics.engagementScore}%</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground">Completion Consistency</p>
            <p className="font-fredoka text-lg text-primary">{completionConsistency}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground">Focus Stability</p>
            <p className="font-fredoka text-lg text-primary">{focusStability}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground">Time taken</p>
            <p className="font-fredoka text-lg">{metrics.totalTimeSec}s</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground">Overall score</p>
            <p className="font-fredoka text-lg text-primary">{overall}</p>
          </div>
        </div>

        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
          <p className="text-xs text-muted-foreground mb-1">AI Reasoning Insight</p>
          <p className="text-sm font-medium">{reasoningInsight}</p>
        </div>

        <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">Tip</p>
          <p className="text-sm font-medium">{tip}</p>
        </div>

        {/* Simple reward badge animation: star burst */}
        <div className="flex justify-center py-2">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center animate-pulse">
            <span className="text-3xl">⭐</span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full rounded-2xl font-fredoka"
          onClick={onContinue}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
