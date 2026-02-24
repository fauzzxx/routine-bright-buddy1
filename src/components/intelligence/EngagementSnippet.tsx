import { Sparkles } from "lucide-react";

export interface EngagementSnippetProps {
  lastEngagementScore: number | null;
  routineId?: string;
  className?: string;
}

/**
 * Progress screen: show "Engagement: High" or "Complete practice to see insights."
 */
export function EngagementSnippet({
  lastEngagementScore,
  className = "",
}: EngagementSnippetProps) {
  if (lastEngagementScore === null) {
    return (
      <p className={`text-xs text-muted-foreground flex items-center gap-1 ${className}`}>
        <Sparkles className="w-3 h-3" />
        Complete practice to see engagement insights.
      </p>
    );
  }

  const label =
    lastEngagementScore >= 70
      ? "High"
      : lastEngagementScore >= 50
        ? "Good"
        : "Improving";

  return (
    <p className={`text-xs text-muted-foreground flex items-center gap-1 ${className}`}>
      <Sparkles className="w-3 h-3" />
      Engagement: {label}
    </p>
  );
}
