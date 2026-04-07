"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface StepProps {
  next: () => void;
  update: (data: any) => void;
  data: any;
}

export function StepWelcome({ next, update, data }: StepProps) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20"
      >
        <Sparkles className="w-12 h-12 text-emerald-500" />
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Welcome to DeployKaro
        </h1>
        <p className="text-zinc-400 text-lg max-w-sm mx-auto">
          Let&apos;s personalize your learning experience. First, what should we call you?
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={data.displayName}
          onChange={(e) => update({ displayName: e.target.value })}
          placeholder="Enter your name"
          autoFocus
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-center text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700"
        />

        <button
          onClick={next}
          disabled={!data.displayName.trim()}
          className="group w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          Begin Journey
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
