import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  BookOpen,
  Clock,
  Heart,
  Trash2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { demoStore } from "@/integrations/demo/store";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { AIInsightPanel } from "@/components/intelligence/AIInsightPanel";
import { IntelligenceBadge } from "@/components/intelligence/IntelligenceBadge";
import { getLastPracticeResults } from "@/lib/practiceResults";
import { demoPracticeResults } from "@/lib/demoPracticeResults";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Routine {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string | null;
  flashcards: { id: string }[];
}

export default function Caregiver() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insightSessions, setInsightSessions] = useState<[{ engagement_score: number } | null, { engagement_score: number } | null]>([null, null]);
  const demoMode = String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === 'true' || !isSupabaseConfigured;
  const [last, prev] = insightSessions;

  const fetchRoutines = async () => {
    try {
      // Use demo store when in demo mode OR when Supabase is configured but user is not signed in
      // (routines added via "Add default routine" without login go to demo store)
      const useDemoStore = demoMode || !user;
      if (useDemoStore) {
        const items = demoStore.getRoutines().map(r => ({
          id: r.id,
          title: r.title,
          category: r.category,
          icon: r.icon,
          description: r.description,
          flashcards: Array.from({ length: r.flashcardsCount }, (_, i) => ({ id: `${r.id}-fc-${i}` })),
        }));
        setRoutines(items);
      } else {
        const { data, error } = await supabase
          .from("routines")
          .select(`
            *,
            flashcards(id)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRoutines(data || []);
      }
    } catch (error: unknown) {
      const message = (error as Error)?.message || "Failed to load routines";
      toast.error(message);
      console.error("Error loading routines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [user]);

  useEffect(() => {
    if (demoMode) {
      const list = demoPracticeResults.getLast(2);
      setInsightSessions([
        list[0] ?? null,
        list[1] ?? null,
      ]);
    } else if (user?.id) {
      getLastPracticeResults(user.id, 2).then((list) => {
        setInsightSessions([
          list[0] ?? null,
          list[1] ?? null,
        ]);
      });
    } else {
      setInsightSessions([null, null]);
    }
  }, [demoMode, user?.id]);

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;

    const useDemoStore = demoMode || !user;
    try {
      if (useDemoStore) {
        demoStore.deleteRoutine(routineToDelete);
        toast.success("Routine deleted successfully");
        setRoutines(routines.filter(r => r.id !== routineToDelete));
      } else {
        const { error } = await supabase
          .from("routines")
          .delete()
          .eq("id", routineToDelete);

        if (error) throw error;

        toast.success("Routine deleted successfully");
        setRoutines(routines.filter(r => r.id !== routineToDelete));
      }
    } catch (error: unknown) {
      const message = (error as Error)?.message || "Failed to delete routine";
      toast.error(message);
    } finally {
      setDeleteDialogOpen(false);
      setRoutineToDelete(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background font-inter pb-20">
        <Navigation />

        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-lg">
            {/* Header / Search Bar Section (Image 1 top) */}
            <div className="mb-6 animate-fade-in-down">
              <div className="relative mb-6">
                <Input
                  placeholder="Search routines..."
                  className="rounded-2xl border-2 border-muted h-14 pl-12 shadow-cartoon bg-white focus:ring-primary"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Plus className="w-5 h-5 rotate-45" /> {/* Using Plus rotated as a search-ish icon for style */}
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-fredoka text-slate-900">
                    Good Afternoon!
                  </h1>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center animate-wiggle-slow">
                  <Heart className="w-6 h-6 text-orange-500 fill-orange-500/20" />
                </div>
              </div>
            </div>

            {/* Hero Promo Banner (Image 1 center) */}
            <div className="mb-10 animate-scale-in">
              <div className="bg-secondary rounded-[2rem] p-6 text-white relative overflow-hidden shadow-vibrant">
                <div className="relative z-10 max-w-[60%]">
                  <h2 className="text-xl font-fredoka mb-3 leading-tight">
                    Educate Theme Right
                  </h2>
                  <Button variant="outline" className="bg-white text-secondary border-none rounded-xl h-9 text-xs font-bold hover:bg-white/90">
                    Learn More
                  </Button>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-20 bg-white rounded-full" />
                <div className="absolute right-4 bottom-4 text-6xl animate-float-slow">
                  📖
                </div>
              </div>
            </div>

            {/* AI Insight Panel */}
            <div className="mb-6">
              <AIInsightPanel
                lastSession={last}
                previousSession={prev}
                sessionCount={[last, prev].filter(Boolean).length}
              />
            </div>

            {/* Chelid Activity Section (Image 1 horizontal scroll) */}
            <section className="mb-10 animate-slide-in-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-fredoka">Chelid Activity</h3>
                <Button variant="link" className="text-primary font-fredoka text-sm">View All</Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="min-w-[160px] h-32 bg-muted/30 rounded-3xl animate-pulse" />
                  ))
                ) : routines.length === 0 ? (
                  <div className="w-full text-center py-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted text-muted-foreground text-sm">
                    No activities yet. Click + to start!
                  </div>
                ) : (
                  routines.slice(0, 4).map((routine, i) => (
                    <div
                      key={routine.id}
                      onClick={() => navigate(`/routine/${routine.id}`)}
                      className={`min-w-[160px] p-4 rounded-3xl flex flex-col justify-between cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-cartoon ${i % 3 === 0 ? 'bg-orange-400 text-white' : i % 3 === 1 ? 'bg-indigo-500 text-white' : 'bg-teal-500 text-white'
                        }`}
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                        {routine.icon}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-4">
                        <p className="font-fredoka text-sm leading-tight truncate flex-1">
                          {routine.title}
                        </p>
                        <IntelligenceBadge className="shrink-0 text-[10px] px-1.5 py-0 bg-white/20 border-white/30" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Popular This Week Section (Image 1 vertical list) */}
            <section className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-fredoka">Popular This Week!</h3>
                <Button variant="link" className="text-primary font-fredoka text-sm">View All</Button>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted/30 rounded-3xl animate-pulse" />
                  ))
                ) : (
                  routines.map((routine) => (
                    <div
                      key={routine.id}
                      onClick={() => navigate(`/routine/${routine.id}`)}
                      className="bg-accent/5 p-4 rounded-3xl border-2 border-transparent hover:border-accent/20 transition-all flex items-center gap-4 group cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-cartoon shrink-0">
                        {routine.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-fredoka text-slate-800 truncate">{routine.title}</h4>
                          <IntelligenceBadge />
                        </div>
                        <p className="text-muted-foreground text-xs">{routine.category}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] py-0 px-2 rounded-full">
                            {routine.flashcards?.length || 0} Chapters
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground group-hover:text-primary group-hover:bg-primary/5">
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>

        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={() => navigate("/create-routine")}
            className="w-14 h-14 rounded-full shadow-vibrant hover:scale-110 active:scale-95 transition-all p-0"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
