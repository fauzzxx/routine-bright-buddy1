import { Sparkles } from "lucide-react";

/**
 * Small pill/badge for routine cards and RoutineDetail: "AI-guided" / "Smart routine".
 */
export function IntelligenceBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30 ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      AI-guided
    </span>
  );
}
