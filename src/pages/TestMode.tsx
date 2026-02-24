import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Award } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { WebcamComponent } from "@/components/webcam/WebcamComponent";
import {
  computeTestFinalScore,
  computeTimeEfficiency,
  getTestPerformanceTier,
  getTierLabel,
  type PerformanceTier,
} from "@/utils/scoring";
import { saveTestResult } from "@/lib/testResults";
import { supabase } from "@/integrations/supabase/client";
import { demoStore } from "@/integrations/demo/store";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { PracticeMetrics } from "@/hooks/usePracticeMetrics";

const DEMO_TEST_RESULTS_KEY = "rb_demo_test_results";

function saveDemoTestResult(
  activityType: string,
  finalScore: number,
  performanceTier: string
) {
  try {
    const raw = localStorage.getItem(DEMO_TEST_RESULTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({
      activity_type: activityType,
      final_score: finalScore,
      performance_tier: performanceTier,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(DEMO_TEST_RESULTS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore
  }
}

export default function TestMode() {
  const { activity } = useParams<{ activity: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activityTitle, setActivityTitle] = useState<string>("Activity");
  const [phase, setPhase] = useState<"intro" | "recording" | "results">("intro");
  const [testResult, setTestResult] = useState<{
    finalScore: number;
    tier: PerformanceTier;
    metrics: PracticeMetrics;
  } | null>(null);
  const demoMode =
    String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === "true" ||
    !isSupabaseConfigured;

  useEffect(() => {
    if (!activity) return;
    if (demoMode) {
      const { routine } = demoStore.getRoutineById(activity);
      setActivityTitle(routine?.title ?? activity);
    } else {
      supabase
        .from("routines")
        .select("title")
        .eq("id", activity)
        .single()
        .then(({ data }) => setActivityTitle(data?.title ?? activity));
    }
  }, [activity, demoMode]);

  const handleTestComplete = async (metrics: PracticeMetrics) => {
    const timeEfficiency = computeTimeEfficiency(metrics.totalTimeSec, 20, 180);
    const engagement = metrics.engagementScore;
    const motionAccuracy = metrics.motionScore;
    const finalScore = computeTestFinalScore(
      engagement,
      motionAccuracy,
      timeEfficiency
    );
    const tier = getTestPerformanceTier(finalScore);

    setTestResult({ finalScore, tier, metrics });
    setPhase("results");

    if (demoMode) {
      saveDemoTestResult(activityTitle, finalScore, tier);
    } else if (user?.id) {
      const res = await saveTestResult({
        userId: user.id,
        activityType: activityTitle,
        engagement,
        motionAccuracy,
        timeEfficiency,
        finalScore,
        performanceTier: tier,
        totalTimeSec: metrics.totalTimeSec,
      });
      if ("error" in res) toast.error(res.error);
    }
  };

  if (!activity) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">No activity specified.</p>
          <Button variant="link" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background font-inter pb-20">
        <Navigation />

        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-lg">
            {phase === "intro" && (
              <Card className="rounded-[2rem] border-2 border-primary/20 overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <h1 className="text-2xl font-fredoka text-center">
                    Test: {activityTitle}
                  </h1>
                  <p className="text-muted-foreground text-center text-sm">
                    The camera will monitor your practice. Complete the activity
                    with good focus and movement to get a score.
                  </p>
                  <Button
                    size="lg"
                    className="w-full rounded-2xl font-fredoka"
                    onClick={() => setPhase("recording")}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Start test
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full rounded-2xl"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}

            {phase === "recording" && (
              <Card className="rounded-[2rem] border-2 border-primary/20 overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="font-fredoka mb-4">Test: {activityTitle}</h2>
                  <WebcamComponent
                    activityLabel="Test"
                    onPracticeComplete={handleTestComplete}
                    onSkip={() => {
                      toast.info("Test skipped");
                      navigate(-1);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {phase === "results" && testResult && (
              <Card className="rounded-[2rem] border-2 border-primary/20 overflow-hidden shadow-vibrant">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <Award className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-fredoka text-slate-900">
                      Test complete
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground">Final score</p>
                      <p className="text-3xl font-fredoka text-primary">
                        {testResult.finalScore}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground">Tier</p>
                      <p className="text-xl font-fredoka">
                        {getTierLabel(testResult.tier)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full rounded-2xl font-fredoka"
                    onClick={() => navigate(-1)}
                  >
                    Done
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
