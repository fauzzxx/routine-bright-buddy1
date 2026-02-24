import { Brain, BarChart3 } from "lucide-react";

export interface RoutineIntelligenceIndicatorProps {
  /** When true, show real-time engagement; when false, passive analytics */
  cameraActive?: boolean;
  className?: string;
}

/**
 * Routine screen: subtle indicator that AI monitoring / adaptive tracking is active.
 * Presentation only; does not change flow or timers.
 */
export function RoutineIntelligenceIndicator({
  cameraActive = false,
  className = "",
}: RoutineIntelligenceIndicatorProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground ${className}`}
    >
      {cameraActive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Real-time engagement tracking enabled</span>
        </>
      ) : (
        <>
          <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Passive behavior analytics active</span>
        </>
      )}
    </div>
  );
}
