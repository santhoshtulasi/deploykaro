"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileCode, Play, Terminal, Layers, Box, CheckCircle2, ChevronRight, Utensils } from "lucide-react";
import { useState, useEffect } from "react";

interface VisualProps {
  isMuted?: boolean;
}

export function VisualDockerfile({ isMuted }: VisualProps) {
  const [step, setStep] = useState(0); // 0: Idle, 1-4: Instructions, 5: Finished
  const [isBuilding, setIsBuilding] = useState(false);

  const instructions = [
    { cmd: "FROM node:18-alpine", analogy: "Select the base tiffin box (Steel v1.0).", layer: "Base" },
    { cmd: "COPY . /app", analogy: "Pack the App Code into the tiffin side-dishes.", layer: "Content" },
    { cmd: "RUN npm install", analogy: "Prepare & cook everything (Prepare the meal).", layer: "Processing" },
    { cmd: "CMD ['node', 'app.js']", analogy: "The serving instruction: Serve hot on port 3000!", layer: "Execute" }
  ];

  const handleBuild = async () => {
    setIsBuilding(true);
    setStep(0);
    for (let i = 1; i <= instructions.length; i++) {
        await new Promise(r => setTimeout(r, 1500));
        setStep(i);
        if (!isMuted) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
            audio.volume = 0.05;
            audio.play().catch(() => {});
        }
    }
    await new Promise(r => setTimeout(r, 1000));
    setStep(5);
    setIsBuilding(false);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-zinc-950 overflow-hidden">
      
      <div className="relative w-full max-w-4xl aspect-video border border-zinc-900 rounded-3xl bg-zinc-950 flex shadow-2xl overflow-hidden">
        
        {/* LEFT: The Recipe (Dockerfile) */}
        <div className="w-1/2 border-r border-zinc-900 bg-zinc-900/20 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-zinc-800 p-1.5 rounded-lg border border-zinc-700">
                    <FileCode size={16} className="text-blue-400" />
                </div>
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Dockerfile Recipe</h4>
            </div>

            <div className="flex-1 font-mono text-sm space-y-4">
                {instructions.map((inst, i) => (
                    <motion.div 
                        key={i}
                        animate={{ 
                            opacity: step > i ? 1 : 0.4,
                            x: step === i + 1 ? 10 : 0,
                            color: step === i + 1 ? "#3b82f6" : "#71717a"
                        }}
                        className={`p-3 rounded-xl border ${step === i + 1 ? 'border-blue-500/30 bg-blue-500/5' : 'border-transparent'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={step === i+1 ? "text-blue-400 font-bold" : ""}>{inst.cmd}</span>
                            {step > i + 1 && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>
                        <AnimatePresence>
                            {step === i + 1 && (
                                <motion.p 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="text-[10px] text-zinc-400 mt-2 font-sans italic"
                                >
                                    Concept: {inst.analogy}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            <button 
                onClick={handleBuild}
                disabled={isBuilding}
                className="mt-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
                {isBuilding ? <Box className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                {isBuilding ? "BUILDING IMAGE..." : "BUILD THE TIFFIN"}
            </button>
        </div>

        {/* RIGHT: The Cooking (Tiffin Assembly) */}
        <div className="w-1/2 relative bg-zinc-950 flex flex-col items-center justify-center p-12">
            
            {/* The 3-Tier Assembly */}
            <div className="relative flex flex-col items-center pointer-events-none">
                {/* Lid */}
                <motion.div 
                    animate={{ y: step >= 4 ? 0 : -300, opacity: step >= 4 ? 1 : 0 }}
                    className="w-36 h-4 bg-zinc-400 border border-zinc-200/20 rounded-t-full shadow-inner relative z-40"
                />

                {/* Tier 3 (Env) */}
                <motion.div 
                    animate={{ y: step >= 3 ? 0 : -300, opacity: step >= 3 ? 1 : 0 }}
                    className="w-36 h-12 bg-zinc-300 border-x border-zinc-200/20 relative z-30 flex items-center justify-center"
                >
                    <Layers size={14} className="text-amber-600/40" />
                </motion.div>

                {/* Tier 2 (Dependencies) */}
                <motion.div 
                    animate={{ y: step >= 2 ? 0 : -300, opacity: step >= 2 ? 1 : 0 }}
                    className="w-36 h-12 bg-zinc-400 border-x border-zinc-200/20 relative z-20 flex items-center justify-center"
                >
                    <Utensils size={14} className="text-emerald-600/40" />
                </motion.div>

                {/* Tier 1 (Base Box) */}
                <motion.div 
                    animate={{ y: step >= 1 ? 0 : -300, opacity: step >= 1 ? 1 : 0 }}
                    className="w-36 h-12 bg-zinc-500 border-x border-b border-zinc-200/20 rounded-b-lg relative z-10 flex items-center justify-center shadow-2xl"
                >
                    <Box size={14} className="text-blue-600/40" />
                </motion.div>

                {/* Celebration Check */}
                <AnimatePresence>
                    {step === 5 && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center z-50"
                        >
                            <div className="bg-emerald-500 p-4 rounded-full shadow-[0_0_30px_#10b981]">
                                <CheckCircle2 className="text-white w-12 h-12" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Visual Status Label */}
            <div className="absolute bottom-8 text-center px-4 w-full">
                <AnimatePresence mode="wait">
                    <motion.p 
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-loose"
                    >
                        {step === 0 ? "READY TO COOK" :
                         step === 5 ? "SUCCESS: Docker Image Ready" :
                         `Step ${step}: Assembling Layer...`}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>

      </div>

      <div className="mt-8 max-w-lg text-center">
        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2">
            The Recipe Analogy
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
            A <span className="text-blue-400 font-bold">Dockerfile</span> is just a recipe. 
            It tells Docker exactly what to do step-by-step so the lunchbox (Container) 
            comes out <span className="text-emerald-400 font-bold">Perfect Every Time</span> on any machine.
        </p>
      </div>
    </div>
  );
}
