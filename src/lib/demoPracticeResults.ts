const STORAGE_KEY = "rb_demo_practice_results";

export interface DemoPracticeResult {
  engagement_score: number;
  created_at: string;
}

function read(): DemoPracticeResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(results: DemoPracticeResult[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export const demoPracticeResults = {
  add(engagementScore: number, motionScore: number, _responseTimeSec: number, totalTimeSec: number) {
    const list = read();
    list.unshift({
      engagement_score: Math.round((engagementScore + motionScore) / 2),
      created_at: new Date().toISOString(),
    });
    write(list.slice(0, 100));
  },

  getLast(limit: number = 2): DemoPracticeResult[] {
    return read().slice(0, limit);
  },

  getLastForRoutine(_routineId: string): { engagement_score: number } | null {
    const list = read();
    if (list.length === 0) return null;
    return { engagement_score: list[0].engagement_score };
  },
};
