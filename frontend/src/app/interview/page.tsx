"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Clock, ChevronRight, CheckCircle2, AlertCircle,
  Minus, ArrowRight, Trophy, RotateCcw, Sparkles, Send,
  Timer, Target, TrendingUp, Shield, Zap
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type DurationOption = { label: string; mins: number; questions: number; badge: string; color: string };
type ExperienceLevel = "beginner" | "intermediate" | "senior";
type Question = { id: number; question: string; category: string; difficulty: string };
type DebriefRating = "excellent" | "good" | "needs_work";
type AnswerResult = { rating: DebriefRating; badge: string; feedback: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const DURATIONS: DurationOption[] = [
  { label: "Quick Mode",    mins: 10, questions: 10,  badge: "⚡", color: "sky"     },
  { label: "Standard",     mins: 30, questions: 30,  badge: "🎯", color: "emerald" },
  { label: "Full Round",   mins: 60, questions: 45,  badge: "🏆", color: "purple"  },
];

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; desc: string; emoji: string }[] = [
  { id: "beginner",     label: "Beginner",     desc: "0–2 years. Mostly easy questions.",         emoji: "🌱" },
  { id: "intermediate", label: "Intermediate", desc: "2–5 years. Mix of easy, medium, hard.",     emoji: "⚙️" },
  { id: "senior",       label: "Senior",       desc: "5+ years. Mostly hard system design.",      emoji: "🚀" },
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
  if (r === "excellent")  return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (r === "good")       return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border-rose-500/40 bg-rose-500/10 text-rose-300";
}

// ── Components ────────────────────────────────────────────────────────────────

