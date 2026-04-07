"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Sparkles, Zap, ArrowRight, CheckCircle2, Terminal,
  Ship, Box, GitBranch, Cloud, BookOpen, Award,
  ChevronRight, Globe, Brain, Users, BarChart3,
  Play, Star, Shield, Coffee, User
} from "lucide-react";

// ── Data ─────────────────────────────────────────────
const PERSONAS = [
  { id: "ANNA", emoji: "🍱", name: "ANNA", lang: "Tamil", region: "Chennai", slang: "machan, da, solren...", color: "emerald", desc: "Street-smart, uses cricket & biryani analogies. Zero-nonsense DevOps expert." },
  { id: "BHAI", emoji: "🏏", name: "BHAI", lang: "Kannada", region: "Bangalore", slang: "guru, nodi, swalpa...", color: "amber", desc: "Energetic & direct. Keeps things fun with tech-park analogies." },
  { id: "DIDI", emoji: "🌶️", name: "DIDI", lang: "Telugu", region: "Hyderabad", slang: "babu, chala, easy undi...", color: "rose", desc: "Calm and patient. Walks you through every concept step by step." },
  { id: "BUDDY", emoji: "☕", name: "BUDDY", lang: "English", region: "Universal", slang: "Simple & friendly...", color: "sky", desc: "Friendly, structured, and certification-focused. For everyone." },
];

const TRACKS = [
  { icon: Cloud, label: "My First Deploy", hours: "2 hrs", level: "Beginner", color: "emerald", desc: "Servers → Cloud → Docker → Your first live app", slug: "my-first-deploy" },
  { icon: Box, label: "Container Wizard", hours: "4 hrs", level: "Beginner", color: "sky", desc: "Dockerfile → Build → Run → Push to registry", slug: "container-wizard" },
  { icon: GitBranch, label: "Pipeline Builder", hours: "6 hrs", level: "Intermediate", color: "purple", desc: "GitHub Actions → Automated tests → Auto-deploy", slug: "pipeline-builder" },
  { icon: Ship, label: "Kubernetes Tamer", hours: "8 hrs", level: "Intermediate", color: "blue", desc: "Pods → Deployments → Services → HPA → EKS", slug: "k8s-tamer" },
  { icon: Brain, label: "MLOps Engineer", hours: "10 hrs", level: "Advanced", color: "rose", desc: "Model packaging → Containerize → Deploy → Monitor", slug: "mlops-engineer" },
  { icon: Globe, label: "Multi-Cloud Architect", hours: "12 hrs", level: "Expert", color: "amber", desc: "Terraform → Multi-cloud → GitOps → ArgoCD", slug: "multi-cloud-architect" },
];

const CERTS = ["AWS CLF-C02", "AWS SAA-C03", "AWS DVA-C02", "GCP ACE", "GCP PCA", "Azure AZ-900", "Azure AZ-400", "CKA", "CKAD", "Terraform Associate", "Docker DCA"];

const HOW_IT_WORKS = [
  { step: "01", icon: Users, title: "Pick Your Mentor", desc: "Choose ANNA, BHAI, DIDI, or BUDDY. Select your language. Your mentor adapts to your slang, analogies, and learning speed.", color: "emerald" },
  { step: "02", icon: Play, title: "Learn Visually", desc: "Every concept starts with a real-world animated analogy — Tiffin boxes, cricket, post offices. Then the technical layer reveals itself.", color: "sky" },
  { step: "03", icon: Terminal, title: "Practice on Your Machine", desc: "Your mentor gives you the exact command. You run it. Paste the output back. Together you fix every error, live.", color: "purple" },
  { step: "04", icon: Award, title: "Earn & Share", desc: "Complete tracks, earn certified badges. Share to LinkedIn. Get career-ready with AI mock interviews and resume audits.", color: "amber" },
];

const STATS = [
  { value: "6", label: "Learning Tracks", icon: BookOpen },
  { value: "4", label: "Regional Mentors", icon: Globe },
  { value: "21+", label: "Certifications", icon: Award },
  { value: "NVIDIA NIM", label: "Powered By", icon: Zap },
];

