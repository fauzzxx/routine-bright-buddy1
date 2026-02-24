const KEY = "rb_demo_tasks";

export interface DemoTask {
  id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

function read(): DemoTask[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(list: DemoTask[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const demoTasks = {
  getAll(): DemoTask[] {
    return read().sort((a, b) => a.order_index - b.order_index);
  },

  add(title: string): DemoTask {
    const list = read();
    const maxOrder = list.length ? Math.max(...list.map((t) => t.order_index)) : 0;
    const task: DemoTask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      order_index: maxOrder + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.push(task);
    write(list);
    return task;
  },

  update(id: string, updates: Partial<Pick<DemoTask, "title" | "completed" | "order_index">>) {
    const list = read();
    const i = list.findIndex((t) => t.id === id);
    if (i === -1) return;
    list[i] = { ...list[i], ...updates, updated_at: new Date().toISOString() };
    write(list);
  },

  delete(id: string) {
    write(read().filter((t) => t.id !== id));
  },
};
