import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, Play, Calendar, Clock, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { demoStore } from "@/integrations/demo/store";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { WebcamComponent } from "@/components/webcam/WebcamComponent";
import { SessionSummaryCard } from "@/components/intelligence/SessionSummaryCard";
import { EngagementSnippet } from "@/components/intelligence/EngagementSnippet";
import { AITipSnippet } from "@/components/intelligence/AITipSnippet";
import { FlashcardIntelligenceSnippet } from "@/components/intelligence/FlashcardIntelligenceSnippet";
import { IntelligenceBadge } from "@/components/intelligence/IntelligenceBadge";
import { RoutineIntelligenceIndicator } from "@/components/intelligence/RoutineIntelligenceIndicator";
import { ProgressAnalyticsBlock } from "@/components/intelligence/ProgressAnalyticsBlock";
import { savePracticeResult, getLastPracticeResultForRoutine } from "@/lib/practiceResults";
import { demoPracticeResults } from "@/lib/demoPracticeResults";
import type { PracticeMetrics } from "@/hooks/usePracticeMetrics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { requestGenerateAnimation } from "@/integrations/ai/hf";
import { Film } from "lucide-react";

interface Flashcard {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
}

interface Routine {
  id: string;
  title: string;
  category: string;
  icon: string;
  video_url: string | null;
  description: string | null;
}

interface Schedule {
  id: string;
  scheduled_time: string;
  days_of_week: number[];
  is_active: boolean;
}

