"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Home, Factory, DollarSign, Activity, Globe } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualProps {
  isMuted?: boolean;
}

export function VisualCloud({ isMuted }: VisualProps) {
  const [nodes, setNodes] = useState(1); // Scaling nodes (1 to 4)
  const [cost, setCost] = useState(0.00);
  const [isGridActive, setIsGridActive] = useState(true);

  useEffect(() => {
    // 1. Simulation Loop: Cost and Auto-Scaling
    const interval = setInterval(() => {
      setCost(prev => prev + (nodes * 0.001));
      
      // Random scaling every 6 seconds
      if (Math.random() > 0.7) {
        setNodes(n => (n % 4) + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nodes]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-zinc-950 overflow-hidden">
      
      {/* The Global Cloud Grid */}
      <div className="relative w-full max-w-3xl aspect-video border border-zinc-900 rounded-3xl bg-zinc-950 flex items-center justify-between p-12 overflow-hidden shadow-2xl">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* LEFT: The Cloud Provider (The Power Plant) */}
        <div className="relative flex flex-col items-center gap-4 z-20">
            <motion.div 
                animate={{ 
                    boxShadow: ["0 0 20px rgba(59,130,246,0.2)", "0 0 50px rgba(59,130,246,0.6)", "0 0 20px rgba(59,130,246,0.2)"] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center border-4 border-white/20"
            >
                <div className="relative">
                    <Globe className="text-white w-12 h-12 animate-pulse" />
                    <Zap className="absolute -top-4 -right-4 text-amber-300 w-8 h-8" fill="currentColor" />
                </div>
            </motion.div>
            <div className="text-center">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Cloud Utility</h4>
                <p className="text-blue-500 text-[9px] font-bold">AWS / AZURE / GCP</p>
            </div>
        </div>

        {/* CENTER: The Electricity Arcs (Horizontal Scaling Flow) */}
        <div className="flex-1 px-8 relative h-32">
            <AnimatePresence>
                {Array.from({ length: nodes }).map((_, i) => (
                    <motion.div 
                        key={i}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center"
                    >
                        <svg className="w-full h-full">
                            <motion.path 
                                d={`M 0,${64 + (i - (nodes-1)/2) * 20} L 200,${64 + (i - (nodes-1)/2) * 20}`}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                animate={{ strokeDashoffset: [0, -20] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        </svg>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* RIGHT: User Application (The Houses / Scaling Pods) */}
        <div className="relative flex flex-col items-center gap-4 z-20">
            <div className="grid grid-cols-2 gap-2">
                <AnimatePresence>
                    {Array.from({ length: nodes }).map((_, i) => (
                        <motion.div 
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden"
                        >
                            <Home className="text-white/40 w-6 h-6" />
                            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div className="text-center">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Your Application</h4>
                <p className="text-emerald-500 text-[9px] font-bold">{nodes} Nodes Running</p>
            </div>
        </div>

        {/* BOTTOM OVERLAY: Live Metrics */}
        <div className="absolute bottom-6 inset-x-0 px-8 flex justify-between items-end">
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl flex flex-col gap-1 min-w-[120px]">
                <div className="flex items-center gap-2 text-zinc-500 uppercase text-[9px] font-black tracking-widest">
                    <DollarSign size={10} /> Billing Loop
                </div>
                <div className="text-xl font-mono text-white font-bold">
                    ${cost.toFixed(3)}
                </div>
                <div className="text-[8px] text-zinc-600 font-bold">
                    PAY FOR WHAT YOU USE
                </div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl flex flex-col gap-1 min-w-[120px] items-end">
                <div className="flex items-center gap-2 text-emerald-500 uppercase text-[9px] font-black tracking-widest">
                    <Activity size={10} /> Auto-Scaling
                </div>
                <div className="text-xl font-mono text-white font-bold">
                    {nodes}x Pods
                </div>
                <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">
                    Capacity matching demand
                </div>
            </div>
        </div>

      </div>

      {/* Concept Focus Footer */}
      <div className="mt-8 max-w-lg text-center">
        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2 uppercase">
            The Utility Grid Analogy
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
            Just like electricity, you don't build the power plant—you just plug in your app. 
            When your traffic <span className="text-emerald-400 font-bold">Spikes</span>, 
            the grid scales up. When it <span className="text-zinc-400 font-bold">Drops</span>, the grid scales down. 
            You save money automatically.
        </p>
      </div>

      {/* Audio Persistence */}
      <AudioCloudTrigger nodes={nodes} isMuted={isMuted} />
    </div>
  );
}

function AudioCloudTrigger({ nodes, isMuted }: { nodes: number, isMuted?: boolean }) {
    useEffect(() => {
        if (!isMuted) {
            // Low hum sound for the grid
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"); 
            audio.volume = 0.05;
            audio.play().catch(() => {});
        }
    }, [nodes, isMuted]);
    return null;
}
