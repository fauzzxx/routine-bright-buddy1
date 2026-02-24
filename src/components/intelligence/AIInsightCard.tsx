import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { compareEngagementInsight } from "@/utils/scoring";

export interface AIInsightCardProps {
  lastSession: { engagement_score: number } | null;
  previousSession: { engagement_score: number } | null;
}

/**
 * Dashboard: "AI Insight" card comparing last two practice sessions.
 */
export function AIInsightCard({ lastSession, previousSession }: AIInsightCardProps) {
  const message = compareEngagementInsight(lastSession, previousSession);

  return (
    <Card className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            AI Insight
          </p>
          <p className="text-sm font-medium text-foreground mt-0.5">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
