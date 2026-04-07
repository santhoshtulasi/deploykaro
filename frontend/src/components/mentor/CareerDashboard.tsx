"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Briefcase, Sparkles, Gauge, Award, Zap, Star } from "lucide-react";
import { Leaderboard } from "../profile/Leaderboard";
import { CertificationReadiness } from "../profile/CertificationReadiness";

interface Achievement {
    slug: string;
    titleEn: string;
    badgeUrl: string;
    earnedAt: string;
}

interface TrackProgressItem {
    slug: string;
    titleEn: string;
    completedPct: number;
}

interface CareerDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    xp: number;
    readinessPct: number;
    achievements?: Achievement[];
    trackProgress?: TrackProgressItem[];
    totalConceptsCompleted?: number;
}

export function CareerDashboard({
    isOpen,
    onClose,
    xp,
    readinessPct,
    achievements = [],
    trackProgress = [],
    totalConceptsCompleted = 0,
}: CareerDashboardProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                    />

                    {/* Side Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[450px] bg-zinc-950 border-l border-zinc-900 shadow-2xl z-[90] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Briefcase className="text-amber-500" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white leading-tight">Career Hub</h2>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">Progress & Reputation</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-8">

                            {/* ── XP & Concepts Stats ── */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={12} className="text-amber-500" fill="currentColor" />
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total XP</span>
                                    </div>
                                    <span className="text-2xl font-black text-amber-400 font-mono">{xp}</span>
                                </div>
                                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={12} className="text-emerald-500" fill="currentColor" />
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Concepts</span>
                                    </div>
                                    <span className="text-2xl font-black text-emerald-400 font-mono">{totalConceptsCompleted}</span>
                                </div>
                            </div>

                            {/* ── Earned Badges ── */}
                            {achievements.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-2">
                                        <Award size={14} className="text-zinc-600" />
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Earned Badges</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {achievements.map((badge, i) => (
                                            <motion.div
                                                key={badge.slug}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="p-4 bg-gradient-to-br from-amber-500/10 to-zinc-900 border border-amber-500/30 rounded-2xl flex flex-col items-center gap-2 text-center"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                                    <Trophy size={22} className="text-amber-500" />
                                                </div>
                                                <p className="text-[10px] font-black text-amber-300 leading-tight">{badge.titleEn}</p>
                                                <p className="text-[8px] text-zinc-600 font-mono">
                                                    {new Date(badge.earnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Cert Readiness ── */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <Gauge size={14} className="text-zinc-600" />
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Exam Preparedness</span>
                                </div>
                                <CertificationReadiness readinessPct={readinessPct} trackProgress={trackProgress} />
                            </div>

                            {/* ── Leaderboard ── */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <Trophy size={14} className="text-zinc-600" />
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Global Hall of Fame</span>
                                </div>
                                <Leaderboard />
                            </div>

                            {/* ── Career Tips Footer ── */}
                            <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="text-indigo-200 font-bold flex items-center gap-2">
                                        <Sparkles size={16} className="text-indigo-400" />
                                        Next Career Milestone
                                    </h4>
                                    <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                                        Complete <strong className="text-zinc-300">Track 2 (Orchestration)</strong> to unlock the <strong className="text-zinc-300">Kubernetes Certified</strong> badge and get priority for Associate DevOps roles.
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Briefcase size={60} className="text-indigo-500" />
                                </div>
                            </div>

                        </div>

                        {/* Sticky Action Footer */}
                        <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
                            <button
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.1)] active:scale-[0.98]"
                            >
                                View Career Readiness Report
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
