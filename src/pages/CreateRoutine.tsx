import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Sparkles, Wand2, Library, Sun, Moon, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { demoStore } from "@/integrations/demo/store";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Flashcard {
  title: string;
  description: string;
  icon?: string;
}

interface DefaultRoutine {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string | null;
  flashcards: Array<Flashcard>;
}

const PRESET_MORNING =
  "Morning routine for a child: waking up, brushing teeth, getting dressed, eating breakfast. Create 4-5 simple, encouraging steps with clear titles and short descriptions.";
const PRESET_NIGHT =
  "Bedtime routine for a child: put on pajamas, brush teeth, read a book, turn off lights. Create 4-5 simple, encouraging steps with clear titles and short descriptions.";
const PRESET_SCHOOL =
  "Getting ready for school: wake up, get dressed, eat breakfast, brush teeth, pack backpack, put on shoes. Create 5-6 simple steps for a child.";

export default function CreateRoutine() {
  const navigate = useNavigate();
  const demoMode = (String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === 'true') || !isSupabaseConfigured;
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [routineCategory, setRoutineCategory] = useState("");
  const [routineIcon, setRoutineIcon] = useState("✨");
  const [routineDescription, setRoutineDescription] = useState("");
  const [videoSource, setVideoSource] = useState<"youtube" | "ai">("youtube");
  const [videoUrl, setVideoUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [defaultRoutines, setDefaultRoutines] = useState<DefaultRoutine[]>([]);
  const [flashcards, setFlashcards] = useState<Array<Flashcard>>([
    { title: "", description: "", icon: "📝" }
  ]);

  const fetchDefaultRoutines = useCallback(async () => {
    // In demo mode, provide some colorful defaults locally
    if (demoMode) {
      const localDefaults: DefaultRoutine[] = [
        {
          id: "demo-morning",
          title: "Morning Routine",
          category: "Daily",
          icon: "🌞",
          description: "Start the day with simple steps",
          flashcards: [
            { title: "Wake up", description: "Open eyes and stretch", icon: "⏰" },
            { title: "Brush Teeth", description: "Use toothbrush and toothpaste", icon: "🪥" },
            { title: "Get Dressed", description: "Put on clothes", icon: "👕" },
          ],
        },
        {
          id: "demo-daily-essentials",
          title: "Daily Essential Routine",
          category: "Mastery",
          icon: "🌟",
          description: "All the key tasks for a perfect day",
          flashcards: [
            { title: "Wake up", description: "Open your eyes and sit up in bed", icon: "⏰" },
            { title: "Brush teeth flashcard", description: "Use your toothbrush and toothpaste", icon: "🪥" },
            { title: "Change clothes", description: "Put on your favorite outfit", icon: "👕" },
            { title: "Eat breakfast", description: "Enjoy a healthy meal", icon: "🍳" },
            { title: "Read a book", description: "Pick a fun story to read", icon: "📚" },
            { title: "Night clothes", description: "Get ready for a good sleep", icon: "🌙" },
          ],
        },
        {
          id: "demo-bedtime",
          title: "Bedtime Routine",
          category: "Daily",
          icon: "🌙",
          description: "Wind down for a good sleep",
          flashcards: [
            { title: "Put on pajamas", description: "Change into comfy PJs", icon: "🛌" },
            { title: "Brush Teeth", description: "Brush for two minutes", icon: "🪥" },
            { title: "Read a book", description: "Pick a favorite story", icon: "📚" },
          ],
        },
      ];
      setDefaultRoutines(localDefaults);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("default_routines")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const typedData = (data || []).map(routine => ({
        ...routine,
        flashcards: routine.flashcards as unknown as Array<Flashcard>
      }));

      setDefaultRoutines(typedData);
    } catch (error: unknown) {
      console.error("Error fetching default routines:", error);
    }
  }, [demoMode]);

  useEffect(() => {
    fetchDefaultRoutines();
  }, [fetchDefaultRoutines]);

  const addFlashcard = () => {
    setFlashcards([...flashcards, { title: "", description: "", icon: "📝" }]);
  };

  const removeFlashcard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const updateFlashcard = (index: number, field: "title" | "description" | "icon", value: string) => {
    const updated = [...flashcards];
    updated[index][field] = value;
    setFlashcards(updated);
  };

  const handleGenerateFlashcards = async (promptOverride?: string) => {
    const prompt = (promptOverride ?? aiPrompt).trim();
    if (!prompt) {
      toast.error("Please enter a prompt for AI generation");
      return;
    }

    setIsGenerating(true);
    try {
      if (demoMode) {
        // Local fallback when Supabase/AI is not available: split prompt into steps (commas, newlines, periods)
        const parts = prompt
          .split(/[,.\n;]+/)
          .map(s => s.trim())
          .filter(Boolean)
          .slice(0, 8);
        const generated: Flashcard[] = parts.length
          ? parts.map((p, i) => {
            const short = p.length > 32 ? p.slice(0, 29) + "…" : p;
            return {
              title: short,
              description: `Step ${i + 1}: ${p}`,
              icon: ["⏰", "🪥", "👕", "🍳", "📚", "🛌", "✨", "🌟"][i] ?? "✨",
            };
          })
          : [
            { title: "Step 1", description: "Describe the first step", icon: "✨" },
            { title: "Step 2", description: "Describe the second step", icon: "✨" },
          ];
        setFlashcards(generated);
        toast.success("Flashcards generated successfully!");
      } else {
        const { data, error } = await supabase.functions.invoke("generate-flashcards", {
          body: { prompt, numFlashcards: 8 }
        });

        if (error) {
          throw new Error(error.message || "Failed to reach AI service");
        }
        if (data?.error) {
          throw new Error(typeof data.error === "string" ? data.error : "AI service error");
        }
        const list = Array.isArray(data?.flashcards) ? data.flashcards : null;
        if (!list?.length) {
          throw new Error("AI didn't return any steps. Try a different prompt or try again.");
        }
        setFlashcards(list);
        toast.success("Flashcards generated successfully!");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate flashcards";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddDefaultRoutine = async (routine: DefaultRoutine) => {
    setIsLoading(true);

    try {
      if (demoMode) {
        const created = demoStore.addRoutine(
          {
            title: routine.title,
            category: routine.category,
            icon: routine.icon,
            description: routine.description,
            video_url: null,
          },
          routine.flashcards
        );
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Not signed in: add to demo store so user can still use routines and step videos
          const created = demoStore.addRoutine(
            {
              title: routine.title,
              category: routine.category,
              icon: routine.icon,
              description: routine.description,
              video_url: null,
            },
            routine.flashcards
          );
          toast.success("Default routine added successfully!");
          navigate("/caregiver");
          return;
        }

        const { data: newRoutine, error: routineError } = await supabase
          .from("routines")
          .insert({
            user_id: user.id,
            title: routine.title,
            category: routine.category,
            icon: routine.icon,
            description: routine.description,
          })
          .select()
          .single();

        if (routineError) throw routineError;

        const flashcardsData = routine.flashcards.map((card, index) => ({
          routine_id: newRoutine.id,
          step_number: index + 1,
          title: card.title,
          description: card.description,
        }));

        const { error: flashcardsError } = await supabase
          .from("flashcards")
          .insert(flashcardsData);

        if (flashcardsError) throw flashcardsError;
      }

      toast.success("Default routine added successfully!");
      navigate("/caregiver");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to add routine");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!routineName.trim()) {
      toast.error("Please enter a routine name");
      return;
    }
    if (!routineCategory.trim()) {
      toast.error("Please enter a category");
      return;
    }
    if (flashcards.length === 0 || !flashcards.some(f => f.title.trim())) {
      toast.error("Please add at least one flashcard");
      return;
    }

    setIsLoading(true);

    try {
      if (demoMode) {
        const created = demoStore.addRoutine(
          {
            title: routineName,
            category: routineCategory,
            icon: routineIcon,
            description: routineDescription || null,
            video_url: videoSource === "youtube" ? (videoUrl || null) : null,
          },
          flashcards.filter(f => f.title.trim())
        );
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Not signed in: add to demo store so user can still use routines and step videos
          demoStore.addRoutine(
            {
              title: routineName,
              category: routineCategory,
              icon: routineIcon,
              description: routineDescription || null,
              video_url: videoSource === "youtube" ? (videoUrl || null) : null,
            },
            flashcards.filter(f => f.title.trim())
          );
          toast.success("Routine created successfully!");
          navigate("/caregiver");
          return;
        }

        const { data: routine, error: routineError } = await supabase
          .from("routines")
          .insert({
            user_id: user.id,
            title: routineName,
            category: routineCategory,
            icon: routineIcon,
            description: routineDescription,
            video_url: videoSource === "youtube" ? videoUrl || null : null,
          })
          .select()
          .single();

        if (routineError) throw routineError;

        const flashcardsData = flashcards
          .filter(f => f.title.trim())
          .map((card, index) => ({
            routine_id: routine.id,
            step_number: index + 1,
            title: card.title,
            description: card.description,
            icon: card.icon || "📝"
          }));

        const { error: flashcardsError } = await supabase
          .from("flashcards")
          .insert(flashcardsData)
          .select();

        if (flashcardsError) throw flashcardsError;
      }

      toast.success("Routine created successfully!");
      navigate("/caregiver");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create routine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background font-inter pb-20">
        <Navigation />

        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-2xl">
            <Card className="rounded-[2.5rem] border-none shadow-vibrant overflow-hidden relative">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
              <CardHeader className="relative text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-fredoka text-slate-900">
                  Create Routine
                </CardTitle>
                <CardDescription className="text-base text-slate-500 font-medium max-w-sm mx-auto">
                  Design a playful learning experience for your child ✨
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 relative">
                <Tabs defaultValue="default" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto bg-muted/30 p-1.5 rounded-2xl mb-8 shadow-inner">
                    <TabsTrigger value="default" className="gap-2 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-fredoka">
                      <Library className="w-4 h-4" />
                      Library
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="gap-2 py-3 rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-fredoka">
                      <Plus className="w-4 h-4" />
                      Manual
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="gap-2 py-3 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-fredoka">
                      <Wand2 className="w-4 h-4" />
                      AI Magic
                    </TabsTrigger>
                  </TabsList>

                  {/* Default Routines Tab */}
                  <TabsContent value="default" className="space-y-6 mt-0 animate-scale-in">
                    <div className="grid grid-cols-1 gap-6">
                      {defaultRoutines.map((routine, index) => (
                        <div
                          key={routine.id}
                          className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-transparent hover:border-primary/20 transition-all hover:shadow-md cursor-pointer group"
                          onClick={() => handleAddDefaultRoutine(routine)}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center text-4xl shadow-cartoon shrink-0 group-hover:scale-110 transition-transform">
                              {routine.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-fredoka text-slate-800">{routine.title}</h3>
                              <p className="text-sm text-slate-500 mb-3 truncate">{routine.description}</p>
                              <div className="flex gap-2">
                                {routine.flashcards.slice(0, 3).map((f, i) => (
                                  <span key={i} className="text-lg" title={f.title}>{f.icon}</span>
                                ))}
                                <span className="text-xs font-bold text-primary self-end">+{routine.flashcards.length} steps</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              <Plus className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Manual Tab */}
                  <TabsContent value="manual" className="space-y-8 mt-0 animate-scale-in">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="routineName" className="font-fredoka text-slate-700 ml-1 font-semibold">Routine Name</Label>
                          <Input
                            id="routineName"
                            placeholder="e.g., Morning Adventure"
                            value={routineName}
                            onChange={(e) => setRoutineName(e.target.value)}
                            className="h-14 rounded-2xl border-2 border-muted focus:border-primary shadow-sm"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="routineCategory" className="font-fredoka text-slate-700 ml-1 font-semibold">Category</Label>
                          <Input
                            id="routineCategory"
                            placeholder="e.g., Daily Habit"
                            value={routineCategory}
                            onChange={(e) => setRoutineCategory(e.target.value)}
                            className="h-14 rounded-2xl border-2 border-muted focus:border-primary shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="routineDescription" className="font-fredoka text-slate-700 ml-1 font-semibold">Description</Label>
                        <Textarea
                          id="routineDescription"
                          placeholder="What is this routine about?"
                          value={routineDescription}
                          onChange={(e) => setRoutineDescription(e.target.value)}
                          className="rounded-2xl border-2 border-muted focus:border-primary shadow-sm min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-6 pt-4 border-t-2 border-dashed border-muted">
                        <div className="flex items-center justify-between">
                          <h3 className="font-fredoka text-xl text-slate-800">Steps</h3>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addFlashcard}
                            className="rounded-xl h-10 font-fredoka border-2 border-primary/20 text-primary hover:bg-primary/5"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Step
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {flashcards.map((card, index) => (
                            <div key={index} className="bg-muted/10 rounded-[2rem] p-6 relative group animate-slide-in-up">
                              {flashcards.length > 1 && (
                                <button
                                  onClick={() => removeFlashcard(index)}
                                  className="absolute top-4 right-4 text-slate-400 hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                              <div className="flex gap-4">
                                <div className="space-y-2 shrink-0">
                                  <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1">Icon</Label>
                                  <Input
                                    value={card.icon || "✨"}
                                    onChange={(e) => updateFlashcard(index, "icon", e.target.value)}
                                    className="w-16 h-16 text-center text-3xl p-0 rounded-2xl border-2 border-white shadow-cartoon bg-white"
                                    maxLength={2}
                                  />
                                </div>
                                <div className="flex-1 space-y-4">
                                  <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1">Step Title</Label>
                                    <Input
                                      placeholder="What to do?"
                                      value={card.title}
                                      onChange={(e) => updateFlashcard(index, "title", e.target.value)}
                                      className="h-10 rounded-xl border-none shadow-inner bg-white/80"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1">Quick Instruction</Label>
                                    <Textarea
                                      placeholder="Add a simple description..."
                                      value={card.description}
                                      onChange={(e) => updateFlashcard(index, "description", e.target.value)}
                                      className="rounded-xl border-none shadow-inner bg-white/80 min-h-[80px]"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-8">
                        <Button
                          onClick={handleCreateRoutine}
                          disabled={isLoading}
                          className="flex-1 rounded-2xl h-14 font-fredoka text-lg shadow-vibrant"
                        >
                          {isLoading ? "Saving..." : "Create Routine"}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/caregiver")}
                          disabled={isLoading}
                          className="rounded-2xl h-14 font-fredoka text-slate-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* AI Generated Tab */}
                  <TabsContent value="ai" className="space-y-8 mt-0 animate-scale-in">
                    <div className="space-y-6">
                      <div className="bg-accent/5 p-6 rounded-[2rem] border-2 border-dashed border-accent/20">
                        <Label htmlFor="aiPrompt" className="block font-fredoka text-slate-800 text-lg mb-2 ml-1">
                          Describe any routine you want
                        </Label>
                        <p className="text-sm text-slate-500 mb-3 ml-1">
                          Morning, bedtime, school, chores, or anything else — type it below and we&apos;ll turn it into steps.
                        </p>
                        <Textarea
                          id="aiPrompt"
                          placeholder="e.g. After-school routine: snack, homework, playtime, dinner. Or: Getting ready for school in 5 steps. Or: Weekend chore routine for kids."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="rounded-2xl border-2 border-white bg-white/80 shadow-inner min-h-[120px] mb-4 focus:ring-accent"
                        />
                        <Button
                          onClick={() => handleGenerateFlashcards()}
                          disabled={isGenerating || !aiPrompt.trim()}
                          className="w-full h-14 rounded-2xl font-fredoka text-lg shadow-cartoon bg-accent hover:bg-accent/90 mb-5"
                        >
                          <Wand2 className={`w-6 h-6 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                          {isGenerating ? "Magic in Progress..." : "Generate with AI"}
                        </Button>
                        <Label className="block font-fredoka text-slate-600 text-sm mb-2 ml-1">
                          Quick presets (optional)
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAiPrompt(PRESET_MORNING);
                              handleGenerateFlashcards(PRESET_MORNING);
                            }}
                            disabled={isGenerating}
                            className="rounded-xl font-fredoka border-2 border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100 hover:border-amber-300"
                          >
                            <Sun className="w-4 h-4 mr-1.5" />
                            Morning
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAiPrompt(PRESET_NIGHT);
                              handleGenerateFlashcards(PRESET_NIGHT);
                            }}
                            disabled={isGenerating}
                            className="rounded-xl font-fredoka border-2 border-indigo-200 bg-indigo-50/80 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-300"
                          >
                            <Moon className="w-4 h-4 mr-1.5" />
                            Night
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAiPrompt(PRESET_SCHOOL);
                              handleGenerateFlashcards(PRESET_SCHOOL);
                            }}
                            disabled={isGenerating}
                            className="rounded-xl font-fredoka border-2 border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300"
                          >
                            <BookOpen className="w-4 h-4 mr-1.5" />
                            School
                          </Button>
                        </div>
                      </div>

                      {flashcards.length > 0 && flashcards[0].title && (
                        <div className="space-y-6 animate-scale-in">
                          <h3 className="font-fredoka text-xl text-slate-800 ml-1">Review Generated Steps</h3>
                          <div className="space-y-4">
                            {flashcards.map((card, index) => (
                              <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border-2 border-accent/10 flex gap-4 items-center">
                                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-cartoon border-b-4 border-accent/20">
                                  {card.icon || "✨"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-fredoka text-slate-800 leading-tight">{card.title}</p>
                                  <p className="text-xs text-slate-500 truncate">{card.description}</p>
                                </div>
                                <div className="text-accent">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={handleCreateRoutine}
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl font-fredoka text-lg shadow-vibrant bg-primary"
                          >
                            Save All Steps
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
