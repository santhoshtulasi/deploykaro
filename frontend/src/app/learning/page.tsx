"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Cloud, Code, Settings, ArrowRight, Zap,
  CheckCircle2, Server, Globe, TerminalSquare,
  Trophy, RotateCcw, Clock, ChevronRight, Brain, Flame
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  saveLearningPlan, getLearningPlans, updateLearningPlanProgress
} from "@/lib/api";
import { type SavedLearningPlan, getStreak } from "@/lib/storage";
import { DebugMentorOverlay } from "@/components/learning/DebugMentorOverlay";
import UserAuthMenu from "@/components/profile/UserAuthMenu";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "wizard" | "loading" | "plan" | "complete";

type JargonTerm = {
  term: string;
  plain_meaning: string;
  analogy?: string;
};

type PlanStep = {
  step_number: number;
  title: string;
  description: string;
  actionable_command?: string;
  tools_used: string[];
  jargon_terms: JargonTerm[];
};

const CLOUD_PROVIDERS = [
  { id: "AWS", icon: Cloud, label: "AWS", color: "from-amber-500 to-orange-500" },
  { id: "GCP", icon: Globe, label: "GCP", color: "from-blue-500 to-sky-500" },
  { id: "Azure", icon: Server, label: "Azure", color: "from-sky-500 to-blue-600" },
  { id: "Vercel", icon: Zap, label: "Vercel", color: "from-zinc-400 to-zinc-200" },
];

const PRESET_TOOLS = [
  { id: "Docker", emoji: "🐳" },
  { id: "Kubernetes", emoji: "⚙️" },
  { id: "Terraform", emoji: "🏗️" },
  { id: "GitHub Actions", emoji: "🔁" },
  { id: "Vercel", emoji: "▲" },
  { id: "EKS", emoji: "☁️" },
  { id: "MLflow", emoji: "🧪" },
  { id: "Serverless", emoji: "⚡" },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "I'm brand new", emoji: "🌱", desc: "Simple language, extra detail" },
  { id: "intermediate", label: "I know the basics", emoji: "⚙️", desc: "Skip basics, focus on implementation" },
  { id: "senior", label: "I'm experienced", emoji: "🚀", desc: "Production-grade, concise steps" },
];

// ── Sub-component: ResumeBanner ───────────────────────────────────────────────

