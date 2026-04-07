"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Box, Ship, Cpu, HardDrive, Wifi, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface VisualProps {
  isMuted?: boolean;
}

const SHIPS = [
  { id: 1, label: "Worker Ship 1", ip: "10.0.0.11", cpu: "2 vCPU", ram: "4 GB", pods: ["nginx-pod", "api-pod", "cache-pod"] },
  { id: 2, label: "Worker Ship 2", ip: "10.0.0.12", cpu: "4 vCPU", ram: "8 GB", pods: ["db-pod", "worker-pod"] },
  { id: 3, label: "Worker Ship 3", ip: "10.0.0.13", cpu: "2 vCPU", ram: "4 GB", pods: ["monitor-pod"] },
];

const POD_COLORS = [
  "bg-sky-500/20 border-sky-500/50 text-sky-300",
  "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
  "bg-purple-500/20 border-purple-500/50 text-purple-300",
  "bg-amber-500/20 border-amber-500/50 text-amber-300",
  "bg-rose-500/20 border-rose-500/50 text-rose-300",
];

export function VisualK8sNodes({ isMuted }: VisualProps) {
  const [selectedShip, setSelectedShip] = useState<number | null>(null);
  const [newPodShip, setNewPodShip] = useState<number | null>(null);
  const [deployedPods, setDeployedPods] = useState<{ [shipId: number]: string[] }>({
    1: ["nginx-pod", "api-pod", "cache-pod"],
    2: ["db-pod", "worker-pod"],
    3: ["monitor-pod"],
  });

  // Simulate a new pod being scheduled every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const shipId = Math.ceil(Math.random() * 3);
      setNewPodShip(shipId);
      setDeployedPods(prev => {
        const existing = prev[shipId] || [];
        if (existing.length >= 4) return prev; // ship full
        return { ...prev, [shipId]: [...existing, `new-pod-${Date.now().toString().slice(-3)}`] };
      });
      setTimeout(() => setNewPodShip(null), 2500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-zinc-950 overflow-hidden">
      <div className="relative w-full max-w-4xl border border-zinc-900 rounded-3xl bg-zinc-950 flex flex-col items-center p-8 overflow-hidden shadow-2xl gap-6">
        
        {/* Ocean background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <motion.div
            animate={{ x: [-200, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 w-[200%] h-24"
            style={{
              background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(59,130,246,0.3) 40px, rgba(59,130,246,0.3) 80px)",
            }}
          />
        </div>

        {/* Control Plane label at top */}
        <div className="flex items-center gap-3 self-start">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
            <Ship size={14} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Fleet Admiral — K8s Control Plane</span>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
            />
          </div>
          <span className="text-[9px] text-zinc-600 font-mono">Scheduling pods to the healthiest ship...</span>
        </div>

        {/* Worker Ships Row */}
        <div className="flex gap-6 w-full justify-center">
          {SHIPS.map((ship, sIdx) => {
            const isSelected = selectedShip === ship.id;
            const isReceiving = newPodShip === ship.id;
            const pods = deployedPods[ship.id] || [];

            return (
              <motion.button
                key={ship.id}
                onClick={() => setSelectedShip(isSelected ? null : ship.id)}
                animate={{
                  y: [0, sIdx % 2 === 0 ? -4 : -2, 0],
                  boxShadow: isReceiving
                    ? ["0 0 0px rgba(59,130,246,0)", "0 0 30px rgba(59,130,246,0.4)", "0 0 0px rgba(59,130,246,0)"]
                    : isSelected
                    ? "0 0 20px rgba(16,185,129,0.15)"
                    : "none",
                }}
                transition={{
                  y: { duration: 3 + sIdx * 0.7, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 1.5, repeat: isReceiving ? Infinity : 0 },
                }}
                className={`flex-1 min-w-[160px] max-w-[200px] rounded-2xl border p-4 flex flex-col gap-3 transition-all text-left ${
                  isSelected
                    ? "bg-zinc-900 border-emerald-500/60"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Ship header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Anchor size={14} className={isSelected ? "text-emerald-400" : "text-zinc-600"} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{ship.label}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                </div>

                {/* Ship specs */}
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    <Cpu size={8} className="text-zinc-500" />
                    <span className="text-[8px] text-zinc-500 font-mono">{ship.cpu}</span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    <HardDrive size={8} className="text-zinc-500" />
                    <span className="text-[8px] text-zinc-500 font-mono">{ship.ram}</span>
                  </div>
                </div>

                {/* Pods (Tiffin boxes on the ship) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Pods aboard</span>
                  <div className="flex flex-wrap gap-1">
                    {pods.map((pod, pIdx) => (
                      <motion.div
                        key={pod}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 12, delay: pIdx * 0.05 }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[7px] font-bold ${
                          POD_COLORS[pIdx % POD_COLORS.length]
                        }`}
                      >
                        <Box size={6} />
                        {pod}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Node IP */}
                <span className="text-[8px] font-mono text-zinc-700">{ship.ip}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Info panel when a ship is selected */}
        <AnimatePresence>
          {selectedShip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-4"
            >
              <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  Worker Ship {selectedShip} — the Node
                </p>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  This ship is a <span className="text-emerald-400 font-bold">Node</span> — a real physical or virtual machine.
                  The small coloured boxes on it are <span className="text-sky-400 font-bold">Pods</span> — the smallest unit K8s manages.
                  Each Pod is like a <span className="text-amber-400 font-bold">tiffin box</span>: it carries your container(s) safely aboard the ship.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New pod scheduling notification */}
        <AnimatePresence>
          {newPodShip && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-6 right-8 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full"
            >
              <Wifi size={10} className="text-blue-400 animate-pulse" />
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                Admiral scheduling pod → Ship {newPodShip}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer metaphor */}
      <div className="mt-6 max-w-xl text-center">
        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2 uppercase">
          Ships & Tiffin Boxes
        </h3>
        <p className="text-zinc-500 text-sm leading-relaxed">
          A <span className="text-emerald-400 font-bold">Node</span> is the cargo ship — a real machine with CPU and RAM.
          A <span className="text-sky-400 font-bold">Pod</span> is the tiffin box loaded onto that ship — it holds your running container.
          Click any ship to inspect its pods!
        </p>
      </div>
    </div>
  );
}
