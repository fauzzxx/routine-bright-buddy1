/**
 * Scoring formulas, performance tiers, and AI tip helpers for practice and test modes.
 */

export type PerformanceTier = "excellent" | "good" | "improving" | "needs_practice";

export function getTestPerformanceTier(finalScore: number): PerformanceTier {
  if (finalScore >= 90) return "excellent";
  if (finalScore >= 70) return "good";
  if (finalScore >= 50) return "improving";
  return "needs_practice";
}

export function getTierLabel(tier: PerformanceTier): string {
  switch (tier) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "improving":
      return "Improving";
    case "needs_practice":
      return "Needs Practice";
    default:
      return "—";
  }
}

/**
 * Test mode: finalScore = 0.4 * engagement + 0.4 * motionAccuracy + 0.2 * timeEfficiency
 */
export function computeTestFinalScore(
  engagement: number,
  motionAccuracy: number,
  timeEfficiency: number
): number {
  return Math.round(
    0.4 * engagement + 0.4 * motionAccuracy + 0.2 * timeEfficiency
  );
}

/**
 * Practice overall score (0–100): average of engagement and motion, or weighted.
 */
export function computePracticeOverallScore(
  engagementScore: number,
  motionScore: number
): number {
  return Math.round((engagementScore + motionScore) / 2);
}

/**
 * Time efficiency score 0–100: good if totalTime is within expected range.
 * expectedMinSec and expectedMaxSec define the "ideal" window.
 */
export function computeTimeEfficiency(
  totalTimeSec: number,
  expectedMinSec: number = 15,
  expectedMaxSec: number = 120
): number {
  if (totalTimeSec <= 0) return 0;
  if (totalTimeSec >= expectedMinSec && totalTimeSec <= expectedMaxSec)
    return 100;
  if (totalTimeSec < expectedMinSec) {
    return Math.round((totalTimeSec / expectedMinSec) * 100);
  }
  const over = totalTimeSec - expectedMaxSec;
  const penalty = Math.min(50, (over / 60) * 25);
  return Math.max(0, Math.round(100 - penalty));
}

/**
 * Compare last two practice sessions for dashboard insight.
 */
export function compareEngagementInsight(
  last: { engagement_score: number } | null,
  previous: { engagement_score: number } | null
): string {
  if (!last) return "Complete a practice session to see AI insights.";
  if (!previous) return "Great start! Keep practicing to see progress.";
  const diff = last.engagement_score - previous.engagement_score;
  if (diff > 10) return "Engagement improved compared to last session.";
  if (diff < -10) return "Engagement was lower than last time. Try facing the camera.";
  return "Engagement similar to last session. Keep it up!";
}

/**
 * One-line AI tip based on practice metrics (for session summary).
 */
export function getPracticeAITip(
  engagementScore: number,
  motionScore: number
): string {
  if (engagementScore >= 70 && motionScore >= 70) return "Great focus and movement!";
  if (engagementScore < 50 && motionScore >= 50) return "Try to face the camera a bit more next time.";
  if (engagementScore >= 50 && motionScore < 50) return "Good focus! Try moving a little more during practice.";
  if (engagementScore < 50 && motionScore < 50) return "Next time, face the camera and try to follow the steps with movement.";
  return "Nice job! Keep practicing to build the habit.";
}
