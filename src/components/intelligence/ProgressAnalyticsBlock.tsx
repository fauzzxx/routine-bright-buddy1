import { Sparkles } from "lucide-react";

export interface ProgressAnalyticsBlockProps {
  currentStep: number;
  totalSteps: number;
  lastEngagementScore: number | null;
  className?: string;
}

function deriveFocusIndex(engagement: number | null): number {
  if (engagement === null) return 0;
  return Math.min(100, Math.round(engagement * 1.1));
}

function deriveMomentum(step: number, total: number, engagement: number | null): number {
  if (total <= 0) return 0;
  const progress = step / total;
  const base = engagement !== null ? engagement : 50;
  return Math.min(100, Math.round(progress * 40 + base * 0.5));
}

function deriveConsistency(engagement: number | null): number {
  if (engagement === null) return 0;
  return Math.min(100, Math.round(engagement * 0.95 + 5));
}

function getReasoningLines(step: number, total: number, engagement: number | null): [string, string] {
  if (total <= 0) return ["Complete steps to see AI reasoning.", ""];
  if (engagement === null) return ["AI reasoning will appear after practice.", ""];
  const pct = total > 0 ? (step / total) * 100 : 0;
  const line1 =
    pct < 50 && engagement >= 60
      ? "High focus detected during early steps."
      : pct >= 50 && engagement < 60
        ? "Completion slowed in middle steps."
        : engagement >= 70
          ? "High focus detected across the session."
          : "Steady progress. Try facing the camera more.";
  const line2 =
    step === total - 1 && engagement >= 65
      ? "Strong finish—focus maintained at the end."
      : step === 0
        ? "Good start. Keep the same focus for remaining steps."
        : "";
  return [line1, line2];
}

/**
 * Progress screen: engagement graph placeholder, AI reasoning, micro stat blocks.
 * All derived from existing step/engagement data; no logic or API changes.
 */
export function ProgressAnalyticsBlock({
  currentStep,
  totalSteps,
  lastEngagementScore,
  className = "",
}: ProgressAnalyticsBlockProps) {
  const focusIndex = deriveFocusIndex(lastEngagementScore);
  const momentum = deriveMomentum(currentStep, totalSteps, lastEngagementScore);
  const consistency = deriveConsistency(lastEngagementScore);
  const [reasoning1, reasoning2] = getReasoningLines(currentStep, totalSteps, lastEngagementScore);
  const engagementPct = lastEngagementScore ?? 0;
  const hasData = lastEngagementScore !== null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Micro stat blocks */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/50 border border-border/50 p-2 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">Focus Index</p>
          <p className="text-sm font-fredoka text-primary">{hasData ? focusIndex : "—"}</p>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border/50 p-2 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">Momentum</p>
          <p className="text-sm font-fredoka text-primary">{momentum}</p>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border/50 p-2 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">Consistency %</p>
          <p className="text-sm font-fredoka text-primary">{hasData ? consistency : "—"}</p>
        </div>
      </div>

      {/* Simple engagement bar (visual only) */}
      {hasData && (
        <div>
          <p className="text-[10px] uppercase text-muted-foreground mb-1">Engagement</p>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${engagementPct}%` }}
            />
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
        <p className="text-[10px] uppercase text-muted-foreground flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3" />
          AI Reasoning
        </p>
        <p className="text-xs text-foreground">{reasoning1}</p>
        {reasoning2 && <p className="text-xs text-muted-foreground mt-0.5">{reasoning2}</p>}
      </div>
    </div>
  );
}
