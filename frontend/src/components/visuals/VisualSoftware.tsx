"use client";

import { motion } from "framer-motion";
import { Package, Puzzle, Hammer, Castle } from "lucide-react";

export function VisualSoftware({ isMuted = false }) {
    const bricks = [
        { id: 1, color: "bg-blue-500", x: -40, y: 40, label: "Core Logic" },
        { id: 2, color: "bg-emerald-500", x: 40, y: 40, label: "Database" },
        { id: 3, color: "bg-amber-500", x: 0, y: 0, label: "Auth Layer" },
        { id: 4, color: "bg-purple-500", x: -40, y: -40, label: "Frontend" },
        { id: 5, color: "bg-rose-500", x: 40, y: -40, label: "API Gateway" }
    ];

    return (
        <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative overflow-hidden">
            {/* The Construction Zone */}
            <div className="relative w-80 h-80 flex items-center justify-center border-2 border-dashed border-zinc-900 rounded-3xl">
                
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-5" 
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                />

                {/* Animated Bricks */}
                {bricks.map((brick, i) => (
                    <motion.div
                        key={brick.id}
                        initial={{ opacity: 0, y: 100, scale: 0.5 }}
                        animate={{ opacity: 1, y: brick.y, x: brick.x, scale: 1 }}
                        transition={{ 
                            delay: i * 0.3, 
                            type: "spring", 
                            stiffness: 100, 
                            damping: 15 
                        }}
                        className={`absolute w-16 h-16 ${brick.color} rounded-xl shadow-2xl flex items-center justify-center group cursor-pointer`}
                    >
                        <div className="relative">
                            <Puzzle size={24} className="text-white/80 group-hover:scale-110 transition-transform" />
                            {/* Studs on top of Lego block */}
                            <div className="absolute -top-1 left-2 w-3 h-3 bg-white/20 rounded-full" />
                            <div className="absolute -top-1 right-2 w-3 h-3 bg-white/20 rounded-full" />
                        </div>

                        {/* Label Tooltip */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-0.5 rounded text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                            {brick.label}
                        </div>
                    </motion.div>
                ))}

                {/* Final Connection Glow */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                    className="absolute inset-0 bg-emerald-500 rounded-3xl blur-[100px]"
                />

            </div>

            {/* Side Labels */}
            <div className="absolute bottom-8 left-8 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Package size={14} className="text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">Modular Architecture</span>
                </div>
                <div className="flex items-center gap-2">
                    <Hammer size={14} className="text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">Continuous Assembly</span>
                </div>
            </div>

            <div className="absolute top-8 right-8">
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <Castle size={20} className="text-amber-500" />
                    <div>
                        <h4 className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest leading-none">The Final App</h4>
                        <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold italic tracking-tighter">Solid & Scalable</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
