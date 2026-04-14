// ── Type Definitions ──────────────────────────────────────────────────────────

export type JargonTerm = {
  term: string;
  plain_meaning: string;
  analogy?: string;
};

export type LearningPlanStep = {
  step_number: number;
  title: string;
  description: string;
  actionable_command?: string;
  tools_used: string[];
  jargon_terms?: JargonTerm[];
};

export type SavedLearningPlan = {
  id: string;                   // cuid-ish: timestamp + random
  app_type: string;
  cloud_provider: string;
  tools: string[];
  project_title: string;
  architecture_summary: string;
  steps: LearningPlanStep[];
  completed_steps: number[];    // step_number values that are done
  created_at: string;           // ISO string
  last_accessed: string;        // ISO string
};

export type InterviewCategoryResult = {
  category: string;
  total: number;
  excellent: number;
  good: number;
  needs_work: number;
};

export type SavedInterviewSession = {
  id: string;
  domain: "DevOps" | "MLOps";
  experience_level: string;
  duration_min: number;
  total_questions: number;
  answered: number;
  score_pct: number;
  category_results: InterviewCategoryResult[];
  completed_at: string;         // ISO string
};

export type UserStreak = {
  last_active_date: string;    // YYYY-MM-DD
  current_streak: number;
  longest_streak: number;
};

// ── Storage Keys ──────────────────────────────────────────────────────────────

const KEYS = {
  LEARNING_PLANS: "dk_learning_plans",
  INTERVIEW_SESSIONS: "dk_interview_sessions",
  USER_STREAK: "dk_user_streak",
};

// ── Generic helpers ───────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

// ── Learning Plans ────────────────────────────────────────────────────────────

export function getAllLearningPlans(): SavedLearningPlan[] {
  return read<SavedLearningPlan[]>(KEYS.LEARNING_PLANS, []);
}

export function saveLearningPlan(plan: Omit<SavedLearningPlan, "id" | "created_at" | "last_accessed" | "completed_steps">): SavedLearningPlan {
  const plans = getAllLearningPlans();
  const newPlan: SavedLearningPlan = {
    ...plan,
    id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    completed_steps: [],
    created_at: new Date().toISOString(),
    last_accessed: new Date().toISOString(),
  };
  write(KEYS.LEARNING_PLANS, [newPlan, ...plans].slice(0, 10)); // keep last 10
  return newPlan;
}

export function updateLearningPlanProgress(id: string, completed_steps: number[]): void {
  const plans = getAllLearningPlans().map(p =>
    p.id === id ? { ...p, completed_steps, last_accessed: new Date().toISOString() } : p
  );
  write(KEYS.LEARNING_PLANS, plans);
  touchStreak();
}

export function getLearningPlan(id: string): SavedLearningPlan | undefined {
  return getAllLearningPlans().find(p => p.id === id);
}

// ── Interview Sessions ────────────────────────────────────────────────────────

export function getAllInterviewSessions(): SavedInterviewSession[] {
  return read<SavedInterviewSession[]>(KEYS.INTERVIEW_SESSIONS, []);
}

export function saveInterviewSession(session: Omit<SavedInterviewSession, "id" | "completed_at">): SavedInterviewSession {
  const sessions = getAllInterviewSessions();
  const newSession: SavedInterviewSession = {
    ...session,
    id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    completed_at: new Date().toISOString(),
  };
  write(KEYS.INTERVIEW_SESSIONS, [newSession, ...sessions].slice(0, 20)); // keep last 20
  touchStreak();
  return newSession;
}

// ── Streak Tracking ───────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function touchStreak(): void {
  const today = todayStr();
  const streak = read<UserStreak>(KEYS.USER_STREAK, {
    last_active_date: "",
    current_streak: 0,
    longest_streak: 0,
  });

  if (streak.last_active_date === today) return; // already updated today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newCurrent = streak.last_active_date === yesterdayStr
    ? streak.current_streak + 1
    : 1;

  write(KEYS.USER_STREAK, {
    last_active_date: today,
    current_streak: newCurrent,
    longest_streak: Math.max(streak.longest_streak, newCurrent),
  });
}

export function getStreak(): UserStreak {
  return read<UserStreak>(KEYS.USER_STREAK, {
    last_active_date: "",
    current_streak: 0,
    longest_streak: 0,
  });
}

// ── Derived stats for Dashboard ───────────────────────────────────────────────

export function getLearningStats() {
  const plans = getAllLearningPlans();
  const totalSteps = plans.reduce((acc, p) => acc + p.steps.length, 0);
  const completedSteps = plans.reduce((acc, p) => acc + p.completed_steps.length, 0);
  const completedPlans = plans.filter(p => p.completed_steps.length === p.steps.length && p.steps.length > 0).length;

  const toolFrequency: Record<string, number> = {};
  plans.forEach(p => p.tools.forEach(t => { toolFrequency[t] = (toolFrequency[t] ?? 0) + 1; }));
  const topTool = Object.entries(toolFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { totalPlans: plans.length, completedPlans, totalSteps, completedSteps, topTool };
}

export function getInterviewStats() {
  const sessions = getAllInterviewSessions();
  if (!sessions.length) return { totalSessions: 0, avgScore: 0, bestScore: 0, trend: "flat" as const, weakCategories: [] as string[] };

  const scores = sessions.map(s => s.score_pct);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);

  // Trend: compare last 3 sessions
  const trend: "up" | "down" | "flat" =
    scores.length < 2 ? "flat" :
    scores[0] > scores[1] ? "up" :
    scores[0] < scores[1] ? "down" : "flat";

  // Aggregate weak categories across all sessions
  const categoryMap: Record<string, { total: number; needs_work: number }> = {};
  sessions.forEach(s =>
    s.category_results.forEach(c => {
      if (!categoryMap[c.category]) categoryMap[c.category] = { total: 0, needs_work: 0 };
      categoryMap[c.category].total += c.total;
      categoryMap[c.category].needs_work += c.needs_work;
    })
  );

  const weakCategories = Object.entries(categoryMap)
    .filter(([, v]) => v.total > 0 && v.needs_work / v.total > 0.4)
    .map(([cat]) => cat)
    .slice(0, 3);

  return { totalSessions: sessions.length, avgScore, bestScore, trend, weakCategories };
}
