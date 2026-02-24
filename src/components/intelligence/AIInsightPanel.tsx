import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";

export interface AIInsightPanelProps {
  lastSession?: { engagement_score: number } | null;
  previousSession?: { engagement_score: number } | null;
  /** Optional: session count for simulated signals */
  sessionCount?: number;
}

function deriveSignals(
  last: { engagement_score: number } | null | undefined,
  prev: { engagement_score: number } | null | undefined,
  sessionCount: number
): string[] {
  const signals: string[] = [];
  if (last && prev) {
    const diff = last.engagement_score - prev.engagement_score;
    if (diff > 8) signals.push("Engagement improved compared to last session.");
    else if (diff < -8) signals.push("Focus stability can improve—try facing the camera next time.");
    else signals.push("Focus stability consistent with last session.");
  }
  if (last) {
    if (last.engagement_score >= 70) signals.push("Camera confidence level: High");
    else if (last.engagement_score >= 50) signals.push("Camera confidence level: Good");
    if (signals.length < 2) signals.push("Focus stability increased by " + Math.min(12, Math.round(last.engagement_score / 8)) + "%");
  }
  if (sessionCount >= 2 && signals.length < 3) signals.push("Completion speed improved over recent sessions.");
  if (signals.length === 0) signals.push("Complete a practice session to see AI insights.");
  return signals.slice(0, 4);
}

/**
 * Dashboard: premium AI Insight panel with multiple dynamic/simulated signals.
 * Additive only; does not replace existing logic.
 */
export function AIInsightPanel({
  lastSession,
  previousSession,
  sessionCount = 0,
}: AIInsightPanelProps) {
  const signals = deriveSignals(lastSession, previousSession, sessionCount);

  return (
    <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center ring-2 ring-primary/10">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <span className="text-sm font-semibold text-foreground">AI Insight</span>
        </div>
        <ul className="space-y-2">
          {signals.map((text, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
            >
              <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
