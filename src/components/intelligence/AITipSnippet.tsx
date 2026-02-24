import { Sparkles } from "lucide-react";

const TIPS = [
  "Try doing this step while watching yourself in the camera.",
  "Practice makes perfect. Take your time.",
  "AI is here to help you build great habits.",
];

/**
 * Rotating AI tip for flashcard step UI.
 */
export function AITipSnippet() {
  const tip = TIPS[Math.floor(Date.now() / 10000) % TIPS.length];

  return (
    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
      <Sparkles className="w-3 h-3 shrink-0 text-primary/70" />
      <span>AI tip: {tip}</span>
    </p>
  );
}
