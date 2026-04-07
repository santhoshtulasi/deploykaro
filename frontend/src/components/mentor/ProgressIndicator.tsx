"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, Zap } from "lucide-react";

interface ProgressIndicatorProps {
  completedPct: number;
  totalConcepts: number;
  completedCount: number;
  lastUpdateConceptId?: string | null;
  xp?: number;
}

export function ProgressIndicator({ 
  completedPct, 
  totalConcepts, 
  completedCount, 
  lastUpdateConceptId,
  xp = 0
}: ProgressIndicatorProps) {
  return (
    <div className="flex flex-col gap-1 items-end min-w-[120px] relative group/indicator">
      <div className="flex items-center gap-3 mb-1">
        {/* XP Badge */}
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Zap size={10} className="text-amber-500" fill="currentColor" />
            <span className="text-[10px] font-black text-amber-200 font-mono">{xp} XP</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Progress</span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">{Math.round(completedPct)}%</span>
        </div>
      </div>
      
      {/* Tooltip Content */}
      <div className="absolute top-12 right-0 w-48 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl opacity-0 group-hover/indicator:opacity-100 pointer-events-none transition-all z-[100] text-[10px] leading-relaxed">
          <p className="text-white font-bold mb-1 italic">🚀 Your Learning Speed</p>
          <p className="text-zinc-500">
              You earn <span className="text-amber-500 font-bold">+10 XP</span> for every new DevOps concept you master. Complete tracks to climb the global leaderboard!
          </p>
          <div className="absolute -top-1 right-12 w-2 h-2 bg-zinc-900 border-t border-l border-zinc-800 rotate-45" />
      </div>

      {/* The Glow-Track Progress Bar */}
      <div className="relative w-40 h-1.5 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${completedPct}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        />
        
        {/* Rapid Pulse when updating */}
        <AnimatePresence>
            {lastUpdateConceptId && (
                <motion.div 
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: [0, 1, 0], x: 100 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 z-10"
                />
            )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 mt-1 opacity-60">
        <Trophy size={10} className={completedCount === totalConcepts ? "text-amber-500" : "text-zinc-500"} />
        <span className="text-[9px] text-zinc-400 font-medium">
            {completedCount}/{totalConcepts} Concepts Mastered
        </span>
      </div>

      {/* Success Tooltip/Badge for 100% */}
      <AnimatePresence>
        {completedPct === 100 && (
          <motion.div 
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute top-12 right-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-lg"
          >
            <Zap size={10} fill="currentColor" /> Track Master
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
