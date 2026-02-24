import { Sparkles } from "lucide-react";

export interface FlashcardIntelligenceSnippetProps {
  stepIndex?: number;
  totalSteps?: number;
  /** Optional: time on card in seconds for simulated response time */
  timeOnCardSec?: number;
  className?: string;
}

function deriveRecallStrength(step: number, total: number): string {
  if (total <= 0) return "Medium";
  const pct = (step / total) * 100;
  if (pct < 33) return "Building";
  if (pct < 66) return "Medium";
  return "Strong";
}

function deriveRetentionPrediction(step: number, total: number): number {
  if (total <= 0) return 75;
  return Math.min(95, 70 + Math.round((step / total) * 25) + (step % 2 === 0 ? 3 : 0));
}

function deriveResponseTimeMessage(timeSec?: number): string {
  if (timeSec === undefined || timeSec < 5) return "Response time improved";
  if (timeSec < 15) return "Steady response time";
  return "Take your time—quality over speed";
}

/**
 * Flashcard flow: adaptive intelligence signals (simulated from step/timing).
 * Does not change flashcard algorithm or logic.
 */
export function FlashcardIntelligenceSnippet({
  stepIndex = 0,
  totalSteps = 1,
  timeOnCardSec,
  className = "",
}: FlashcardIntelligenceSnippetProps) {
  const recall = deriveRecallStrength(stepIndex, totalSteps);
  const retention = deriveRetentionPrediction(stepIndex, totalSteps);
  const responseMsg = deriveResponseTimeMessage(timeOnCardSec);

  return (
    <div className={`text-xs text-muted-foreground space-y-1.5 ${className}`}>
      <p className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 shrink-0 text-primary/70" />
        <span>{responseMsg}</span>
      </p>
      <p>
        Recall strength: <span className="font-medium text-foreground">{recall}</span>
        {" · "}
        Memory retention prediction: <span className="font-medium text-foreground">{retention}%</span>
      </p>
      <p className="italic">Smart suggestion: Revisit this card tomorrow for best retention.</p>
    </div>
  );
}
