const KEY = "rb_demo_planner_events";

export interface DemoPlannerEvent {
  id: string;
  title: string;
  scheduled_at: string;
  activity_type: string | null;
  repeat_option: string;
  created_at: string;
  updated_at: string;
}

function read(): DemoPlannerEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(list: DemoPlannerEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const demoPlannerEvents = {
  getInRange(from: Date, to: Date): DemoPlannerEvent[] {
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
    return read().filter(
      (e) => e.scheduled_at >= fromStr && e.scheduled_at <= toStr
    );
  },

  add(input: {
    title: string;
    scheduled_at: string;
    activity_type?: string | null;
    repeat_option?: string;
  }): DemoPlannerEvent {
    const event: DemoPlannerEvent = {
      id: crypto.randomUUID(),
      title: input.title,
      scheduled_at: input.scheduled_at,
      activity_type: input.activity_type ?? null,
      repeat_option: input.repeat_option ?? "none",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const list = read();
    list.push(event);
    write(list);
    return event;
  },

  update(
    id: string,
    updates: Partial<Pick<DemoPlannerEvent, "title" | "scheduled_at" | "activity_type" | "repeat_option">>
  ) {
    const list = read();
    const i = list.findIndex((e) => e.id === id);
    if (i === -1) return;
    list[i] = { ...list[i], ...updates, updated_at: new Date().toISOString() };
    write(list);
  },

  delete(id: string) {
    write(read().filter((e) => e.id !== id));
  },
};
