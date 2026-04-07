"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package, Lock, FileCode, Settings, Layers, Laptop, Box, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualProps {
  isMuted?: boolean;
}

export function VisualTiffin({ isMuted }: VisualProps) {
  const [step, setStep] = useState(0); // 0: Start, 1: Packing, 2: Sealed, 3: Shipping

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        setStep(0);
        await new Promise(r => setTimeout(r, 1000));
        
        setStep(1); // Packing
        await new Promise(r => setTimeout(r, 4000));
        
        setStep(2); // Sealed
        await new Promise(r => setTimeout(r, 2000));
        
        setStep(3); // Shipping
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    sequence();
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-zinc-950 overflow-hidden">
      <div className="relative w-full max-w-2xl aspect-video border border-zinc-900 rounded-3xl bg-zinc-950 flex items-center justify-center overflow-hidden shadow-2xl">
        
        {/* Environment Backgrounds */}
        <div className="absolute inset-x-0 bottom-0 top-0 flex justify-around items-end pb-12 px-12 opacity-10">
            <Laptop className="w-24 h-24 text-zinc-600" />
            <Laptop className="w-24 h-24 text-zinc-600" />
            <Laptop className="w-24 h-24 text-zinc-600" />
        </div>

        {/* 3-Tier Stainless Steel Tiffin Box */}
        <motion.div 
            animate={{ 
                y: step === 3 ? [0, -10, 0] : 0,
                x: step === 3 ? [-180, 0, 180] : 0,
                scale: step === 2 ? 1.02 : 1
            }}
            transition={{ 
                x: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative z-20 flex flex-col items-center"
        >
            {/* The Vertical Carry Handle */}
            <motion.div 
                animate={{ rotateX: step >= 2 ? 0 : -20 }}
                className="w-32 h-48 border-4 border-zinc-400 rounded-t-full absolute -top-8 z-10 pointer-events-none opacity-40"
            />

            {/* Top Tier */}
            <TiffinTier 
                color="bg-zinc-300" 
                label="Environment (Env)" 
                icon={<Settings size={14} className="text-amber-600" />}
                isActive={step >= 1}
                delay={2.5}
            />

            {/* Middle Tier */}
            <TiffinTier 
                color="bg-zinc-400" 
                label="Dependencies (Node)" 
                icon={<Layers size={14} className="text-emerald-600" />}
                isActive={step >= 1}
                delay={1.5}
            />

            {/* Bottom Tier */}
            <TiffinTier 
                color="bg-zinc-500" 
                label="App Code" 
                icon={<FileCode size={14} className="text-blue-600" />}
                isActive={step >= 1}
                delay={0.5}
            />

            {/* Metal Latches (The Locking Mechanism) */}
            <AnimatePresence>
                {step >= 2 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-between px-2 py-8 z-40 pointer-events-none"
                    >
                        <div className="w-2 h-32 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <div className="w-2 h-32 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>

        {/* Global Seal Status */}
        <AnimatePresence>
            {step >= 2 && (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-12 flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-tighter"
                >
                    <Lock size={14} fill="currentColor" /> Image Sealed
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="mt-8 max-w-lg text-center">
        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2">
            The Stainless Steel Docker Tiffin
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
            Just like a real 3-tier tiffin, Docker keeps your <span className="text-blue-400 font-bold">Code</span>, 
            <span className="text-emerald-400 font-bold">Dependencies</span>, and <span className="text-amber-400 font-bold">Settings</span> separated but securely locked together. 
            Carry it to any machine—it tastes the same!
        </p>
      </div>

      {/* Audio Persistence */}
      <AudioTiffinTrigger step={step} isMuted={isMuted} />
    </div>
  );
}

function TiffinTier({ color, label, icon, isActive, delay }: { color: string, label: string, icon: any, isActive: boolean, delay: number }) {
    return (
        <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={isActive ? { y: 0, opacity: 1 } : {}}
            transition={{ delay, type: "spring", damping: 15 }}
            className={`w-40 h-16 ${color} border-y border-zinc-200/20 relative shadow-inner overflow-hidden flex items-center justify-center -mt-0.5 rounded-sm`}
        >
            {/* Metallic Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
            
            <div className="relative z-10 flex flex-col items-center gap-0.5">
                {icon}
                <span className="text-[9px] font-black uppercase text-zinc-800/80 tracking-tighter leading-none">{label}</span>
            </div>
            
            {/* Branding Detail */}
            <span className="absolute bottom-1 right-1 text-[6px] font-mono text-black/20 font-bold">DOCKER-TIFFIN-V1</span>
        </motion.div>
    );
}

function AudioTiffinTrigger({ step, isMuted }: { step: number, isMuted?: boolean }) {
    useEffect(() => {
        if (step === 2 && !isMuted) {
            // Satisfying metal latch sound
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"); 
            audio.volume = 0.15;
            audio.play().catch(() => {});
        }
    }, [step, isMuted]);
    return null;
}
