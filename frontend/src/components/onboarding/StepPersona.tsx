"use client";

import { motion } from "framer-motion";
import { User, Shield, Zap, Coffee, Check, ArrowLeft, ArrowRight } from "lucide-react";

interface StepProps {
  next: () => void;
  back: () => void;
  update: (data: any) => void;
  data: any;
}

const PERSONAS = [
  {
    id: "ANNA",
    name: "ANNA",
    lang: "TAMIL",
    desc: "Street-smart, uses local analogies. No-nonsense DevOps expert.",
    icon: Zap,
    color: "emerald",
  },
  {
    id: "BUDDY",
    name: "BUDDY",
    lang: "ENGLISH",
    desc: "Friendly, structured, and certification-focused mentor.",
    icon: Coffee,
    color: "blue",
  },
  {
    id: "DIDI",
    name: "DIDI",
    lang: "TELUGU",
    desc: "Calm, supportive, and explains concepts step-by-step.",
    icon: Shield,
    color: "rose",
  },
  {
    id: "BHAI",
    name: "BHAI",
    lang: "KANNADA",
    desc: "Direct, energetic, and keeps learning fun with local slang.",
    icon: User,
    color: "amber",
  },
];

export function StepPersona({ next, back, update, data }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Choose Your Mentor
        </h2>
        <p className="text-zinc-500">Pick the vibe that matches your learning style.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PERSONAS.map((p) => {
          const Icon = p.icon;
          const isSelected = data.persona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => update({ persona: p.id, language: p.lang })}
              className={`p-6 rounded-2xl text-left transition-all relative border overflow-hidden group ${
                isSelected
                  ? "bg-zinc-900 border-emerald-500 shadow-lg shadow-emerald-500/10"
                  : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-black font-bold" />
                  </motion.div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {p.name}
                  <span className="text-xs font-normal text-zinc-600 px-2 py-0.5 border border-zinc-800 rounded-full bg-zinc-900">
                    {p.lang}
                  </span>
                </h3>
                <p className="text-sm text-zinc-500 mt-1">{p.desc}</p>
              </div>

              {/* Hover Glow Effect */}
              {!isSelected && (
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className={`w-1 h-1 bg-white blur-[2px] rounded-full`} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={back}
          className="flex-1 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all leading-none"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={next}
          className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all leading-none"
        >
          Continue
          <ArrowRight className="w-5 h-5 leading-none" />
        </button>
      </div>
    </div>
  );
}
