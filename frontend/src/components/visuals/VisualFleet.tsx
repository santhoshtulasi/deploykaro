"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Ship, Anchor, Music, Radio, Wifi, Send, Settings, Terminal, Box } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualProps {
  isMuted?: boolean;
}

export function VisualFleet({ isMuted }: VisualProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [nodes, setNodes] = useState([
    { id: 1, status: "healthy", pods: 3 },
    { id: 2, status: "healthy", pods: 2 },
    { id: 3, status: "loading", pods: 0 }
  ]);

  useEffect(() => {
    // Simulation: Deploying new pods or healing nodes
    const interval = setInterval(() => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setNodes(prev => prev.map(n => 
                n.status === "loading" ? { ...n, status: "healthy", pods: 2 } : n
            ));
        }, 3000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-zinc-950 overflow-hidden">
      
      {/* The Orchestrated Ocean */}
      <div className="relative w-full max-w-4xl aspect-video border border-zinc-900 rounded-3xl bg-zinc-950 flex flex-col items-center justify-center p-12 overflow-hidden shadow-2xl">
        
        {/* Deep Ocean Waves Background */}
        <div className="absolute inset-0 opacity-10 flex flex-col justify-end pointer-events-none">
            <motion.div 
                animate={{ x: [-100, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="h-32 w-[200%] bg-gradient-to-r from-blue-900/0 via-blue-500/20 to-blue-900/0"
                style={{ clipPath: "polygon(0 50%, 5% 45%, 10% 50%, 15% 45%, 20% 50%, 25% 45%, 30% 50%, 35% 45%, 40% 50%, 45% 45%, 50% 50%, 55% 45%, 60% 50%, 65% 45%, 70% 50%, 75% 45%, 80% 50%, 85% 45%, 90% 50%, 95% 45%, 100% 50%, 100% 100%, 0 100%)" }}
            />
        </div>

        {/* TOP: The Admiral Ship (Control Plane) */}
        <div className="relative z-30 mb-20 flex flex-col items-center">
            <motion.div 
                animate={{ 
                    y: [0, -5, 0],
                    boxShadow: isSyncing 
                        ? ["0 0 20px rgba(59,130,246,0.1)", "0 0 60px rgba(59,130,246,0.5)", "0 0 20px rgba(59,130,246,0.1)"]
                        : "0 0 20px rgba(59,130,246,0.1)"
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-40 h-20 bg-zinc-900 rounded-[2rem] border-2 border-blue-500 flex items-center justify-center relative overflow-hidden"
            >
                <Ship className="text-white w-10 h-10" />
                <div className="absolute top-0 right-0 p-2">
                    <Music className={`text-blue-500 w-4 h-4 ${isSyncing ? 'animate-bounce' : 'opacity-20'}`} />
                </div>
                {/* Command Waves (Orchestration) */}
                <AnimatePresence>
                    {isSyncing && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 3, opacity: 0.1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bg-blue-500 rounded-full w-40 h-40"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
            <div className="mt-3 text-center">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Fleet Admiral (K8s Control Plane)
                </span>
            </div>
        </div>

        {/* BOTTOM: Cargo Ships (Worker Nodes) */}
        <div className="relative z-20 flex gap-12 items-baseline">
            {nodes.map((node, i) => (
                <div key={node.id} className="flex flex-col items-center gap-4">
                    {/* Admiral's Connection Wave */}
                    <AnimatePresence>
                        {isSyncing && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 80, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-[1px] bg-gradient-to-b from-blue-500 to-transparent absolute -top-20"
                            />
                        )}
                    </AnimatePresence>

                    {/* Node Ship */}
                    <motion.div 
                        animate={{ 
                            rotate: [0, i % 2 === 0 ? 1 : -1, 0],
                            y: [0, 2, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                        className={`w-28 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                            node.status === "healthy" ? "bg-zinc-900 border-zinc-800" : "bg-blue-500/5 border-blue-500/20"
                        }`}
                    >
                        <Anchor size={16} className={node.status === "healthy" ? "text-zinc-700" : "text-blue-500 animate-pulse"} />
                    </motion.div>

                    {/* Pods on the Ship (Tiffin Boxes) */}
                    <div className="flex gap-1">
                        {Array.from({ length: 4 }).map((_, p) => (
                            <motion.div 
                                key={p}
                                initial={false}
                                animate={{ 
                                    opacity: p < node.pods ? 1 : 0.1,
                                    scale: p < node.pods ? 1 : 0.8
                                }}
                                className="w-4 h-4 bg-zinc-800 rounded-sm border border-zinc-700 flex items-center justify-center"
                            >
                                <Box size={8} className="text-zinc-500" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                        Worker Ship {node.id}
                    </div>
                </div>
            ))}
        </div>

        {/* METRICS OVERLAY */}
        <div className="absolute top-8 right-8 flex flex-col gap-2">
            <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl flex flex-col min-w-[140px]">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Desired State</span>
                    <Settings size={12} className="text-zinc-600" />
                </div>
                <div className="text-xl font-mono text-white mt-1">12 Pods</div>
            </div>
            <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl flex flex-col min-w-[140px]">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase">Actual State</span>
                    <motion.div 
                        animate={isSyncing ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Radio size={12} className="text-emerald-500" />
                    </motion.div>
                </div>
                <div className="text-xl font-mono text-white mt-1">7/12 Pods</div>
            </div>
        </div>

      </div>

      {/* METAPHOR FOOTER */}
      <div className="mt-8 max-w-xl text-center">
        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2 uppercase">
            The Admiral’s Command
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
            Kubernetes is the **Fleet Admiral**. It doesn't move the cargo itself; it **commands** the worker nodes to keep the fleet healthy. 
            If a ship sinks (Node fails) or cargo is lost (Pod crashes), the Admiral automatically 
            **Rebalances** the fleet to match the "Desired Melody."
        </p>
      </div>

      <AudioFleetTrigger isSyncing={isSyncing} isMuted={isMuted} />
    </div>
  );
}

function AudioFleetTrigger({ isSyncing, isMuted }: { isSyncing: boolean, isMuted?: boolean }) {
    useEffect(() => {
        if (isSyncing && !isMuted) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"); 
            audio.volume = 0.05;
            audio.play().catch(() => {});
        }
    }, [isSyncing, isMuted]);
    return null;
}
