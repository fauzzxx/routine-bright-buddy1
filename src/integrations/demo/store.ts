// Simple localStorage-backed demo store so the app can run without sign-in/sign-up
// Data model: routines, flashcards, schedules

export type DemoFlashcard = {
  id: string;
  routine_id: string;
  step_number: number;
  title: string;
  description: string;
  icon?: string;
  image_url?: string | null;
  video_url?: string | null;
};

export type DemoRoutine = {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string | null;
  video_url?: string | null;
};

export type DemoSchedule = {
  id: string;
  routine_id: string;
  scheduled_time: string; // HH:MM
  days_of_week: number[]; // 0-6
  is_active: boolean;
};

type DemoData = {
  routines: DemoRoutine[];
  flashcards: DemoFlashcard[];
  schedules: DemoSchedule[];
};

const STORAGE_KEY = "rb_demo_data";

function read(): DemoData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { routines: [], flashcards: [], schedules: [] };
  }
  try {
    return JSON.parse(raw) as DemoData;
  } catch {
    return { routines: [], flashcards: [], schedules: [] };
  }
}

function write(data: DemoData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const demoStore = {
  getRoutines(): (DemoRoutine & { flashcardsCount: number })[] {
    const data = read();
    return data.routines.map(r => ({
      ...r,
      flashcardsCount: data.flashcards.filter(f => f.routine_id === r.id).length,
    }));
  },

  getRoutineById(id: string): { routine: DemoRoutine | null; flashcards: DemoFlashcard[] } {
    const data = read();
    const routine = data.routines.find(r => r.id === id) || null;
    const flashcards = data.flashcards
      .filter(f => f.routine_id === id)
      .sort((a, b) => a.step_number - b.step_number);
    return { routine, flashcards };
  },

  addRoutine(input: {
    title: string;
    category: string;
    icon: string;
    description: string | null;
    video_url?: string | null;
  }, flashcards: Array<{ title: string; description: string; icon?: string }>) {
    const data = read();
    const id = crypto.randomUUID();
    const routine: DemoRoutine = {
      id,
      title: input.title,
      category: input.category,
      icon: input.icon,
      description: input.description,
      video_url: input.video_url ?? null,
    };
    const fc: DemoFlashcard[] = flashcards.map((c, i) => ({
      id: crypto.randomUUID(),
      routine_id: id,
      step_number: i + 1,
      title: c.title,
      description: c.description,
      icon: c.icon ?? "📝",
      image_url: null,
      video_url: null,
    }));
    data.routines.push(routine);
    data.flashcards.push(...fc);
    write(data);
    return routine;
  },

  deleteRoutine(id: string) {
    const data = read();
    data.routines = data.routines.filter(r => r.id !== id);
    data.flashcards = data.flashcards.filter(f => f.routine_id !== id);
    data.schedules = data.schedules.filter(s => s.routine_id !== id);
    write(data);
  },

  setRoutineVideoUrl(id: string, url: string | null) {
    const data = read();
    const r = data.routines.find(r => r.id === id);
    if (r) {
      r.video_url = url;
      write(data);
    }
  },

  getScheduleByRoutineId(id: string): DemoSchedule | null {
    const data = read();
    return data.schedules.find(s => s.routine_id === id) || null;
  },

  upsertSchedule(routine_id: string, schedule: Omit<DemoSchedule, "id" | "routine_id">) {
    const data = read();
    const existingIndex = data.schedules.findIndex(s => s.routine_id === routine_id);
    if (existingIndex >= 0) {
      data.schedules[existingIndex] = {
        ...data.schedules[existingIndex],
        scheduled_time: schedule.scheduled_time,
        days_of_week: schedule.days_of_week,
        is_active: schedule.is_active,
      };
    } else {
      data.schedules.push({
        id: crypto.randomUUID(),
        routine_id,
        scheduled_time: schedule.scheduled_time,
        days_of_week: schedule.days_of_week,
        is_active: schedule.is_active,
      });
    }
    write(data);
  },

  getScheduledRoutinesForDay(day: number): (DemoRoutine & { flashcards: DemoFlashcard[] })[] {
    const data = read();
    const activeSchedules = data.schedules.filter(s => s.is_active && s.days_of_week.includes(day));
    const routines = activeSchedules
      .map(s => data.routines.find(r => r.id === s.routine_id))
      .filter((r): r is DemoRoutine => Boolean(r));
    return routines.map(r => ({
      ...r,
      flashcards: data.flashcards
        .filter(f => f.routine_id === r.id)
        .sort((a, b) => a.step_number - b.step_number),
    }));
  },

  getAllScheduledRoutines(): (DemoRoutine & { flashcards: DemoFlashcard[] })[] {
    const data = read();
    const activeSchedules = data.schedules.filter(s => s.is_active);
    // Deduplicate routines if multiple schedules exist for same routine? 
    // Usually 1 schedule per routine.
    const routines = activeSchedules
      .map(s => data.routines.find(r => r.id === s.routine_id))
      .filter((r): r is DemoRoutine => Boolean(r));

    // De-dupe by id just in case
    const uniqueRoutines = Array.from(new Map(routines.map(item => [item.id, item])).values());

    return uniqueRoutines.map(r => ({
      ...r,
      flashcards: data.flashcards
        .filter(f => f.routine_id === r.id)
        .sort((a, b) => a.step_number - b.step_number),
    }));
  },
};