// ── Reusable Components ───────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PersonaCard({ p, selected, onSelect }: { p: typeof PERSONAS[0]; selected: boolean; onSelect: () => void }) {
  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.08)]",
    amber:   "border-amber-500/60 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.08)]",
    rose:    "border-rose-500/60 bg-rose-500/5 shadow-[0_0_30px_rgba(244,63,94,0.08)]",
    sky:     "border-sky-500/60 bg-sky-500/5 shadow-[0_0_30px_rgba(14,165,233,0.08)]",
  };
  const dotMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber:   "bg-amber-500",
    rose:    "bg-rose-500",
    sky:     "bg-sky-400",
  };
  const textMap: Record<string, string> = {
    emerald: "text-emerald-400",
    amber:   "text-amber-400",
    rose:    "text-rose-400",
    sky:     "text-sky-400",
  };

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-300 group ${
        selected ? colorMap[p.color] : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
      }`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <CheckCircle2 size={14} className="text-black" />
        </motion.div>
      )}

      <div className="text-4xl mb-4">{p.emoji}</div>

      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-xl font-black tracking-tighter">{p.name}</h3>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
          selected ? `${textMap[p.color]} border-current/30 bg-current/5` : "text-zinc-500 border-zinc-700"
        }`}>{p.lang}</span>
      </div>

      <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{p.desc}</p>

      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${selected ? dotMap[p.color] : "bg-zinc-700"}`} />
        <span className="text-[10px] font-mono text-zinc-600 italic">&quot;{p.slang}&quot;</span>
      </div>
    </motion.button>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState("ANNA");
  const heroRef = useRef(null);

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" />
            <span className="font-black text-lg tracking-tighter">DeployKaro</span>
            <span className="text-[9px] font-black text-emerald-500/70 border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-full uppercase tracking-widest ml-1">Beta</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#tracks" className="hover:text-white transition-colors">Tracks</a>
            <a href="#certifications" className="hover:text-white transition-colors">Certifications</a>
          </div>

          <button
            onClick={() => router.push("/onboarding")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/20"
          >
            Start Free <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 px-6 overflow-hidden">

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Spinning orbit ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-zinc-800/30 rounded-full animate-spin-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-zinc-800/20 rounded-full pointer-events-none" style={{ animationDuration: "35s" }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 rounded-full mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Powered by NVIDIA NIM · Llama 3.1 405B</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6"
          >
            Learn DevOps{" "}
            <span className="text-gradient">the way</span>
            <br />
            your anna{" "}
            <span className="text-gradient">would teach.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            India&apos;s first <strong className="text-white">regional-language AI DevOps mentor</strong>. Learn Docker, Kubernetes, CI/CD and cloud
            with <em>animated analogies</em> — explained in Tamil, Kannada, Telugu or English like you&apos;re 10 years old.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              id="hero-cta-start"
              onClick={() => signIn("keycloak", { callbackUrl: "/onboarding" })}
              className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-emerald-900/40 hover:shadow-emerald-500/20 animate-pulse-glow"
            >
              <Sparkles size={16} />
              Start Learning Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => signIn("keycloak", { callbackUrl: "/mentor" })}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 px-8 py-4 rounded-2xl transition-all"
            >
              <Play size={14} />
              Try the Mentor Now
            </button>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-zinc-500 font-bold uppercase tracking-widest"
          >
            {["No credit card", "All levels welcome", "Free to start", "Your own machine"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500" /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Floating chat bubble preview */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 max-w-xs"
        >
          {[
            { role: "user", text: "ANNA, Docker ennanu sollu simple-a?" },
            { role: "anna", text: "🍱 Machan, Docker is exactly like a stainless steel tiffin box da! Your code, dependencies, config — all packed tight, sealed with a lock. Take it to any machine — it opens fresh! [VISUAL:vis_docker_tiffin]" },
          ].map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.3 }}
              className={`p-4 rounded-2xl text-xs leading-relaxed border max-w-[280px] ${
                msg.role === "user"
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 self-end"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200 self-start"
              }`}
            >
              {msg.role === "anna" && <span className="text-[9px] font-black text-emerald-400 block mb-1 uppercase tracking-widest">ANNA · NVIDIA NIM</span>}
              {msg.text}
            </motion.div>
          ))}
        </motion.div>

      </section>

      {/* ── STATS BAR ────────────────────────────────── */}
      <section className="border-y border-zinc-900 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-1 text-center">
                <s.icon size={18} className="text-emerald-500 mb-1" />
                <span className="text-3xl font-black tracking-tighter text-gradient">{s.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</span>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────── */}
      <div className="py-6 border-b border-zinc-900 overflow-hidden opacity-40">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...CERTS, ...CERTS].map((c, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
              <Star size={10} className="text-amber-500" fill="currentColor" /> {c}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-20">
              <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-4">The DeployKaro Method</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                How it <span className="text-gradient">actually works</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => {
              const colorMap: Record<string, { text: string; border: string; bg: string }> = {
                emerald: { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
                sky:     { text: "text-sky-400",     border: "border-sky-500/30",     bg: "bg-sky-500/10" },
                purple:  { text: "text-purple-400",  border: "border-purple-500/30",  bg: "bg-purple-500/10" },
                amber:   { text: "text-amber-400",   border: "border-amber-500/30",   bg: "bg-amber-500/10" },
              };
              const c = colorMap[step.color];
              return (
                <FadeUp key={step.step} delay={i * 0.12}>
                  <div className={`h-full p-6 rounded-3xl border ${c.border} ${c.bg} flex flex-col gap-4`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                        <step.icon size={18} className={c.text} />
                      </div>
                      <span className={`text-4xl font-black ${c.text} opacity-20 leading-none`}>{step.step}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg tracking-tight mb-1">{step.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PERSONA SECTION ──────────────────────────── */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-4">
              <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-4">Meet Your Mentor</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                Pick your <span className="text-gradient">teaching style</span>
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto">
                Every mentor teaches the same concepts, but in your language — using the food, sport, and culture you grew up with.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              {PERSONAS.map((p) => (
                <PersonaCard
                  key={p.id}
                  p={p}
                  selected={selectedPersona === p.id}
                  onSelect={() => setSelectedPersona(p.id)}
                />
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push("/onboarding")}
                className="group inline-flex items-center gap-2 text-sm font-black text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Start learning with {selectedPersona}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── TRACKS ───────────────────────────────────── */}
      <section id="tracks" className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-4">Learning Tracks</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                From zero to <span className="text-gradient">cloud architect</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRACKS.map((track, i) => {
              const levelColorMap: Record<string, string> = {
                Beginner:     "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                Advanced:     "text-rose-400 bg-rose-500/10 border-rose-500/20",
                Expert:       "text-purple-400 bg-purple-500/10 border-purple-500/20",
              };
              const iconColorMap: Record<string, string> = {
                emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                sky:     "text-sky-400 bg-sky-500/10 border-sky-500/20",
                purple:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
                blue:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
                rose:    "text-rose-400 bg-rose-500/10 border-rose-500/20",
                amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
              };
              return (
                <FadeUp key={track.slug} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="h-full p-6 rounded-3xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all cursor-pointer group flex flex-col gap-4"
                    onClick={() => router.push("/mentor")}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${iconColorMap[track.color]}`}>
                        <track.icon size={20} />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${levelColorMap[track.level]}`}>
                        {track.level}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg tracking-tight">{track.label}</h3>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{track.desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{track.hours}</span>
                      <ChevronRight size={14} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VISUAL ENGINE PREVIEW ─────────────────────── */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div>
                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-4">Visual Learning Engine</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
                  Every concept has a <span className="text-gradient">real-world twin</span>
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-8">
                  Before we show you any technical diagram, we show you something you already understand.
                  Then — with one click — it <em>morphs</em> into the technical concept.
                </p>
                <div className="space-y-3">
                  {[
                    { analogy: "🍱 Tiffin Box", tech: "Docker Container", color: "sky" },
                    { analogy: "🍳 Restaurant Kitchen", tech: "Virtual Server / EC2", color: "orange" },
                    { analogy: "⚡ Electricity Grid", tech: "Cloud Computing", color: "amber" },
                    { analogy: "🚢 Fleet Admiral", tech: "Kubernetes Control Plane", color: "blue" },
                  ].map((item) => (
                    <div key={item.analogy} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-sm">
                      <span className="font-bold text-white">{item.analogy}</span>
                      <ArrowRight size={14} className="text-zinc-600" />
                      <span className="text-zinc-400">{item.tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Fake visual engine preview */}
            <FadeUp delay={0.2}>
              <div className="relative">
                <div className="w-full aspect-square max-w-md mx-auto rounded-3xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col">
                  {/* Header bar */}
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-500/80">Engine: Analogy Mode</span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-900">Peel back ➜</div>
                  </div>
                  {/* Tiffin animation preview */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-24 h-4 bg-zinc-400 rounded-sm border-y border-zinc-300/20 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10" />
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
                      </div>
                      <div className="w-24 h-4 bg-zinc-500 rounded-sm border-y border-zinc-300/10 relative overflow-hidden shadow-inner -mt-0.5">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-black/10" />
                      </div>
                      <div className="w-24 h-4 bg-zinc-600 rounded-sm border-y border-zinc-300/10 relative overflow-hidden shadow-inner -mt-0.5">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-black/10" />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 bg-emerald-500 text-black rounded-full px-3 py-0.5 text-[8px] font-black">
                        Image Sealed ✓
                      </div>
                    </motion.div>
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">The Stainless Steel Docker Tiffin</p>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[9px] font-black px-3 py-2 rounded-2xl backdrop-blur-sm"
                >
                  🍱 Docker = Tiffin Box
                </motion.div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[9px] font-black px-3 py-2 rounded-2xl backdrop-blur-sm"
                >
                  8 visual analogies ready
                </motion.div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ────────────────────────────── */}
      <section id="certifications" className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-4">Certification Prep</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                Prep for <span className="text-gradient">21+ exams</span>
              </h2>
              <p className="text-zinc-500 max-w-lg mx-auto mt-4">
                Every concept is mapped to real exam domains. After learning, switch to Cert Prep mode — and ANNA drills you with actual exam-style questions.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
              {CERTS.map((cert) => (
                <div key={cert} className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm font-bold text-zinc-300 hover:border-amber-500/40 hover:text-white transition-all cursor-default">
                  <Award size={12} className="text-amber-500" />
                  {cert}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <div className="relative p-1 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-blue-500/10">
              <div className="bg-zinc-950 rounded-[1.8rem] p-16 border border-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
                <Sparkles size={32} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                  Your anna is <span className="text-gradient">waiting.</span>
                </h2>
                <p className="text-zinc-400 mb-10 leading-relaxed">
                  Pick your mentor, choose your track, and start learning DevOps the way you were always meant to —
                  with someone who speaks your language.
                </p>
                <button
                  id="final-cta-start"
                  onClick={() => router.push("/onboarding")}
                  className="group inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-emerald-900/40 hover:shadow-emerald-500/20"
                >
                  <Sparkles size={16} />
                  Start Learning — It&apos;s Free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[11px] text-zinc-600 mt-6 font-mono uppercase tracking-widest">No signup needed · Works on your own machine</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            <span className="font-black tracking-tighter">DeployKaro</span>
            <span className="text-zinc-700">·</span>
            <span className="text-[10px] text-zinc-600 font-mono">learn cloud, natively</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-zinc-500">
            <span>Built with ❤️ for Indian developers</span>
            <span className="text-zinc-700">·</span>
            <span>NVIDIA NIM × Llama 3.1</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
