"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Play, Brain, Flame, Trophy, TrendingUp, TrendingDown,
  Minus, BookOpen, CheckCircle2, AlertCircle, ArrowRight,
  BarChart3, Clock, Sparkles, ChevronRight
} from "lucide-react";
import { getUserStats } from "@/lib/api";
import { type SavedLearningPlan, type SavedInterviewSession, getStreak } from "@/lib/storage";
import UserAuthMenu from "@/components/profile/UserAuthMenu";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  color: "emerald" | "purple" | "amber" | "rose";
}) {
  const colors = {
    emerald: { text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
    purple:  { text: "text-purple-400",  border: "border-purple-500/20",  bg: "bg-purple-500/5" },
    amber:   { text: "text-amber-400",   border: "border-amber-500/20",  bg: "bg-amber-500/5" },
    rose:    { text: "text-rose-400",    border: "border-rose-500/20",   bg: "bg-rose-500/5" },
  };
  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border ${c.border} ${c.bg}`}
    >
      <Icon size={18} className={`${c.text} mb-3`} />
      <div className={`text-3xl font-black tracking-tighter ${c.text}`}>{value}</div>
      <div className="text-xs font-bold text-white mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SavedLearningPlan[]>([]);
  const [sessions, setSessions] = useState<SavedInterviewSession[]>([]);
  const [streak, setStreak] = useState(0);
  const [learnStats, setLearnStats] = useState({ totalPlans: 0, completedPlans: 0, totalSteps: 0, completedSteps: 0, topTool: null as string | null });
  const [intStats, setIntStats] = useState({ totalSessions: 0, avgScore: 0, bestScore: 0, trend: "flat" as "up" | "down" | "flat", weakCategories: [] as string[] });

  useEffect(() => {
    setStreak(getStreak().current_streak);
    getUserStats().then(data => {
      if (data.success) {
        setLearnStats(data.learning);
        setIntStats(data.interviews);
        setPlans(data.recentPlans || []);
        setSessions(data.recentSessions || []);
      }
    }).catch(console.error);
  }, []);

  const hasAnyActivity = plans.length > 0 || sessions.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 selection:bg-emerald-500/30">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <Sparkles size={16} className="text-emerald-500" />
            <span className="font-black text-sm tracking-tight">DeployKaro</span>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Flame size={10} /> {streak}-day streak
              </div>
            )}
            <UserAuthMenu />
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-black tracking-tighter mb-1">Your Progress</h1>
          <p className="text-zinc-500 text-sm">Everything you&apos;ve learned and practiced, in one place.</p>
        </motion.div>

        {/* Empty state */}
        {!hasAnyActivity && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 border border-zinc-800 rounded-3xl bg-zinc-900/20">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-xl font-black mb-2">Nothing here yet!</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">
              Start a deployment plan or take an interview to see your progress here.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/learning")}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all">
                <Play size={13} /> Start Learning
              </button>
              <button onClick={() => router.push("/interview")}
                className="flex items-center gap-2 border border-zinc-700 hover:border-purple-500/50 bg-zinc-900 hover:bg-purple-500/10 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all">
                <Brain size={13} /> Take Interview
              </button>
            </div>
          </motion.div>
        )}

        {hasAnyActivity && (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              <StatCard icon={Play} label="Projects Started" value={learnStats.totalPlans} color="emerald" sub={`${learnStats.completedPlans} completed`} />
              <StatCard icon={CheckCircle2} label="Steps Done" value={learnStats.completedSteps} color="emerald" sub={`of ${learnStats.totalSteps} total`} />
              <StatCard icon={Brain} label="Interviews" value={intStats.totalSessions} color="purple" sub="sessions taken" />
              <StatCard
                icon={intStats.trend === "up" ? TrendingUp : intStats.trend === "down" ? TrendingDown : Minus}
                label="Avg Interview Score"
                value={intStats.totalSessions > 0 ? `${intStats.avgScore}%` : "—"}
                color={intStats.trend === "up" ? "emerald" : intStats.trend === "down" ? "rose" : "amber"}
                sub={intStats.trend === "up" ? "↑ Improving" : intStats.trend === "down" ? "↓ Needs work" : "→ Steady"}
              />
            </div>

            {/* ── Learning Section ── */}
            {plans.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-500" />
                    <p className="text-sm font-black uppercase tracking-widest text-zinc-400">Learning Plans</p>
                  </div>
                  <button onClick={() => router.push("/learning")}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                    New Plan <ChevronRight size={10} />
                  </button>
                </div>

                <div className="space-y-3">
                  {plans.slice(0, 5).map(plan => {
                    const pct = plan.steps.length > 0
                      ? Math.round((plan.completed_steps.length / plan.steps.length) * 100)
                      : 0;
                    const isComplete = pct === 100;

                    return (
                      <button key={plan.id} onClick={() => router.push("/learning")}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${isComplete ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-zinc-800/60"}`}>
                          {isComplete ? "✅" : "🏗️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold text-white truncate">{plan.project_title}</p>
                            <span className={`text-[10px] font-black flex-shrink-0 ml-2 ${isComplete ? "text-emerald-400" : "text-zinc-600"}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-500" : "bg-emerald-500/60"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                            <span>{plan.cloud_provider}</span>
                            <span>·</span>
                            <span>{plan.completed_steps.length}/{plan.steps.length} steps</span>
                            <span>·</span>
                            <Clock size={8} />
                            <span>{timeAgo(plan.last_accessed)}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-zinc-700 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {learnStats.topTool && (
                  <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 flex items-center gap-3">
                    <Trophy size={14} className="text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-zinc-400">
                      Your most-used tool: <strong className="text-white">{learnStats.topTool}</strong> — you&apos;re building expertise here.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Interview Section ── */}
            {sessions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain size={14} className="text-purple-500" />
                    <p className="text-sm font-black uppercase tracking-widest text-zinc-400">Interview History</p>
                  </div>
                  <button onClick={() => router.push("/interview")}
                    className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                    New Interview <ChevronRight size={10} />
                  </button>
                </div>

                {/* Score trend mini chart */}
                {sessions.length >= 2 && (
                  <div className="mb-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 size={14} className="text-zinc-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Score Trend (last {Math.min(sessions.length, 6)})</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-12">
                      {sessions.slice(0, 6).reverse().map((s, i) => {
                        const h = Math.max(8, Math.round((s.score_pct / 100) * 48));
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-full rounded-t transition-all ${s.score_pct >= 80 ? "bg-emerald-500" : s.score_pct >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                              style={{ height: `${h}px` }}
                            />
                            <span className="text-[8px] text-zinc-700 font-mono">{s.score_pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Session list */}
                <div className="space-y-2">
                  {sessions.slice(0, 6).map((s, i) => (
                    <div key={s.id} className={`flex items-center gap-4 p-3 rounded-xl border text-xs ${i === 0 ? "border-zinc-700 bg-zinc-900/60" : "border-zinc-800 bg-zinc-900/20"}`}>
                      <div className="text-xl flex-shrink-0">
                        {s.score_pct >= 80 ? "🏆" : s.score_pct >= 60 ? "🎯" : "💪"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white">{s.domain} Interview</div>
                        <div className="text-zinc-600 mt-0.5">
                          {s.answered} questions · {s.duration_min} min · {timeAgo(s.completed_at)}
                        </div>
                      </div>
                      <div className={`font-black text-lg flex-shrink-0 ${s.score_pct >= 80 ? "text-emerald-400" : s.score_pct >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                        {s.score_pct}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weak categories from interview history */}
                {intStats.weakCategories.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={13} className="text-rose-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Focus areas across all interviews</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {intStats.weakCategories.map(cat => (
                        <span key={cat} className="text-[10px] font-bold text-rose-300 border border-rose-500/30 bg-rose-500/10 px-2 py-1 rounded-lg">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => router.push("/learning")}
                      className="mt-3 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors">
                      Practice with DeployAnything <ArrowRight size={10} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Quick Launch */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">Quick Launch</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => router.push("/learning")}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30">
                  <Play size={14} /> Deploy Something
                </button>
                <button onClick={() => router.push("/interview")}
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-purple-900/30">
                  <Brain size={14} /> Take an Interview
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
