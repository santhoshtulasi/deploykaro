"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Volume2, Mic2, Plus, Minus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualProps {
  isMuted?: boolean;
}

const SPEAKER_CONFIGS = [
  { id: 1, label: "Speaker 1", delay: 0 },
  { id: 2, label: "Speaker 2", delay: 0.2 },
  { id: 3, label: "Speaker 3", delay: 0.4 },
  { id: 4, label: "Speaker 4", delay: 0.6 },
  { id: 5, label: "Speaker 5", delay: 0.8 },
];

export function VisualK8sScaling({ isMuted }: VisualProps) {
  const [crowd, setCrowd] = useState(30); // % of total crowd
  const [replicas, setReplicas] = useState(2);
  const [isScaling, setIsScaling] = useState(false);
  const [scaleDir, setScaleDir] = useState<"up" | "down" | null>(null);

  // Auto crowd simulation: crowd grows → triggers scale-up
  useEffect(() => {
    const interval = setInterval(() => {
      setCrowd(prev => {
        const next = prev + (Math.random() > 0.4 ? 15 : -10);
        const clamped = Math.max(10, Math.min(100, next));
        return clamped;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // HPA reaction: auto-scale based on crowd
  useEffect(() => {
    const ideal = crowd > 75 ? 5 : crowd > 50 ? 4 : crowd > 30 ? 3 : 2;
    if (ideal !== replicas && !isScaling) {
      setIsScaling(true);
      setScaleDir(ideal > replicas ? "up" : "down");
      setTimeout(() => {
        setReplicas(ideal);
        setIsScaling(false);
        setScaleDir(null);
      }, 2000);
    }
  }, [crowd]);

  const manualScale = (dir: "up" | "down") => {
    const next = dir === "up" ? Math.min(5, replicas + 1) : Math.max(1, replicas - 1);
    if (next !== replicas) {
      setIsScaling(true);
      setScaleDir(dir);
      setTimeout(() => {
        setReplicas(next);
        setIsScaling(false);
        setScaleDir(null);
      }, 1500);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-zinc-950 overflow-hidden">
      <div className="relative w-full max-w-4xl border border-zinc-900 rounded-3xl bg-zinc-950 p-8 overflow-hidden shadow-2xl flex flex-col gap-8">

        {/* HPA badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
            <TrendingUp size={12} className="text-purple-400" />
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
              Horizontal Pod Autoscaler (HPA)
            </span>
            {isScaling && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-[8px] font-black text-purple-300 uppercase"
              >
                scaling {scaleDir}...
              </motion.div>
            )}
          </div>

          {/* Manual controls */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-600 font-mono">Manual override</span>
            <button
              onClick={() => manualScale("down")}
              disabled={replicas <= 1 || isScaling}
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-rose-500 transition-all disabled:opacity-30"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-white font-black text-sm">{replicas}</span>
            <button
              onClick={() => manualScale("up")}
              disabled={replicas >= 5 || isScaling}
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-30"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Concert Stage */}
        <div className="relative flex flex-col items-center gap-6">

          {/* CROWD METER */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={12} className="text-zinc-500" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Crowd Load (CPU / Traffic)</span>
              </div>
              <motion.span
                key={Math.round(crowd)}
                initial={{ scale: 1.3, color: "#fff" }}
                animate={{ scale: 1, color: crowd > 75 ? "#f43f5e" : crowd > 50 ? "#f59e0b" : "#10b981" }}
                className="text-sm font-black font-mono"
              >
                {Math.round(crowd)}%
              </motion.span>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <motion.div
                animate={{ width: `${crowd}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full transition-colors ${
                  crowd > 75 ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]" :
                  crowd > 50 ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
                  "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                }`}
              />
            </div>
            <p className="text-[9px] text-zinc-600 font-mono">
              {crowd > 75 ? "⚡ HPA triggered: scaling UP to handle demand" :
               crowd < 25 ? "💤 HPA triggered: scaling DOWN to save cost" :
               "✅ Crowd normal: replicas holding steady"}
            </p>
          </div>

          {/* Stage with Speakers */}
          <div className="relative w-full">
            {/* Stage platform */}
            <div className="w-full h-4 rounded-full bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 border border-zinc-600/50 shadow-lg" />

            {/* Speakers */}
            <div className="flex items-end justify-center gap-8 pt-3">
              {SPEAKER_CONFIGS.map((spk) => {
                const isActive = spk.id <= replicas;
                const isNew = isScaling && scaleDir === "up" && spk.id === replicas + 1;
                const isRemoving = isScaling && scaleDir === "down" && spk.id === replicas;

                return (
                  <motion.div
                    key={spk.id}
                    initial={false}
                    animate={{
                      scale: isActive ? 1 : 0.7,
                      opacity: isActive ? 1 : 0.2,
                      y: isNew || isRemoving ? [10, 0] : 0,
                    }}
                    transition={{ delay: isActive ? spk.delay : 0, type: "spring", damping: 12 }}
                    className="flex flex-col items-center gap-1"
                  >
                    {/* Speaker box */}
                    <motion.div
                      animate={
                        isActive
                          ? {
                              boxShadow: [
                                "0 0 8px rgba(16,185,129,0.0)",
                                `0 0 ${10 + Math.round(crowd / 10)}px rgba(16,185,129,0.6)`,
                                "0 0 8px rgba(16,185,129,0.0)",
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity }}
                      className={`w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                        isActive
                          ? "bg-zinc-900 border-emerald-500/60"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <Volume2 size={16} className={isActive ? "text-emerald-400" : "text-zinc-700"} />
                      {isActive && (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((bar) => (
                            <motion.div
                              key={bar}
                              animate={{ scaleY: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 0.4,
                                repeat: Infinity,
                                delay: bar * 0.12,
                              }}
                              className="w-1 h-4 bg-emerald-500 rounded-full origin-bottom"
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Speaker label */}
                    <span className={`text-[7px] font-black uppercase tracking-widest ${isActive ? "text-emerald-600" : "text-zinc-700"}`}>
                      {isActive ? `Pod ${spk.id}` : "offline"}
                    </span>

                    {/* Scale badge */}
                    <AnimatePresence>
                      {(isNew || isRemoving) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${
                            isNew ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                            "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isNew ? "+ NEW" : "– DOWN"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Readout bar */}
          <div className="flex items-center w-full justify-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Active Replicas</span>
              <motion.span key={replicas} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-2xl font-black text-white">{replicas}</motion.span>
            </div>
            <div className="h-8 w-[1px] bg-zinc-800" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Each Speaker Serves</span>
              <span className="text-2xl font-black text-white">{Math.round(crowd / replicas)}%</span>
            </div>
            <div className="h-8 w-[1px] bg-zinc-800" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Max Replicas</span>
              <span className="text-2xl font-black text-zinc-600">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 max-w-xl text-center">
        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2 uppercase">
          More Speakers for a Bigger Crowd
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
          When the <span className="text-rose-400 font-bold">crowd grows</span>, K8s automatically adds more{" "}
          <span className="text-emerald-400 font-bold">speaker pods</span> so no one hears static.
          When the crowd leaves, it removes speakers to{" "}
          <span className="text-amber-400 font-bold">save cost</span>. This is{" "}
          <span className="text-purple-400 font-bold">Horizontal Scaling</span>.
        </p>
      </div>
    </div>
  );
}