function SetupPhase({
  onStart,
}: {
  onStart: (duration: DurationOption, experience: ExperienceLevel) => void;
}) {
  const [duration, setDuration] = useState<DurationOption>(DURATIONS[0]);
  const [experience, setExperience] = useState<ExperienceLevel>("intermediate");

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 border border-purple-500/30 bg-purple-500/5 px-4 py-2 rounded-full mb-6">
            <Brain size={14} className="text-purple-400" />
            <span className="text-[11px] font-black text-purple-400 uppercase tracking-widest">
              Senior DevOps Mock Interview
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Ready to <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">get grilled</span>?
          </h1>
          <p className="text-zinc-400 text-lg">
            Scenario-based questions from senior DevOps architects and system design leads.
          </p>
        </motion.div>

        {/* Experience Level */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">Your Experience Level</p>
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

        {/* Duration */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">Interview Duration</p>
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

        {/* Start Button */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(duration, experience)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-widest px-8 py-5 rounded-2xl transition-all shadow-2xl shadow-purple-900/30"
          >
            <Brain size={18} />
            Start Interview
            <ArrowRight size={18} />
          </motion.button>
          <p className="text-center text-[11px] text-zinc-600 mt-4 font-mono uppercase tracking-widest">
            Questions from real LinkedIn senior DevOps interviews
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function InterviewPhase({
  questions,
  sessionId,
  durationMin,
  onComplete,
}: {
  questions: Question[];
  sessionId: string;
  durationMin: number;
  onComplete: (results: { answered: AnswerResult[]; questions: Question[] }) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [revealed, setRevealed] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(durationMin * 60);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          onComplete({ answered: results, questions });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const current = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;
  const isLast = currentIdx === questions.length - 1;

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);

    try {
      const resp = await fetch(`${MENTOR_AI_URL}/interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: current.id,
          answer_text: answer,
        }),
      });
      const data = await resp.json();
      const result: AnswerResult = {
        rating: data.debrief_rating,
        badge: data.debrief_badge,
        feedback: data.feedback,
      };
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
            <Brain size={16} className="text-purple-400" />
            <span className="font-black text-sm tracking-tight">DeployKaro Interview</span>
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
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
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
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                  {current.category}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${difficultyColor(current.difficulty)}`}>
                  {current.difficulty}
                </span>
              </div>

              {/* Question */}
              <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain size={14} className="text-purple-400" />
                  </div>
                  <p className="text-lg font-medium leading-relaxed text-white">{current.question}</p>
                </div>
              </div>

              {/* Answer Box */}
              {!revealed ? (
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                    }}
                    placeholder="Type your answer here... (Ctrl+Enter to submit)"
                    className="w-full h-44 bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 focus:border-purple-500/50 rounded-2xl px-5 py-4 text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none transition-colors"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {answer.length} chars · Ctrl+Enter to submit
                    </span>
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
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest px-5 py-2 rounded-xl transition-all"
                      >
                        {submitting ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Sparkles size={12} />
                          </motion.div>
                        ) : (
                          <Send size={12} />
                        )}
                        {submitting ? "Judging..." : "Submit"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Debrief Panel */
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
                  </motion.div>
                  <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all"
                  >
                    {isLast ? (
                      <>
                        <Trophy size={14} className="text-amber-400" /> See Results
                      </>
                    ) : (
                      <>
                        Next Question <ChevronRight size={14} />
                      </>
                    )}
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
  questions,
  results,
  durationMin,
  onRetry,
}: {
  questions: Question[];
  results: AnswerResult[];
  durationMin: number;
  onRetry: () => void;
}) {
  const router = useRouter();
  const excellent = results.filter((r) => r.rating === "excellent").length;
  const good      = results.filter((r) => r.rating === "good").length;
  const poor      = results.filter((r) => r.rating === "needs_work").length;
  const total     = results.length;
  const scorePct  = total > 0 ? Math.round((excellent / total) * 100) : 0;

  const grade =
    scorePct >= 80 ? { label: "Interview Ready", color: "text-emerald-400", emoji: "🏆" } :
    scorePct >= 60 ? { label: "Almost There",    color: "text-amber-400",   emoji: "🎯" } :
                     { label: "Keep Practicing", color: "text-rose-400",    emoji: "💪" };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${grade.color}`}>{grade.label}</h1>
          <p className="text-zinc-500 text-lg">You answered {total} of {questions.length} questions</p>

          <div className="mt-8 p-8 rounded-3xl border border-zinc-800 bg-zinc-900/40">
            <div className="text-7xl font-black tracking-tighter text-white mb-1">{scorePct}%</div>
            <div className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Excellence Score</div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: "Excellent", count: excellent, icon: CheckCircle2, color: "text-emerald-400" },
                { label: "Good",      count: good,      icon: Minus,        color: "text-amber-400"   },
                { label: "Needs Work", count: poor,     icon: AlertCircle,  color: "text-rose-400"    },
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-3">
            Question History
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {questions.slice(0, results.length).map((q, i) => {
              const r = results[i];
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 text-xs"
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{r?.badge || "–"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 line-clamp-1 font-medium">{q.question}</p>
                    <p className="text-zinc-600 mt-0.5">{r?.feedback}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${difficultyColor(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all"
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <button
            onClick={() => router.push("/mentor")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-2xl transition-all"
          >
            <Brain size={14} /> Ask Mentor <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId]   = useState<string>("");
  const [durationMin, setDurationMin] = useState(10);
  const [results, setResults]       = useState<AnswerResult[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleStart = useCallback(async (dur: DurationOption, exp: ExperienceLevel) => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${MENTOR_AI_URL}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "guest-user",
          experience_level: exp,
          duration_min: dur.mins,
        }),
      });

      if (!resp.ok) throw new Error("Failed to start interview");
      const data = await resp.json();

      setSessionId(data.session_id);
      setQuestions(data.questions);
      setDurationMin(data.duration_min);
      setPhase("interview");
    } catch (err) {
      // Graceful fallback: use mock questions if backend is down
      const mockQuestions: Question[] = [
        { id: 1, question: "Walk me through how you would design a zero-downtime deployment pipeline for a Node.js API.", category: "CI/CD", difficulty: "hard" },
        { id: 2, question: "A pod is stuck in CrashLoopBackOff in production. What are your first 3 commands?", category: "Kubernetes", difficulty: "hard" },
        { id: 3, question: "Your Terraform state is corrupted. How do you recover without destroying production?", category: "Terraform", difficulty: "hard" },
        { id: 4, question: "Explain how you would implement a canary deployment on Kubernetes.", category: "Kubernetes", difficulty: "hard" },
        { id: 5, question: "What is model drift and how do you detect it in an ML system?", category: "MLOps", difficulty: "medium" },
        { id: 6, question: "Design the CI/CD pipeline for training and deploying an ML model.", category: "MLOps", difficulty: "hard" },
        { id: 7, question: "How do you implement GitOps with ArgoCD? Walk through the full flow.", category: "GitOps", difficulty: "medium" },
        { id: 8, question: "Your S3 bucket just became public. What do you do in the next 10 minutes?", category: "Security", difficulty: "hard" },
        { id: 9, question: "Design a multi-region DR strategy for an RDS database with 15 min RPO.", category: "AWS", difficulty: "hard" },
        { id: 10, question: "Explain the three pillars of observability and which tools you use for each.", category: "Observability", difficulty: "easy" },
      ];

      setSessionId("offline-session");
      setQuestions(mockQuestions.slice(0, dur.questions));
      setDurationMin(dur.mins);
      setPhase("interview");
    } finally {
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 mx-auto mb-4"
          />
          <p className="text-zinc-400 text-sm font-bold">Preparing your interview...</p>
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
            onRetry={handleRetry}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
