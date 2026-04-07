"use client";

import { motion } from "framer-motion";
import { Mail, Globe, MapPin, Send, Zap } from "lucide-react";

export function VisualInternet({ isMuted = false }) {
    const packets = Array.from({ length: 6 });

    return (
        <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-12 overflow-hidden relative">
            
            {/* The Animated Delivery Lane */}
            <div className="relative w-full max-w-2xl h-80 flex items-center justify-between border-y-2 border-zinc-900 overflow-hidden">
                
                {/* Visualizing the "Network" Background */}
                <div className="absolute inset-0 opacity-10 flex flex-col justify-around">
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                </div>

                {/* Sender: The Home Office */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-zinc-900 border border-zinc-700 rounded-3xl flex items-center justify-center relative p-4 group">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Globe size={40} className="text-emerald-500" />
                        </motion.div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                    </div>
                    <div className="text-center">
                        <h4 className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest leading-none">The Sender</h4>
                        <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold italic tracking-tighter">Your Browser</p>
                    </div>
                </div>

                {/* The "Post Office" Router (Center) */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center relative p-6 group">
                        <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping opacity-20" />
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/10"
                        />
                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center relative shadow-2xl">
                            <Mail size={32} className="text-amber-500" />
                            <div className="absolute -bottom-1 -right-1 text-emerald-500 bg-zinc-950 rounded p-0.5">
                                <Zap size={10} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h4 className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest leading-none">The Post Office</h4>
                        <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold italic tracking-tighter">DNS & Router</p>
                    </div>
                </div>

                {/* Receiver: The Server Castle */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-zinc-900 border border-zinc-700 rounded-3xl flex items-center justify-center relative p-4 group">
                        <Send size={40} className="text-amber-500/80 -rotate-45" />
                    </div>
                    <div className="text-center">
                        <h4 className="text-[10px] text-zinc-100 font-bold uppercase tracking-widest leading-none">The Destination</h4>
                        <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold italic tracking-tighter">WebServer IP</p>
                    </div>
                </div>

                {/* Animated Packet Flow (Home -> Router -> Destination) */}
                {packets.map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -280, opacity: 0, scale: 0.5 }}
                        animate={{ 
                            x: [ -280, 0, 280 ],
                            opacity: [ 0, 1, 1, 0 ],
                            scale: [ 0.5, 1, 1, 0.5 ]
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            delay: i * 0.5,
                            ease: "easeInOut"
                        }}
                        className="absolute left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center -translate-y-8"
                    >
                        <div className="w-3 h-3 bg-amber-500 rounded shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center justify-center">
                           <div className="w-1 h-1 bg-white rounded-full opacity-50" />
                        </div>
                    </motion.div>
                ))}

            </div>

            {/* Labels & Legends */}
            <div className="mt-12 flex justify-center gap-12">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center">
                        <MapPin size={8} className="text-emerald-500" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-1">IP Addressing</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center">
                        <Mail size={8} className="text-amber-500" />
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-1">Packet Delivery</span>
                </div>
            </div>

            <p className="absolute bottom-12 text-[11px] text-zinc-600 italic font-mono uppercase tracking-[0.2em] opacity-40">
                Network Latency: 24ms | TCP/IP Optimized
            </p>

        </div>
    );
}
