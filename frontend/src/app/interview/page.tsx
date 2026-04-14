"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Clock, ChevronRight, CheckCircle2, AlertCircle,
  Minus, ArrowRight, Trophy, RotateCcw, Sparkles, Send,
  Timer, Target, Zap, Server, FlaskConical
} from "lucide-react";
import {
  createInterviewSession, saveInterviewAnswer
} from "@/lib/api";
import UserAuthMenu from "@/components/profile/UserAuthMenu";

// ── Types ─────────────────────────────────────────────────────────────────────

type Domain          = "DevOps" | "MLOps";
type DurationOption  = { label: string; mins: number; questions: number; badge: string; color: string };
type ExperienceLevel = "beginner" | "intermediate" | "senior";
type Question        = { id: number; question: string; category: string; difficulty: string; domain: string };
type DebriefRating   = "excellent" | "good" | "needs_work";
type AnswerResult    = { rating: DebriefRating; badge: string; feedback: string; model_answer?: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const DOMAINS: { id: Domain; label: string; emoji: string; color: string; desc: string; tags: string[] }[] = [
  {
    id: "DevOps",
    label: "DevOps",
    emoji: "🚀",
    color: "emerald",
    desc: "CI/CD, Kubernetes, Terraform, AWS, Docker, GitOps, Security & SRE",
    tags: ["Kubernetes", "Terraform", "AWS", "CI/CD", "GitOps"],
  },
  {
    id: "MLOps",
    label: "MLOps",
    emoji: "🧠",
    color: "purple",
    desc: "ML Pipelines, Model Drift, MLflow, DVC, Deployment Strategies & Feature Stores",
    tags: ["MLflow", "DVC", "Model Drift", "Pipelines", "Kubeflow"],
  },
];

const DURATIONS: DurationOption[] = [
  { label: "Quick Mode",  mins: 10, questions: 10, badge: "⚡", color: "sky"     },
  { label: "Standard",   mins: 30, questions: 30, badge: "🎯", color: "emerald" },
  { label: "Full Round", mins: 60, questions: 45, badge: "🏆", color: "purple"  },
];

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; desc: string; emoji: string }[] = [
  { id: "beginner",     label: "Beginner",     desc: "0–2 years. Mostly easy questions.",       emoji: "🌱" },
  { id: "intermediate", label: "Intermediate", desc: "2–5 years. Mix of easy, medium, hard.",   emoji: "⚙️" },
  { id: "senior",       label: "Senior",       desc: "5+ years. Mostly hard system design.",    emoji: "🚀" },
];

const MENTOR_AI_URL = process.env.NEXT_PUBLIC_MENTOR_AI_URL || "http://localhost:8000";

type Phase = "setup" | "interview" | "summary";

// ── Utility ───────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function difficultyColor(d: string) {
  if (d === "easy")   return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (d === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-rose-400 bg-rose-500/10 border-rose-500/20";
}

function ratingColor(r: DebriefRating | undefined) {
  if (r === "excellent") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (r === "good")      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border-rose-500/40 bg-rose-500/10 text-rose-300";
}

function domainColorMap(color: string, active: boolean) {
  const map: Record<string, { border: string; bg: string; text: string; shadow: string }> = {
    emerald: {
      border: "border-emerald-500/60",
      bg:     "bg-emerald-500/8",
      text:   "text-emerald-400",
      shadow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    },
    purple: {
      border: "border-purple-500/60",
      bg:     "bg-purple-500/8",
      text:   "text-purple-400",
      shadow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    },
  };
  if (!active) return "border-zinc-800 bg-zinc-900/40";
  const c = map[color];
  return `${c.border} ${c.bg} ${c.shadow}`;
}

// ── Components ────────────────────────────────────────────────────────────────