export default function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const showScheduleDialog = searchParams.get("schedule") === "true";

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(showScheduleDialog);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [existingSchedule, setExistingSchedule] = useState<Schedule | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [lastPracticeMetrics, setLastPracticeMetrics] = useState<PracticeMetrics | null>(null);
  const [lastEngagementForRoutine, setLastEngagementForRoutine] = useState<number | null>(null);
  const [hdJobId, setHdJobId] = useState<string | null>(null);
  const [hdStatus, setHdStatus] = useState<string | null>(null);
  const [isPollingHd, setIsPollingHd] = useState(false);
  const [loadingRecordingByCard, setLoadingRecordingByCard] = useState<Record<string, boolean>>({});
  const demoMode = (String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === 'true') || !isSupabaseConfigured;
  const useDemoStore = demoMode || !user;

  const daysOfWeek = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  useEffect(() => {
    fetchRoutineData();
  }, [id, useDemoStore]);

  useEffect(() => {
    if (!id) {
      setLastEngagementForRoutine(null);
      return;
    }
    if (useDemoStore) {
      const last = demoPracticeResults.getLastForRoutine(id);
      setLastEngagementForRoutine(last?.engagement_score ?? null);
    } else if (user?.id) {
      getLastPracticeResultForRoutine(user.id, id).then((r) => {
        setLastEngagementForRoutine(r?.engagement_score ?? null);
      });
    } else {
      setLastEngagementForRoutine(null);
    }
  }, [id, useDemoStore, user?.id]);

  const handlePracticeComplete = async (metrics: PracticeMetrics) => {
    const currentCard = flashcards[currentStep];
    setLastPracticeMetrics(metrics);
    setShowPracticeModal(false);
    setShowSessionSummary(true);
    if (useDemoStore) {
      demoPracticeResults.add(
        metrics.engagementScore,
        metrics.motionScore,
        metrics.responseTimeSec,
        metrics.totalTimeSec
      );
      setLastEngagementForRoutine(Math.round((metrics.engagementScore + metrics.motionScore) / 2));
    } else if (user?.id && id && currentCard) {
      const res = await savePracticeResult({
        userId: user.id,
        activityType: currentCard.title,
        flashcardId: currentCard.id,
        routineId: id,
        metrics,
      });
      if ("error" in res) toast.error(res.error);
      else setLastEngagementForRoutine(Math.round((metrics.engagementScore + metrics.motionScore) / 2));
    }
  };

  const fetchRoutineData = async () => {
    if (!id) return;

    try {
      if (useDemoStore) {
        const { routine: r, flashcards: fc } = demoStore.getRoutineById(id);
        if (!r) throw new Error("Routine not found");
        setRoutine({
          id: r.id,
          title: r.title,
          category: r.category,
          icon: r.icon,
          video_url: r.video_url ?? null,
          description: r.description ?? null,
        });
        setFlashcards(fc.map(f => ({
          id: f.id,
          step_number: f.step_number,
          title: f.title,
          description: f.description,
          image_url: f.image_url ?? null,
          video_url: f.video_url ?? null,
        })));
        const schedule = demoStore.getScheduleByRoutineId(id);
        if (schedule) {
          setExistingSchedule({
            id: schedule.id,
            scheduled_time: schedule.scheduled_time,
            days_of_week: schedule.days_of_week,
            is_active: schedule.is_active,
          });
          setScheduleTime(schedule.scheduled_time);
          setSelectedDays(schedule.days_of_week);
        }
      } else {
        const [routineRes, flashcardsRes, scheduleRes] = await Promise.all([
          supabase.from("routines").select("*").eq("id", id).single(),
          supabase.from("flashcards").select("*").eq("routine_id", id).order("step_number"),
          supabase.from("routine_schedules").select("*").eq("routine_id", id).maybeSingle(),
        ]);

        if (routineRes.error) throw routineRes.error;
        if (flashcardsRes.error) throw flashcardsRes.error;

        setRoutine(routineRes.data);
        setFlashcards(flashcardsRes.data || []);

        if (scheduleRes.data) {
          setExistingSchedule(scheduleRes.data);
          setScheduleTime(scheduleRes.data.scheduled_time);
          setSelectedDays(scheduleRes.data.days_of_week);
        }
      }
    } catch (error: unknown) {
      const message = (error as Error)?.message || "Failed to load routine";
      toast.error(message);
      console.error("Error loading routine:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePlayVideo = () => {
    if (routine?.video_url) {
      if (routine.video_url.startsWith('blob:')) {
        setShowVideoDialog(true);
      } else {
        window.open(routine.video_url, '_blank');
      }
    } else {
      toast.info("No video available for this routine");
    }
  };

  const handleSaveSchedule = async () => {
    if (!id) return;
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    try {
      const scheduleData = {
        scheduled_time: scheduleTime,
        days_of_week: selectedDays,
        is_active: true,
      };

      if (useDemoStore) {
        demoStore.upsertSchedule(id, scheduleData);
      } else {
        if (existingSchedule) {
          const { error } = await supabase
            .from("routine_schedules")
            .update({ routine_id: id, ...scheduleData })
            .eq("id", existingSchedule.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("routine_schedules")
            .insert({ routine_id: id, ...scheduleData });
          if (error) throw error;
        }
      }

      toast.success("Schedule saved successfully!");
      setScheduleDialogOpen(false);
      fetchRoutineData();
    } catch (error: unknown) {
      const message = (error as Error)?.message || "Failed to save schedule";
      toast.error(message);
      console.error("Error saving schedule:", error);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleUseRecording = async (fc: Flashcard) => {
    setLoadingRecordingByCard(prev => ({ ...prev, [fc.id]: true }));
    try {
      const prompt = `${fc.title}. ${fc.description}`;
      const res = await requestGenerateAnimation(prompt);
      const url = res.video_path;
      if (!url) {
        toast.error("No recording found for this step");
        return;
      }
      if (useDemoStore) {
        demoStore.setFlashcardVideoUrl(fc.id, url);
      } else {
        const { error } = await supabase
          .from("flashcards")
          .update({ video_url: url })
          .eq("id", fc.id);
        if (error) throw error;
      }
      setFlashcards(prev =>
        prev.map(f => (f.id === fc.id ? { ...f, video_url: url } : f))
      );
      toast.success("Recording attached!");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Could not load recording");
    } finally {
      setLoadingRecordingByCard(prev => ({ ...prev, [fc.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Routine not found</p>
      </div>
    );
  }

  const currentCard = flashcards[currentStep];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#E0F7F7] font-inter pb-12">
        <Navigation />

        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-lg">
            <Button
              variant="ghost"
              onClick={() => navigate("/caregiver")}
              className="mb-4 gap-2 font-fredoka text-slate-600 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('routine.backToDashboard')}
            </Button>

            <div className="space-y-6">
              {/* Header Section (Image 2 style) */}
              <div className="text-center animate-fade-in-down mb-8">
                <div className="text-6xl mb-4 animate-float">{routine.icon}</div>
                <h1 className="text-3xl font-fredoka text-slate-900 mb-1">{routine.title}</h1>
                <p className="text-primary font-fredoka">{routine.category}</p>

                {/* Sun character emoji for consistency with Image 2 */}
                <div className="mt-6 text-5xl animate-pulse-slow">😊</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center animate-bounce-in">
                <Button
                  variant="outline"
                  onClick={() => setScheduleDialogOpen(true)}
                  className="rounded-2xl h-12 px-6 font-fredoka border-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {existingSchedule ? t('routine.editSchedule') : t('routine.addSchedule')}
                </Button>
                <Button
                  onClick={() => navigate('/child')}
                  className="rounded-2xl h-12 px-6 font-fredoka shadow-vibrant"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Start Routine
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => navigate(`/test/${id}`)}
                >
                  Take test
                </Button>
              </div>

              {flashcards.length === 0 ? (
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white/50">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">{t('routine.noSteps')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <RoutineIntelligenceIndicator cameraActive={false} />
                  {/* Monthly Report / Progress Style (Image 2) */}
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border-b-4 border-orange-100 animate-slide-in-up">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-fredoka text-slate-800">Routine Progress</h3>
                      <IntelligenceBadge />
                    </div>
                    <EngagementSnippet lastEngagementScore={lastEngagementForRoutine} className="mb-2" />
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-500 font-fredoka">
                        {Math.round(((currentStep + 1) / flashcards.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 transition-all duration-700"
                        style={{ width: `${((currentStep + 1) / flashcards.length) * 100}%` }}
                      />
                    </div>
                    <ProgressAnalyticsBlock
                      currentStep={currentStep}
                      totalSteps={flashcards.length}
                      lastEngagementScore={lastEngagementForRoutine}
                      className="mt-4"
                    />
                  </div>

                  {/* Main Flashcard View */}
                  <Card className="rounded-[2.5rem] border-none shadow-vibrant overflow-hidden animate-scale-in">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-fredoka text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          Step {currentStep + 1} of {flashcards.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => speak(`${currentCard.title}. ${currentCard.description}`)}
                          className="rounded-full text-primary hover:bg-primary/5"
                        >
                          <Volume2 className="w-5 h-5" />
                        </Button>
                      </div>

                      <h2 className="text-2xl font-fredoka text-slate-900">{currentCard.title}</h2>
                      <p className="text-slate-600 leading-relaxed">{currentCard.description}</p>

                      <div className="flex flex-col gap-3">
                        {currentCard.video_url && (
                          <div className="rounded-2xl overflow-hidden shadow-cartoon border-2 border-white mt-2">
                            <video
                              src={currentCard.video_url}
                              controls
                              playsInline
                              className="w-full"
                            />
                          </div>
                        )}
                        {!currentCard.video_url && (
                          <Button
                            variant="outline"
                            className="rounded-2xl h-12 font-fredoka w-full border-2 border-primary/30 text-primary hover:bg-primary/5"
                            disabled={!!loadingRecordingByCard[currentCard.id]}
                            onClick={() => handleUseRecording(currentCard)}
                          >
                            <Film className={`w-4 h-4 mr-2 ${loadingRecordingByCard[currentCard.id] ? "animate-spin" : ""}`} />
                            {loadingRecordingByCard[currentCard.id] ? "Loading..." : "Use my recording"}
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="rounded-2xl h-12 font-fredoka w-full mt-2"
                          onClick={() => setShowPracticeModal(true)}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Practice
                        </Button>
                        <AITipSnippet />
                        <FlashcardIntelligenceSnippet
                          stepIndex={currentStep}
                          totalSteps={flashcards.length}
                          className="mt-4"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                          className="flex-1 rounded-xl h-12 font-fredoka text-slate-500"
                        >
                          Prev
                        </Button>
                        <Button
                          onClick={() => setCurrentStep(Math.min(flashcards.length - 1, currentStep + 1))}
                          disabled={currentStep === flashcards.length - 1}
                          className="flex-1 rounded-xl h-12 font-fredoka shadow-vibrant"
                        >
                          Next
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step Indicators */}
                  <div className="flex gap-2 justify-center flex-wrap pb-8">
                    {flashcards.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`transition-all duration-300 rounded-full ${index === currentStep
                          ? 'w-8 h-3 bg-primary'
                          : 'w-3 h-3 bg-white border-2 border-slate-200'
                          }`}
                        aria-label={`Go to step ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        {/* Inline playback for blob videos to avoid blank tab rendering issues */}
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{routine?.title ?? 'Routine'} Video</DialogTitle>
              <DialogDescription>
                Your generated AI-style video.
              </DialogDescription>
            </DialogHeader>
            {routine?.video_url && (
              <video
                src={routine.video_url}
                controls
                autoPlay
                playsInline
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Practice modal */}
        {showPracticeModal && currentCard && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-in">
              <h3 className="text-lg font-fredoka mb-4">Practice: {currentCard.title}</h3>
              <WebcamComponent
                activityLabel="Practice"
                onPracticeComplete={handlePracticeComplete}
                onSkip={() => setShowPracticeModal(false)}
              />
            </div>
          </div>
        )}

        {/* Session summary after practice */}
        {showSessionSummary && lastPracticeMetrics && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="w-full max-w-sm">
              <SessionSummaryCard
                metrics={lastPracticeMetrics}
                onContinue={() => {
                  setShowSessionSummary(false);
                  setLastPracticeMetrics(null);
                }}
              />
            </div>
          </div>
        )}

        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('routine.scheduleRoutine')}</DialogTitle>
              <DialogDescription>
                {t('routine.scheduleDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="time">{t('routine.time')}</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('routine.daysOfWeek')}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="cursor-pointer text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveSchedule} className="w-full hover-scale">
                {t('routine.saveSchedule')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