function ResumeBanner({ plans, onResume }: { plans: SavedLearningPlan[]; onResume: (p: SavedLearningPlan) => void }) {
  if (!plans.length) return null;

  return (
    <div className="mb-8">
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Continue where you left off</p>
      <div className="space-y-2">
        {plans.slice(0, 3).map(plan => {
          const pct = plan.steps.length > 0
            ? Math.round((plan.completed_steps.length / plan.steps.length) * 100)
            : 0;
          const isComplete = pct === 100;
          return (
            <button
              key={plan.id}
              onClick={() => onResume(plan)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-left group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${isComplete ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-zinc-800"}`}>
                {isComplete ? "✅" : "🏗️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{plan.project_title}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{plan.cloud_provider} · {plan.app_type}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500">{pct}%</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Sub-component: JargonPill ─────────────────────────────────────────────────
// When a user sees an unfamiliar term (SSL, HA, MTTR, orchestration, etc.),
// they tap the pill to expand a plain-language explanation + real-world analogy.

function JargonPill({ term }: { term: JargonTerm }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
          open
            ? "border-emerald-500 bg-emerald-500 text-black"
            : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-400"
        }`}
      >
        <Brain size={11} className={open ? "text-black" : "text-emerald-500"} /> 
        {term.term}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs space-y-2 max-w-xs shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                <Settings size={40} />
              </div>
              <p className="text-zinc-200 leading-relaxed font-medium">{term.plain_meaning}</p>
              {term.analogy && (
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1.5">Simplified View 💡</p>
                  <p className="text-zinc-400 leading-relaxed italic">
                    "{term.analogy}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-component: ProgressHeader ─────────────────────────────────────────────

function ProgressHeader({ plan, completed }: { plan: SavedLearningPlan; completed: number[] }) {
  const pct = plan.steps.length > 0 ? Math.round((completed.length / plan.steps.length) * 100) : 0;

  return (
    <div className="mb-8 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white">{plan.project_title}</h2>
          <p className="text-zinc-500 text-xs mt-0.5">{plan.cloud_provider} · {plan.app_type}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-emerald-400">{pct}%</div>
          <div className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">complete</div>
        </div>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono">
        <span>{completed.length} of {plan.steps.length} steps done</span>
        <span>{plan.steps.length - completed.length} remaining</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DeployAnythingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("wizard");
  const [activePlan, setActivePlan] = useState<SavedLearningPlan | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [previousPlans, setPreviousPlans] = useState<SavedLearningPlan[]>([]);
  const [streak, setStreak] = useState(0);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);

  // Wizard form state
  const [appType, setAppType] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [cloud, setCloud] = useState("AWS");
  const [tools, setTools] = useState<string[]>([]);
  const [expLevel, setExpLevel] = useState("beginner");

  // Debug Mentor state
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [activeDebugStep, setActiveDebugStep] = useState<any>(null);

  // Load saved plans and streak on mount
  useEffect(() => {
    setStreak(getStreak().current_streak);
    getLearningPlans().then(data => {
      setPreviousPlans(data.plans || []);
    }).catch(console.error);
  }, []);

  const handleResume = useCallback((plan: SavedLearningPlan) => {
    setActivePlan(plan);
    setCompletedSteps(plan.completed_steps);
    setPhase("plan");
  }, []);

  const handleGenerate = async () => {
    if (!appType.trim()) return;
    setPhase("loading");

    try {
      const MENTOR_AI_URL = process.env.NEXT_PUBLIC_MENTOR_AI_URL || "http://localhost:8000";
      const resp = await fetch(`${MENTOR_AI_URL}/learning/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          app_type: appType, 
          repo_url: repoUrl,
          cloud_provider: cloud, 
          tools, 
          experience_level: expLevel 
        }),
      });

      const data = await resp.json();
      const saved = await saveLearningPlan({
        app_type: appType,
        repo_url: repoUrl,
        cloud_provider: cloud,
        tools,
        project_title: data.project_title,
        architecture_summary: data.architecture_summary,
        steps: data.steps,
      });

      setActivePlan(saved);
      setCompletedSteps([]);
      getLearningPlans().then(d => setPreviousPlans(d.plans || [])).catch(console.error);
      setPhase("plan");
    } catch {
      const newPlanFallback = {
        id: "mock-" + Date.now().toString(),
        app_type: appType,
        cloud_provider: cloud,
        tools: tools,
        project_title: `Deploy ${appType} to ${cloud}`,
        architecture_summary: `Containerized deployment using ${tools.join(", ")} on ${cloud}.`,
        completed_steps: [],
        created_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        steps: [
          { step_number: 1, title: "Setup Your Environment", description: `Install and configure prerequisites for a ${cloud} deployment.`, actionable_command: "# Install CLI\ncurl 'https://awscli.amazonaws.com' -o 'awscliv2.zip'", tools_used: [cloud], jargon_terms: [] },
          { step_number: 2, title: "Containerize Your Application", description: "Create a Dockerfile to package your app into a reproducible image.", actionable_command: "docker build -t my-app:latest .\ndocker run -p 3000:3000 my-app:latest", tools_used: ["Docker"], jargon_terms: [] },
          { step_number: 3, title: "Configure Infrastructure", description: "Provision the cloud resources needed to host your application.", actionable_command: "terraform init\nterraform plan\nterraform apply -auto-approve", tools_used: ["Terraform"], jargon_terms: [] },
          { step_number: 4, title: "Deploy Application", description: "Push your container to a registry and deploy to your cloud environment.", actionable_command: "docker push my-app:latest\nkubectl apply -f deployment.yaml", tools_used: tools.length ? tools : ["Docker"], jargon_terms: [] },
          { step_number: 5, title: "Verify & Monitor", description: "Test the deployment and set up basic health monitoring.", actionable_command: "kubectl get pods -A\ncurl https://your-domain.com/health", tools_used: ["Kubernetes"], jargon_terms: [] },
        ],
      };

      setActivePlan(newPlanFallback as SavedLearningPlan);
      setCompletedSteps([]);
      getLearningPlans().then(d => setPreviousPlans(d.plans || [])).catch(console.error);
      setPhase("plan");
    }
  };

  const toggleStep = useCallback((stepNum: number) => {
    setCompletedSteps(prev => {
      const next = prev.includes(stepNum) ? prev.filter(n => n !== stepNum) : [...prev, stepNum];
      if (activePlan) {
        updateLearningPlanProgress(activePlan.id, next);
        // Check completion
        if (activePlan.steps.length > 0 && next.length === activePlan.steps.length) {
          setTimeout(() => setPhase("complete"), 400);
        }
        // Toast for newly completed step
        if (!prev.includes(stepNum)) {
          setLastCompleted(activePlan.steps.find(s => s.step_number === stepNum)?.title ?? null);
          setTimeout(() => setLastCompleted(null), 3000);
        }
      }
      return next;
    });
  }, [activePlan]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 selection:bg-emerald-500/30">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <Play size={16} className="text-emerald-500" />
            <span className="font-black text-sm tracking-tight text-emerald-400">DeployAnything</span>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Flame size={11} /> {streak}-day streak
              </div>
            )}
            <UserAuthMenu />
          </div>
        </div>
      </nav>

      {/* Toast */}
      <AnimatePresence>
        {lastCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-sm"
          >
            <CheckCircle2 size={16} /> Step complete! ✨ {lastCompleted}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ── WIZARD ── */}
          {phase === "wizard" && (
            <motion.div key="wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-black tracking-tighter mb-2">
                  Deploy{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">Anything.</span>
                </h1>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  Tell us what you want to build. AI will generate a step-by-step, interactive deployment guide — just for you.
                </p>
              </div>

              <ResumeBanner plans={previousPlans} onResume={handleResume} />

              <div className="space-y-6">
                {/* App Type */}
                <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                    <Code size={12} className="text-emerald-500" /> What do you want to deploy?
                  </label>
                  <input
                    type="text"
                    value={appType}
                    onChange={e => setAppType(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleGenerate()}
                    placeholder="e.g. Next.js App, PyTorch YOLOv5, FastAPI, React + Node.js..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-zinc-700 focus:ring-4 ring-emerald-500/10 mb-4"
                    autoFocus
                  />
                  
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                    <Globe size={12} className="text-emerald-500" /> Application Repo URL (optional)
                  </label>
                  <p className="text-xs text-zinc-500 mb-3">Paste any repo URL. We'll analyze the source code and architect a plan from scratch.</p>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-repo"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-zinc-700 focus:ring-4 ring-emerald-500/10"
                  />
                </div>

                {/* Experience Level */}
                <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                    <Brain size={12} className="text-emerald-500" /> Your experience level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {EXPERIENCE_LEVELS.map(l => (
                      <button
                        key={l.id}
                        onClick={() => setExpLevel(l.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${expLevel === l.id ? "border-emerald-500/50 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"}`}
                      >
                        <div className="text-xl mb-1">{l.emoji}</div>
                        <div className="text-xs font-black text-white">{l.label}</div>
                        <div className="text-[9px] text-zinc-600 mt-0.5 leading-relaxed">{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cloud */}
                <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                    <Cloud size={12} className="text-emerald-500" /> Target Cloud
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CLOUD_PROVIDERS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCloud(c.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-sm transition-all ${cloud === c.id ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400"}`}
                      >
                        <c.icon size={15} />
                        <span className="font-bold">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                    <Settings size={12} className="text-emerald-500" /> Tools you want to use <span className="text-zinc-700">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TOOLS.map(t => {
                      const active = tools.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTools(prev => active ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${active ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300" : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"}`}
                        >
                          <span>{t.emoji}</span> {t.id}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!appType.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-emerald-900/30"
                >
                  Generate My Plan <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="w-14 h-14 rounded-2xl border-2 border-emerald-500/20 border-t-emerald-500 mb-6"
              />
              <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Architecting your plan...</p>
              <p className="text-zinc-600 text-xs mt-2">AI is designing your deployment infrastructure</p>
            </motion.div>
          )}

          {/* ── PLAN ── */}
          {phase === "plan" && activePlan && (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ProgressHeader plan={activePlan} completed={completedSteps} />
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">{activePlan.architecture_summary}</p>

              {/* Stepladder */}
              <div className="relative">
                <div className="absolute left-[23px] top-0 bottom-0 w-px bg-zinc-800 z-0" />
                <div className="space-y-5 relative z-10">
                  {activePlan.steps.map((step) => {
                    const isDone = completedSteps.includes(step.step_number);
                    return (
                      <motion.div
                        key={step.step_number}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: step.step_number * 0.05 }}
                        className="flex gap-5"
                      >
                        <button
                          onClick={() => toggleStep(step.step_number)}
                          className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all duration-300 ${isDone
                            ? "border-emerald-500 bg-emerald-500 text-black shadow-[0_0_24px_rgba(16,185,129,0.4)]"
                            : "border-zinc-700 bg-zinc-950 text-zinc-500 hover:border-emerald-500/60 hover:text-emerald-400"}`}
                        >
                          {isDone ? <CheckCircle2 size={18} /> : step.step_number}
                        </button>

                        <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${isDone ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"}`}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className={`font-black text-base ${isDone ? "text-zinc-400 line-through" : "text-white"}`}>{step.title}</h3>
                            {isDone && <span className="text-emerald-500 text-xs font-black uppercase tracking-widest flex-shrink-0">Done ✓</span>}
                          </div>
                          {!isDone && <p className="text-sm text-zinc-400 leading-relaxed mb-4">{step.description}</p>}

                          {step.actionable_command && !isDone && (
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <TerminalSquare size={12} className="text-zinc-600" />
                                  <span className="text-[9px] uppercase tracking-widest font-black text-zinc-600">Command</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveDebugStep(step);
                                    setIsDebugOpen(true);
                                  }}
                                  className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                                >
                                  <Brain size={10} /> Caught an error?
                                </button>
                              </div>
                              <code className="text-xs text-sky-300 font-mono whitespace-pre-wrap block leading-relaxed">
                                {step.actionable_command}
                              </code>
                            </div>
                          )}

                          {step.tools_used?.length > 0 && !isDone && (
                            <div className="flex flex-wrap gap-1.5">
                              {step.tools_used.map(t => (
                                <span key={t} className="text-[9px] uppercase tracking-widest font-black text-zinc-600 border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* ── Jargon Terms ── */}
                          {step.jargon_terms && step.jargon_terms.length > 0 && !isDone && (
                            <div className="mt-4 pt-4 border-t border-zinc-800/60">
                              <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/70 mb-2">📖 Terms explained</p>
                              <div className="flex flex-wrap gap-2">
                                {step.jargon_terms.map(jt => (
                                  <JargonPill key={jt.term} term={jt} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <button onClick={() => { setPhase("wizard"); setActivePlan(null); setCompletedSteps([]); }}
                  className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all">
                  <RotateCcw size={13} /> New Plan
                </button>
                <button onClick={() => router.push("/dashboard")}
                  className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 hover:border-emerald-500/40 bg-zinc-900 hover:bg-emerald-500/5 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all">
                  Dashboard <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── COMPLETION ── */}
          {phase === "complete" && activePlan && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-16">
              <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-5xl mb-6 shadow-[0_0_60px_rgba(16,185,129,0.4)]">
                  🚀
                </div>
              </motion.div>

              <h2 className="text-3xl font-black tracking-tight mb-2">You deployed it!</h2>
              <p className="text-emerald-400 font-bold text-lg mb-1">{activePlan.project_title}</p>
              <p className="text-zinc-500 text-sm mb-8 max-w-sm">
                You completed all {activePlan.steps.length} steps. You just used{" "}
                <strong className="text-white">{activePlan.tools.join(", ") || activePlan.cloud_provider}</strong> to deploy on{" "}
                <strong className="text-white">{activePlan.cloud_provider}</strong>.
              </p>

              <div className="flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-10">
                <Trophy size={14} /> Deployment Complete — Badge Earned
              </div>

              <div className="flex gap-3 w-full max-w-sm">
                <button onClick={() => { setPhase("wizard"); setActivePlan(null); setCompletedSteps([]); }}
                  className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all">
                  <RotateCcw size={13} /> Deploy Another
                </button>
                <button onClick={() => router.push("/interview")}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all">
                  <Brain size={13} /> Test Your Skills
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <DebugMentorOverlay
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        activeStep={activeDebugStep}
      />
    </div>
  );
}
