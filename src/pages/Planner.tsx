import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  fetchPlannerEvents,
  insertPlannerEvent,
  deletePlannerEvent,
  type PlannerEvent,
} from "@/lib/plannerEvents";
import {
  demoPlannerEvents,
  type DemoPlannerEvent,
} from "@/lib/demoPlannerEvents";

type EventRow = PlannerEvent | DemoPlannerEvent;

export default function Planner() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [repeatOption, setRepeatOption] = useState("none");
  const demoMode =
    String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === "true" ||
    !isSupabaseConfigured;

  const load = useCallback(async () => {
    setLoading(true);
    const rangeFrom = startOfMonth(month);
    const rangeTo = endOfMonth(month);
    if (demoMode) {
      setEvents(demoPlannerEvents.getInRange(rangeFrom, rangeTo));
    } else if (user?.id) {
      const list = await fetchPlannerEvents(user.id, rangeFrom, rangeTo);
      setEvents(list);
    } else {
      setEvents([]);
    }
    setLoading(false);
  }, [demoMode, user?.id, month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const t = title.trim();
    if (!t || !scheduledAt) {
      toast.error("Title and date/time required");
      return;
    }
    const dt = new Date(scheduledAt);
    const iso = dt.toISOString();
    if (demoMode) {
      demoPlannerEvents.add({
        title: t,
        scheduled_at: iso,
        repeat_option: repeatOption,
      });
      toast.success("Added");
      setAddOpen(false);
      setTitle("");
      setScheduledAt("");
      setRepeatOption("none");
      load();
    } else if (user?.id) {
      const res = await insertPlannerEvent(user.id, {
        title: t,
        scheduled_at: iso,
        repeat_option: repeatOption,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Added");
      setAddOpen(false);
      setTitle("");
      setScheduledAt("");
      setRepeatOption("none");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (demoMode) {
      demoPlannerEvents.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } else {
      await deletePlannerEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background font-inter pb-20">
        <Navigation />
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-fredoka text-slate-900">Planner</h1>
              <Button
                size="sm"
                className="rounded-xl"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            <Card className="rounded-[2rem] border-2 border-muted/50 mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMonth(subMonths(month, 1))}
                  >
                    ←
                  </Button>
                  <span className="font-fredoka text-slate-800">
                    {format(month, "MMMM yyyy")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMonth(addMonths(month, 1))}
                  >
                    →
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  month={month}
                  onMonthChange={setMonth}
                  className="rounded-xl"
                />
              </CardContent>
            </Card>

            <h2 className="font-fredoka text-slate-800 mb-3">Events this month</h2>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : events.length === 0 ? (
              <div className="text-muted-foreground text-sm py-4">
                No events. Click Add to create one.
              </div>
            ) : (
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-muted group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ev.scheduled_at), "PPp")}
                        {ev.repeat_option !== "none" && ` · ${ev.repeat_option}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={() => handleDelete(ev.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add routine task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning routine"
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Date & time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Repeat</Label>
                <Select
                  value={repeatOption}
                  onValueChange={setRepeatOption}
                >
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={handleAdd}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
