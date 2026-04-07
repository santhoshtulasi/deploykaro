"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Lock, Award, BookOpen, X, ChevronRight, Zap } from "lucide-react";

interface Concept {
  id: string;
  titleEn: string;
  titleTa?: string;
  visualId?: string;
  examDomains?: string[]; // e.g. ["SAA: Domain 1", "CKA: Architecture"]
}

interface Module {
  id: string;
  titleEn: string;
  order: number;
  concepts: Concept[];
}

interface Track {
  id: string;
  titleEn: string;
  modules: Module[];
}

interface TrackRoadmapProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  completedConcepts: string[];
  certificationGoal?: string; 
  allTracks?: Track[];
  onTrackChange?: (trackId: string) => void;
  onSendMessage?: (message: string, mode?: string) => void;
}

export function TrackRoadmap({ 
    isOpen, 
    onClose, 
    track, 
    completedConcepts, 
    certificationGoal = "AWS Cloud Practitioner",
    allTracks = [],
    onTrackChange,
    onSendMessage
}: TrackRoadmapProps) {
  if (!track) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Side Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-zinc-950 border-l border-zinc-900 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <BookOpen className="text-emerald-500" size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-white leading-tight">Learning Journey</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">{track.titleEn}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Track Selector */}
            <div className="px-6 mt-6">
                <div className="relative">
                    <select 
                        value={track.id}
                        onChange={(e) => onTrackChange?.(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 rounded-2xl outline-none appearance-none cursor-pointer hover:border-zinc-700 transition-all font-bold text-sm"
                    >
                        {allTracks.map(t => (
                            <option key={t.id} value={t.id}>{t.titleEn}</option>
                        ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-500 pointer-events-none" />
                </div>
            </div>

            {/* Certification Card */}
            <div className="mx-6 mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <Award className="text-amber-500" size={24} />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] text-amber-500 uppercase font-black tracking-tighter">Goal Certification</p>
                    <h3 className="font-bold text-amber-200">{certificationGoal}</h3>
                    <div className="mt-1 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-700"
                          style={{ width: `${Math.min(100, (completedConcepts.length / Math.max(1, track.modules.reduce((sum, m) => sum + m.concepts.length, 0))) * 100)}%` }}
                        />
                    </div>
                </div>
                <Zap className="text-amber-500/40" size={20} fill="currentColor" />
            </div>

            {/* Scrollable Roadmap */}
            <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                {track.modules.map((module, mIdx) => (
                    <div key={module.id} className="mb-10 relative">
                        {/* Module Divider */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap bg-zinc-950 pr-4 z-10">
                                Phase {module.order}: {module.titleEn}
                            </span>
                            <div className="h-[1px] w-full bg-zinc-900" />
                        </div>

                        {/* Concept Nodes */}
                        <div className="space-y-4 ml-2">
                            {module.concepts.map((concept, cIdx) => {
                                const isMastered = completedConcepts.includes(concept.id);
                                // A concept is unlocked if: it's the first in the track,
                                // OR the previous concept in this module is mastered
                                const prevConcept = cIdx > 0 ? module.concepts[cIdx - 1] : null;
                                const prevModuleLastConcept = mIdx > 0 ? track.modules[mIdx - 1]?.concepts?.slice(-1)[0] : null;
                                const prevMastered = cIdx === 0
                                  ? (mIdx === 0 || completedConcepts.includes(prevModuleLastConcept?.id ?? ""))
                                  : completedConcepts.includes(prevConcept?.id ?? "");
                                const isLocked = !isMastered && !prevMastered && !(mIdx === 0 && cIdx === 0);
                                const isCurrent = !isMastered && !isLocked;

                                return (
                                    <div key={concept.id} className="flex items-center gap-6 group relative">
                                        {/* Connector Line */}
                                        {cIdx < module.concepts.length - 1 && (
                                            <div className="absolute left-[11px] top-[24px] w-[2px] h-[32px] bg-zinc-900 group-hover:bg-zinc-800 transition-colors" />
                                        )}

                                        {/* Node Icon */}
                                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                            isMastered ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                            isCurrent ? 'bg-zinc-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] anim-glow' :
                                            'bg-zinc-950 border-zinc-900'
                                        }`}>
                                            {isMastered ? <CheckCircle2 size={12} className="text-black" /> : 
                                             isLocked ? <Lock size={10} className="text-zinc-700" /> :
                                             <Circle size={8} fill="currentColor" className="text-emerald-500" />}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 flex flex-col gap-1 py-3 px-4 rounded-2xl border transition-all ${
                                            isCurrent ? 'bg-zinc-900/50 border-zinc-800' : 
                                            isMastered ? 'border-zinc-900/50 text-zinc-400 bg-zinc-900/10' :
                                            'border-transparent text-zinc-600 grayscale'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold tracking-tight">{concept.titleEn}</span>
                                                {isMastered && (
                                                    <button 
                                                        onClick={() => onSendMessage?.(`I want to practice a certification question about ${concept.titleEn}.`, "certification")}
                                                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all border border-amber-500/20 group/zap"
                                                    >
                                                        <Zap size={12} fill="currentColor" className="group-hover/zap:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Domain Tags */}
                                            {concept.examDomains && concept.examDomains.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {concept.examDomains.map(domain => (
                                                        <span key={domain} className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                                                            domain.startsWith('SAA') 
                                                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
                                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                        }`}>
                                                            {domain}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
                <button 
                    disabled 
                    className="w-full py-4 bg-zinc-900 text-zinc-500 font-bold rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed opacity-50"
                >
                    Claim AWS Cert Voucher
                </button>
                <p className="text-[10px] text-center text-zinc-600 mt-4 uppercase font-bold tracking-widest leading-loose">
                    Keep learning to unlock certification vouchers<br/>from DeployKaro partners
                </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
