"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Rocket, Check, ArrowLeft, ArrowRight } from "lucide-react";

interface StepProps {
  next: () => void;
  back: () => void;
  update: (data: any) => void;
  data: any;
}

const LEVELS = [
  {
    id: "BEGINNER",
    label: "Fresh Start",
    desc: "I'm new to DevOps. Teach me the basics from scratch.",
    icon: GraduationCap,
    slug: "beginner",
  },
  {
    id: "INTERMEDIATE",
    label: "Upskilling",
    desc: "I know the core concepts, help me master advanced tools.",
    icon: Briefcase,
    slug: "intermediate",
  },
  {
    id: "ADVANCED",
    label: "Architect",
    desc: "I want deep architectural reviews and IaC generation.",
    icon: Rocket,
    slug: "advanced",
  },
];

export function StepExperience({ next, back, update, data }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Your Experience Level
        </h2>
        <p className="text-zinc-500">We will tailor the content difficulty to your current skill set.</p>
      </div>

      <div className="space-y-4">
        {LEVELS.map((L) => {
          const Icon = L.icon;
          const isSelected = data.experienceLevel === L.id;
          return (
            <button
              key={L.id}
              onClick={() => update({ experienceLevel: L.id })}
              className={`w-full p-5 rounded-2xl text-left transition-all relative border flex items-center gap-6 ${
                isSelected
                  ? "bg-zinc-900 border-emerald-500 shadow-lg shadow-emerald-500/10"
                  : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                <Icon className="w-7 h-7" />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg">{L.label}</h3>
                <p className="text-sm text-zinc-500 mt-0.5">{L.desc}</p>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0"
                >
                  <Check className="w-4 h-4 text-black font-bold" />
                </motion.div>
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
          Finalize
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