function SetupPhase({ onStart }: { onStart: (domain: Domain, duration: DurationOption, experience: ExperienceLevel) => void }) {
  const [domain,     setDomain]     = useState<Domain>("DevOps");
  const [duration,   setDuration]   = useState<DurationOption>(DURATIONS[0]);
  const [experience, setExperience] = useState<ExperienceLevel>("intermediate");

  const selectedDomain = DOMAINS.find((d) => d.id === domain)!;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6 py-16">
      <div className="absolute top-4 w-full px-6 flex justify-between items-center max-w-7xl mx-auto left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
          <Sparkles size={16} className="text-purple-500" />
          <span className="font-black text-sm tracking-tight">DeployKaro</span>
        </div>
        <UserAuthMenu />
      </div>
      <div className="max-w-2xl w-full">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 border border-purple-500/30 bg-purple-500/5 px-4 py-2 rounded-full mb-6">
            <Brain size={14} className="text-purple-400" />
            <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">
              AI Mock Interview
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Ready to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
              get grilled?
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Scenario-based questions curated from real senior interviews. Pick your domain — DevOps or MLOps — questions never mix.
          </p>
        </motion.div>

        {/* ── Step 1: Domain ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">
            Step 1 — Choose Your Domain
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {DOMAINS.map((d) => (
              <motion.button
                key={d.id}
                onClick={() => setDomain(d.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${domainColorMap(d.color, domain === d.id)}`}
              >
                {domain === d.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <CheckCircle2 size={12} className="text-black" />
                  </motion.div>
                )}
                <div className="text-3xl mb-3">{d.emoji}</div>
                <div className="font-black text-lg tracking-tight mb-1">{d.label}</div>
                <div className="text-[11px] text-zinc-500 leading-relaxed mb-3">{d.desc}</div>
                <div className="flex flex-wrap gap-1">
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        domain === d.id
                          ? d.color === "emerald"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : "border-purple-500/30 text-purple-400 bg-purple-500/10"
                          : "border-zinc-700 text-zinc-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Step 2: Experience Level ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">
            Step 2 — Your Experience Level
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {EXPERIENCE_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setExperience(lvl.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  experience === lvl.id
                    ? "border-emerald-500/60 bg-emerald-500/10"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <div className="text-2xl mb-2">{lvl.emoji}</div>
                <div className="font-black text-sm">{lvl.label}</div>
                <div className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Step 3: Duration ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">
            Step 3 — Interview Duration
          </p>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {DURATIONS.map((d) => {
              const colorMap: Record<string, string> = {
                sky:     "border-sky-500/60 bg-sky-500/10",
                emerald: "border-emerald-500/60 bg-emerald-500/10",
                purple:  "border-purple-500/60 bg-purple-500/10",
              };
              return (
                <button
                  key={d.mins}
                  onClick={() => setDuration(d)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    duration.mins === d.mins
                      ? colorMap[d.color]
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="text-2xl mb-1">{d.badge}</div>
                  <div className="font-black text-base">{d.label}</div>
                  <div className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {d.mins} min
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-1">{d.questions} questions</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Start Button ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(domain, duration, experience)}
            className={`w-full flex items-center justify-center gap-3 text-white font-black text-sm uppercase tracking-widest px-8 py-5 rounded-2xl transition-all shadow-2xl ${
              domain === "DevOps"
                ? "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 shadow-emerald-900/30"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/30"
            }`}
          >
            {domain === "DevOps" ? <Server size={18} /> : <FlaskConical size={18} />}
            Start {selectedDomain.label} Interview
            <ArrowRight size={18} />
          </motion.button>
          <p className="text-center text-[11px] text-zinc-600 mt-4 font-mono uppercase tracking-widest">
            {selectedDomain.tags.join(" · ")}
          </p>
        </motion.div>

      </div>
    </div>
  );
}

function InterviewPhase({
  questions, sessionId, durationMin, domain, onComplete,
}: {
  questions: Question[];
  sessionId: string;
  durationMin: number;
  domain: Domain;
  onComplete: (results: { answered: AnswerResult[]; questions: Question[] }) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer,     setAnswer]     = useState("");
  const [results,    setResults]    = useState<AnswerResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [revealed,   setRevealed]   = useState<AnswerResult | null>(null);
  const [timeLeft,   setTimeLeft]   = useState(durationMin * 60);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(t); onComplete({ answered: results, questions }); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current  = questions[currentIdx];
  const progress = (currentIdx / questions.length) * 100;
  const isLast   = currentIdx === questions.length - 1;

  const domainAccent = domain === "DevOps" ? "text-emerald-400" : "text-purple-400";
  const domainBorder = domain === "DevOps" ? "border-emerald-500/50" : "border-purple-500/50";
  const domainBg     = domain === "DevOps" ? "bg-emerald-500/10"     : "bg-purple-500/10";
  const domainGrad   = domain === "DevOps"
    ? "from-emerald-500 to-sky-500"
    : "from-purple-500 to-pink-500";

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${MENTOR_AI_URL}/interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, question_id: current.id, answer_text: answer }),
      });
      const data = await resp.json();
      const result: AnswerResult = { rating: data.debrief_rating, badge: data.debrief_badge, feedback: data.feedback, model_answer: data.model_answer };
      
      // Save it asynchronously to the backend
      saveInterviewAnswer(sessionId, current.id, answer, data.debrief_rating).catch(console.error);

      setResults((prev) => [...prev, result]);
      setRevealed(result);
    } catch {
      const fallback: AnswerResult = { rating: "needs_work", badge: "❌", feedback: "Could not connect to server." };
      setResults((prev) => [...prev, fallback]);
      setRevealed(fallback);
    } finally {
      setSubmitting(false);
    }
  }, [answer, current, sessionId, submitting]);

  const handleNext = useCallback(() => {
    setRevealed(null);
    setAnswer("");
    if (isLast) {
      onComplete({ answered: results, questions });
    } else {
      setCurrentIdx((i) => i + 1);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isLast, results, questions, onComplete]);

  const timerColor = timeLeft < 60 ? "text-rose-400" : timeLeft < 300 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* Top Bar */}
      <div className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {domain === "DevOps" ? <Server size={16} className="text-emerald-400" /> : <FlaskConical size={16} className="text-purple-400" />}
            <span className={`font-black text-sm tracking-tight ${domainAccent}`}>{domain} Interview</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Target size={12} />
              <span className="font-bold">{currentIdx + 1} / {questions.length}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-black tabular-nums ${timerColor}`}>
              <Timer size={12} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-0.5 bg-zinc-900">
          <motion.div
            className={`h-full bg-gradient-to-r ${domainGrad}`}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-20 pb-8 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category + Difficulty */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${domainBorder} ${domainBg} ${domainAccent}`}>
                  {current.category}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${difficultyColor(current.difficulty)}`}>
                  {current.difficulty}
                </span>
              </div>

              {/* Question */}
              <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 mb-6">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${domainBg} border ${domainBorder} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {domain === "DevOps" ? <Server size={14} className={domainAccent} /> : <FlaskConical size={14} className={domainAccent} />}
                  </div>
                  <p className="text-lg font-medium leading-relaxed text-white">{current.question}</p>
                </div>
              </div>

              {/* Answer Box or Debrief */}
              {!revealed ? (
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                    placeholder="Type your answer here... (Ctrl+Enter to submit)"
                    className="w-full h-44 bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 focus:border-purple-500/50 rounded-2xl px-5 py-4 text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none transition-colors"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-zinc-600 font-mono">{answer.length} chars · Ctrl+Enter to submit</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const skip: AnswerResult = { rating: "needs_work", badge: "❌", feedback: "Question skipped." };
                          setResults((prev) => [...prev, skip]);
                          setRevealed(skip);
                        }}
                        className="text-xs text-zinc-600 hover:text-zinc-400 px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
                      >
                        Skip
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        disabled={!answer.trim() || submitting}
                        className={`flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest px-5 py-2 rounded-xl transition-all ${
                          domain === "DevOps"
                            ? "bg-emerald-600 hover:bg-emerald-500"
                            : "bg-purple-600 hover:bg-purple-500"
                        }`}
                      >
                        {submitting ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Sparkles size={12} />
                          </motion.div>
                        ) : <Send size={12} />}
                        {submitting ? "Judging..." : "Submit"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border-2 ${ratingColor(revealed.rating)} mb-4`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{revealed.badge}</span>
                      <div>
                        <div className="font-black text-sm uppercase tracking-wide capitalize">{revealed.rating.replace("_", " ")}</div>
                        <div className="text-[10px] opacity-70 uppercase tracking-widest">AI Debrief</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">{revealed.feedback}</p>
                    {revealed.model_answer && (
                      <div className="mt-4 pt-4 border-t border-current/20">
                        <div className="text-[10px] opacity-70 uppercase tracking-widest mb-1 font-bold">Ideal Answer & Guidance</div>
                        <p className="text-sm leading-relaxed opacity-90">{revealed.model_answer}</p>
                      </div>
                    )}
                  </motion.div>
                  <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all"
                  >
                    {isLast ? <><Trophy size={14} className="text-amber-400" /> See Results</> : <>Next Question <ChevronRight size={14} /></>}
                  </button>
                </AnimatePresence>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Answer history pills */}
          {results.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-6">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`text-sm w-7 h-7 rounded-lg flex items-center justify-center border text-center ${
                    r.rating === "excellent"
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : r.rating === "good"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-rose-500/30 bg-rose-500/10"
                  }`}
                  title={`Q${i + 1}: ${r.rating}`}
                >
                  {r.badge}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryPhase({
  questions, results, durationMin, domain, onRetry,
}: {
  questions: Question[];
  results: AnswerResult[];
  durationMin: number;
  domain: Domain;
  onRetry: () => void;
}) {
  const router = useRouter();
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    import("@/lib/api").then(({ getUserStats }) => {
      getUserStats().then(data => {
        if (data.success && data.recentSessions) {
          setSessionHistory(data.recentSessions);
        }
      });
    });
  }, []);

  const excellent = results.filter((r) => r.rating === "excellent").length;
  const good      = results.filter((r) => r.rating === "good").length;
  const poor      = results.filter((r) => r.rating === "needs_work").length;
  const total     = results.length;
  const scorePct  = total > 0 ? Math.round((excellent / total) * 100) : 0;

  // ── Category analysis ────────────────────────────────────────────────────
  const categoryMap = new Map<string, { total: number; excellent: number; good: number; needs_work: number }>();
  questions.slice(0, results.length).forEach((q, i) => {
    const r = results[i];
    if (!r) return;
    const entry = categoryMap.get(q.category) ?? { total: 0, excellent: 0, good: 0, needs_work: 0 };
    entry.total++;
    entry[r.rating]++;
    categoryMap.set(q.category, entry);
  });

  const categoryResults = Array.from(categoryMap.entries()).map(([category, v]) => ({
    category, ...v,
  }));

  const weakCategories = categoryResults.filter(c => c.needs_work > 0).sort((a, b) => b.needs_work - a.needs_work);
  const strongCategories = categoryResults.filter(c => c.excellent === c.total && c.total > 0);

  // We removed local history saving since it is actively saved during the interview
  useEffect(() => {
    // History can be loaded from stats if needed, or we just rely on dashboard
  }, []);

  const grade =
    scorePct >= 80 ? { label: "Interview Ready",  color: "text-emerald-400", emoji: "🏆" } :
    scorePct >= 60 ? { label: "Almost There",     color: "text-amber-400",   emoji: "🎯" } :
                     { label: "Keep Practicing",  color: "text-rose-400",    emoji: "💪" };

  const domainIcon = domain === "DevOps" ? <Server size={14} /> : <FlaskConical size={14} />;

  // Trend from history
  const prevScore = sessionHistory.length > 1 ? sessionHistory[1]?.score_pct : null;
  const trend = prevScore !== null
    ? scorePct > prevScore ? "↑ Improving" : scorePct < prevScore ? "↓ Declined" : "→ Steady"
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      <div className="absolute top-4 w-full px-6 flex justify-between items-center max-w-7xl mx-auto left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <Sparkles size={16} className="text-purple-500" />
          <span className="font-black text-sm tracking-tight">DeployKaro</span>
        </div>
        <UserAuthMenu />
      </div>
      <div className="max-w-2xl mx-auto pt-10">

        {/* Domain badge */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${
            domain === "DevOps"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-purple-500/30 bg-purple-500/10 text-purple-400"
          }`}>
            {domainIcon} {domain} Interview Complete
          </div>
        </motion.div>

        {/* Score Card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${grade.color}`}>{grade.label}</h1>
          <p className="text-zinc-500">You answered {total} of {questions.length} questions</p>

          <div className="mt-6 p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-end justify-center gap-3 mb-1">
              <div className="text-7xl font-black tracking-tighter text-white">{scorePct}%</div>
              {trend && (
                <div className={`text-sm font-black mb-3 ${trend.startsWith("↑") ? "text-emerald-400" : trend.startsWith("↓") ? "text-rose-400" : "text-zinc-500"}`}>
                  {trend}
                </div>
              )}
            </div>
            <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-6">Excellence Score</div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Excellent",  count: excellent, icon: CheckCircle2, color: "text-emerald-400" },
                { label: "Good",       count: good,      icon: Minus,        color: "text-amber-400"   },
                { label: "Needs Work", count: poor,      icon: AlertCircle,  color: "text-rose-400"    },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <stat.icon size={18} className={stat.color} />
                  <div className={`text-2xl font-black ${stat.color}`}>{stat.count}</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        {categoryResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">Performance by Topic</p>
            <div className="space-y-2">
              {categoryResults.map(c => {
                const pct = c.total > 0 ? Math.round((c.excellent / c.total) * 100) : 0;
                return (
                  <div key={c.category} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{c.category}</span>
                        <span className={`text-[10px] font-black ${pct >= 80 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-rose-400"}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-600 flex-shrink-0">{c.excellent}/{c.total}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Weak Spots + What to do next */}
        {weakCategories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-6 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5">
            <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-3">⚠️ Focus on these next</p>
            <div className="space-y-2">
              {weakCategories.slice(0, 3).map(c => (
                <div key={c.category} className="flex items-start gap-3 text-sm">
                  <AlertCircle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300">{c.category}</span>
                    <span className="text-zinc-500 ml-2 text-xs">— {c.needs_work} of {c.total} questions missed</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/learning")}
              className="mt-4 w-full text-xs font-black uppercase tracking-widest text-rose-400 border border-rose-500/30 rounded-xl py-2.5 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2">
              Practice these with DeployAnything <ArrowRight size={12} />
            </button>
          </motion.div>
        )}

        {/* Strong areas */}
        {strongCategories.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mb-6 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-2">✅ Strong areas</p>
            <div className="flex flex-wrap gap-2">
              {strongCategories.map(c => (
                <span key={c.category} className="text-[10px] font-black text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {c.category}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Question History */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">Question Review</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {questions.slice(0, results.length).map((q, i) => {
              const r = results[i];
              return (
                <div key={i} className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 text-xs space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{r?.badge || "–"}</span>
                    <p className="text-zinc-300 font-medium leading-relaxed">{q.question}</p>
                  </div>
                  {r?.feedback && <p className="text-zinc-600 pl-6">{r.feedback}</p>}
                  {r?.model_answer && (
                    <details className="pl-6">
                      <summary className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 cursor-pointer hover:text-emerald-400">Show ideal answer</summary>
                      <p className="text-zinc-500 mt-1 text-[11px] leading-relaxed">{r.model_answer}</p>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Session History Toggle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-8">
          <button onClick={() => setShowHistory(v => !v)}
            className="flex items-center gap-2 text-[11px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
            <Clock size={12} /> {showHistory ? "Hide" : "View"} Session History ({sessionHistory.length} sessions)
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3 space-y-2">
                  {sessionHistory.slice(0, 8).map((s, i) => (
                    <div key={s.id} className={`flex items-center gap-4 p-3 rounded-xl border text-xs ${i === 0 ? "border-zinc-700 bg-zinc-900/60" : "border-zinc-800 bg-zinc-900/20"}`}>
                      <div className={`text-lg ${s.score_pct >= 80 ? "🏆" : s.score_pct >= 60 ? "🎯" : "💪"}`}>
                        {s.score_pct >= 80 ? "🏆" : s.score_pct >= 60 ? "🎯" : "💪"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white">{s.domain} · {new Date(s.completed_at).toLocaleDateString()}</div>
                        <div className="text-zinc-600 mt-0.5">{s.answered} questions · {s.duration_min} min</div>
                      </div>
                      <div className={`font-black text-base ${s.score_pct >= 80 ? "text-emerald-400" : s.score_pct >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                        {s.score_pct}%
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-3">
          <button onClick={onRetry}
            className="flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all">
            <RotateCcw size={14} /> Try Again
          </button>
          <button onClick={() => router.push("/dashboard")}
            className={`flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all ${
              domain === "DevOps"
                ? "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            }`}>
            <Brain size={14} /> My Dashboard <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [phase,       setPhase]       = useState<Phase>("setup");
  const [domain,      setDomain]      = useState<Domain>("DevOps");
  const [questions,   setQuestions]   = useState<Question[]>([]);
  const [sessionId,   setSessionId]   = useState<string>("");
  const [durationMin, setDurationMin] = useState(10);
  const [results,     setResults]     = useState<AnswerResult[]>([]);
  const [loading,     setLoading]     = useState(false);

  const handleStart = useCallback(async (dom: Domain, dur: DurationOption, exp: ExperienceLevel) => {
    setLoading(true);
    setDomain(dom);

    // Get user ID from session
    const userId = (session?.user as any)?.id || (session as any)?.sub || "guest-user";
    const token  = (session as any)?.accessToken;

    try {
      const resp = await fetch(`${MENTOR_AI_URL}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          domain: dom,
          experience_level: exp,
          duration_min: dur.mins,
        }),
      });

      if (!resp.ok) throw new Error("Failed to start interview");
      const data = await resp.json();

      // 1. Create true session in DB (only if authenticated)
      let realSessionId = "offline-" + Date.now().toString();
      if (token) {
        try {
          const dbResult = await createInterviewSession(dom, dur.mins, exp);
          realSessionId = dbResult.id;
        } catch (err) {
          console.error("Content API session creation failed", err);
        }
      }

      setSessionId(realSessionId);
      setQuestions(data.questions);
      setDurationMin(data.duration_min);
      setPhase("interview");
    } catch {
      // Graceful fallback — offline domain-specific mock questions
      const devopsFallback: Question[] = [
        { id: 1001, question: "Walk me through how you would design a zero-downtime deployment pipeline for a Node.js API.", category: "CI/CD", difficulty: "hard", domain: "DevOps" },
        { id: 1002, question: "A pod is stuck in CrashLoopBackOff in production. What are your first 3 commands?", category: "Kubernetes", difficulty: "hard", domain: "DevOps" },
        { id: 1003, question: "Your Terraform state is corrupted. How do you recover without destroying production?", category: "Terraform", difficulty: "hard", domain: "DevOps" },
        { id: 1004, question: "Explain how you would implement a canary deployment on Kubernetes.", category: "Kubernetes", difficulty: "hard", domain: "DevOps" },
        { id: 1005, question: "Your S3 bucket just became public. What do you do in the next 10 minutes?", category: "Security", difficulty: "hard", domain: "DevOps" },
        { id: 1006, question: "How do you implement GitOps with ArgoCD? Walk through the full flow.", category: "GitOps", difficulty: "medium", domain: "DevOps" },
        { id: 1007, question: "Design a multi-region DR strategy for an RDS database with 15 min RPO.", category: "AWS", difficulty: "hard", domain: "DevOps" },
        { id: 1008, question: "Explain the three pillars of observability and which tools you use for each.", category: "Observability", difficulty: "easy", domain: "DevOps" },
        { id: 1009, question: "A GitHub Actions pipeline is flaky and fails 30% of the time. How do you fix it?", category: "CI/CD", difficulty: "medium", domain: "DevOps" },
        { id: 1010, question: "What is a Kubernetes PodDisruptionBudget and when do you need one?", category: "Kubernetes", difficulty: "hard", domain: "DevOps" },
      ];
      const mlopsFallback: Question[] = [
        { id: 2001, question: "What is model drift and how do you detect it in an ML system?", category: "Monitoring & Drift", difficulty: "medium", domain: "MLOps" },
        { id: 2002, question: "Design the CI/CD pipeline for training and deploying an ML model.", category: "ML Pipelines", difficulty: "hard", domain: "MLOps" },
        { id: 2003, question: "What is the difference between batch inference and real-time inference? Give tradeoffs.", category: "MLOps Fundamentals", difficulty: "medium", domain: "MLOps" },
        { id: 2004, question: "How do you containerize a PyTorch model for production serving?", category: "Tools & Ecosystem", difficulty: "medium", domain: "MLOps" },
        { id: 2005, question: "Your model's accuracy dropped by 8% after 3 weeks in production. Walk me through your response.", category: "Monitoring & Drift", difficulty: "hard", domain: "MLOps" },
        { id: 2006, question: "How do you design a feature store for ML? What problems does it solve?", category: "System Design", difficulty: "hard", domain: "MLOps" },
        { id: 2007, question: "What is Continuous Training (CT) in MLOps and when should you trigger a retrain?", category: "MLOps Fundamentals", difficulty: "hard", domain: "MLOps" },
        { id: 2008, question: "How do you ensure reproducibility of ML experiments across environments?", category: "Data & Reproducibility", difficulty: "easy", domain: "MLOps" },
        { id: 2009, question: "Explain canary deployment for ML — how do you safely roll out a new model version?", category: "Deployment Strategies", difficulty: "medium", domain: "MLOps" },
        { id: 2010, question: "How do you use MLflow for experiment tracking and model registry?", category: "Tools & Ecosystem", difficulty: "medium", domain: "MLOps" },
      ];

      const pool = dom === "DevOps" ? devopsFallback : mlopsFallback;
      setSessionId("offline-session");
      setQuestions(pool.slice(0, dur.questions));
      setDurationMin(dur.mins);
      setPhase("interview");
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleComplete = useCallback(({ answered, questions: qs }: { answered: AnswerResult[]; questions: Question[] }) => {
    setResults(answered);
    setQuestions(qs);
    setPhase("summary");
  }, []);

  const handleRetry = useCallback(() => {
    setPhase("setup");
    setQuestions([]);
    setResults([]);
    setSessionId("");
  }, []);

  // ── Auth Gate ──────────────────────────────────────────────────────────────
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="inline-flex items-center gap-2 border border-purple-500/30 bg-purple-500/5 px-4 py-2 rounded-full">
            <Brain size={14} className="text-purple-400" />
            <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">AI Mock Interview</span>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-emerald-600/20 border border-white/10 flex items-center justify-center mx-auto">
            <Brain size={36} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-3">Sign In Required</h1>
            <p className="text-zinc-400 leading-relaxed">
              Interview sessions track your progress and save your results.
              Please sign in to start your AI mock interview.
            </p>
          </div>
          <button
            onClick={() => signIn("keycloak", { callbackUrl: "/interview" })}
            className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-widest px-8 py-5 rounded-2xl transition-all shadow-2xl shadow-purple-900/30"
          >
            Sign In to Start Interview
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-zinc-600 hover:text-zinc-400 text-sm underline underline-offset-4 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 mx-auto mb-4"
          />
          <p className="text-zinc-400 text-sm font-bold">Preparing your {domain} interview...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {phase === "setup" && (
        <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SetupPhase onStart={handleStart} />
        </motion.div>
      )}
      {phase === "interview" && (
        <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <InterviewPhase
            questions={questions}
            sessionId={sessionId}
            durationMin={durationMin}
            domain={domain}
            onComplete={handleComplete}
          />
        </motion.div>
      )}
      {phase === "summary" && (
        <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SummaryPhase
            questions={questions}
            results={results}
            durationMin={durationMin}
            domain={domain}
            onRetry={handleRetry}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
