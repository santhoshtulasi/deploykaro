"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, RefreshCw, CheckCircle2, AlertTriangle, Zap, Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualProps {
  isMuted?: boolean;
}

type PodStatus = "running" | "crashing" | "restarting" | "healed";

interface PodState {
  id: number;
  name: string;
  status: PodStatus;
  restarts: number;
}

const INITIAL_PODS: PodState[] = [
  { id: 1, name: "api-pod-7d4f", status: "running", restarts: 0 },
  { id: 2, name: "web-pod-3c9a", status: "running", restarts: 0 },
  { id: 3, name: "worker-pod-1b2e", status: "running", restarts: 0 },
];

export function VisualK8sHealing({ isMuted }: VisualProps) {
  const [pods, setPods] = useState<PodState[]>(INITIAL_PODS);
  const [healingPodId, setHealingPodId] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([
    "[kubelet] All pods running nominally",
    "[scheduler] Desired state: 3 replicas ✓",
  ]);

  const appendLog = (msg: string) => {
    setLog(prev => [...prev.slice(-4), msg]);
  };

  const crashPod = (podId: number) => {
    // 1. Crash it
    setPods(prev => prev.map(p => p.id === podId ? { ...p, status: "crashing" } : p));
    appendLog(`[ERROR] ${pods.find(p => p.id === podId)?.name} — OOMKilled ☠️`);

    // 2. K8s detects mismatch from desired state → restarts
    setTimeout(() => {
      setPods(prev => prev.map(p => p.id === podId ? { ...p, status: "restarting" } : p));
      setHealingPodId(podId);
      appendLog(`[kubelet] Liveness probe failed → restarting pod...`);

      if (!isMuted) {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {}
      }
    }, 1500);

    // 3. Healed!
    setTimeout(() => {
      setPods(prev =>
        prev.map(p =>
          p.id === podId ? { ...p, status: "healed", restarts: p.restarts + 1 } : p
        )
      );
      appendLog(`[scheduler] New pod scheduled — replacing fallen phoenix 🔥`);

      if (!isMuted) {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch {}
      }
    }, 4000);

    // 4. Settle back to running
    setTimeout(() => {
      setPods(prev => prev.map(p => p.id === podId ? { ...p, status: "running" } : p));
      setHealingPodId(null);
      appendLog(`[pod] Pod healthy again! Restarts: ${(pods.find(p => p.id === podId)?.restarts ?? 0) + 1}`);
    }, 6000);
  };

  // Auto-crash demo every 15 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      crashPod(Math.ceil(Math.random() * 3));
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  const getStatusColor = (s: PodStatus) => {
    if (s === "running") return "border-emerald-500/60 bg-emerald-500/5";
    if (s === "crashing") return "border-rose-500/80 bg-rose-500/10";
    if (s === "restarting") return "border-amber-500/60 bg-amber-500/5";
    if (s === "healed") return "border-sky-500/60 bg-sky-500/10";
    return "";
  };

  const getStatusIcon = (s: PodStatus) => {
    if (s === "running") return <Heart size={14} className="text-emerald-400" fill="currentColor" />;
    if (s === "crashing") return <Flame size={14} className="text-rose-400 animate-pulse" />;
    if (s === "restarting") return <RefreshCw size={14} className="text-amber-400 animate-spin" />;
    if (s === "healed") return <Zap size={14} className="text-sky-400" />;
  };

  const getStatusLabel = (s: PodStatus) => {
    if (s === "running") return { text: "Running", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (s === "crashing") return { text: "☠️ Crashed", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (s === "restarting") return { text: "⏳ Restarting", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    if (s === "healed") return { text: "🔥 Phoenix!", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
    return { text: "", color: "" };
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-zinc-950 overflow-hidden">
      <div className="relative w-full max-w-4xl border border-zinc-900 rounded-3xl bg-zinc-950 p-8 overflow-hidden shadow-2xl flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <RefreshCw size={12} className="text-rose-400" />
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
              K8s Self-Healing Engine
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-mono">
            <AlertTriangle size={10} className="text-zinc-600" />
            Click a pod to simulate a crash
          </div>
        </div>

        {/* Pod Grid */}
        <div className="flex gap-5 justify-center">
          {pods.map((pod) => {
            const lbl = getStatusLabel(pod.status);
            return (
              <motion.button
                key={pod.id}
                onClick={() => pod.status === "running" && crashPod(pod.id)}
                animate={{
                  scale: pod.status === "crashing" ? [1, 1.05, 0.95, 1] : 1,
                }}
                transition={{ duration: 0.4 }}
                className={`flex-1 min-w-[140px] max-w-[200px] rounded-2xl border-2 p-5 flex flex-col gap-3 transition-all text-left ${getStatusColor(pod.status)} ${
                  pod.status === "running" ? "cursor-pointer hover:border-rose-500/40 group" : "cursor-default"
                }`}
              >
                {/* Icon + status */}
                <div className="flex items-center justify-between">
                  <motion.div
                    animate={pod.status === "restarting" ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    {getStatusIcon(pod.status)}
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={pod.status}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${lbl.color}`}
                    >
                      {lbl.text}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Pod name */}
                <div>
                  <p className="text-xs font-bold text-white font-mono">{pod.name}</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5 font-mono">restarts: {pod.restarts}</p>
                </div>

                {/* Heartbeat bar */}
                <div className="h-6 flex items-end gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={
                        pod.status === "running" || pod.status === "healed"
                          ? { scaleY: [0.2, Math.random() * 0.8 + 0.2, 0.2] }
                          : { scaleY: 0.1 }
                      }
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                      className={`flex-1 rounded-sm origin-bottom ${
                        pod.status === "running" ? "bg-emerald-500/60" :
                        pod.status === "crashing" ? "bg-rose-500/60" :
                        pod.status === "restarting" ? "bg-amber-500/60" :
                        "bg-sky-500/60"
                      }`}
                    />
                  ))}
                </div>

                {/* Hover hint */}
                {pod.status === "running" && (
                  <p className="text-[7px] text-zinc-700 group-hover:text-rose-500 transition-colors font-bold uppercase tracking-widest">
                    👆 Click to crash
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Live kubectl log */}
        <div className="p-4 bg-black/60 border border-zinc-800 rounded-2xl font-mono text-[10px] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-500 uppercase font-bold tracking-widest text-[8px]">Live kubectl events</span>
          </div>
          <AnimatePresence mode="popLayout">
            {log.map((entry, i) => (
              <motion.p
                key={entry + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`leading-tight ${
                  entry.includes("ERROR") || entry.includes("☠️") ? "text-rose-400" :
                  entry.includes("phoenix") || entry.includes("🔥") ? "text-sky-400" :
                  entry.includes("healthy") || entry.includes("✓") ? "text-emerald-400" :
                  "text-zinc-500"
                }`}
              >
                {entry}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* Desired state readout */}
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-[9px] text-zinc-400 font-mono">Desired: 3 pods</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Heart size={12} className="text-emerald-400" fill="currentColor" />
            <span className="text-[9px] text-zinc-400 font-mono">
              Actual: {pods.filter(p => p.status === "running" || p.status === "healed").length} pods
            </span>
          </div>
        </div>
      </div>

      {/* Footer metaphor */}
      <div className="mt-6 max-w-xl text-center">
        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2 uppercase">
          The Phoenix Pod
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Like the <span className="text-rose-400 font-bold">Phoenix bird</span> — when a pod dies,
          K8s immediately brings it <span className="text-sky-400 font-bold">back from the ashes</span>.
          It watches the <span className="text-amber-400 font-bold">liveness probe</span>, detects the mismatch,
          and restarts automatically. You <span className="text-emerald-400 font-bold">never have to wake up at 3AM</span>.
        </p>
      </div>
    </div>
  );
}
