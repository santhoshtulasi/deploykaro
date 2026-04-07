"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Target, Award, BarChart2 } from "lucide-react";

interface TrackProgressItem {
    slug: string;
    titleEn: string;
    completedPct: number;
}

interface CertificationReadinessProps {
    readinessPct: number;
    targetCert?: string;
    trackProgress?: TrackProgressItem[];
}

const TRACK_CERT_MAP: Record<string, string> = {
    "my-first-deploy": "AWS CLF-C02",
    "orchestrating-the-fleet": "CKA",
    "container-wizard": "Docker DCA",
    "pipeline-builder": "GitHub Actions",
    "k8s-tamer": "CKA / CKAD",
    "mlops-engineer": "AWS MLS-C01",
    "multi-cloud-architect": "Terraform Associate",
};

export function CertificationReadiness({
    readinessPct,
    targetCert = "AWS SOLUTIONS ARCHITECT (SAA-C03)",
    trackProgress = [],
}: CertificationReadinessProps) {
    const size = 180;
    const strokeWidth = 14;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (readinessPct / 100) * circumference;

    return (
        <div className="w-full bg-zinc-950/40 backdrop-blur-xl border border-zinc-900 rounded-3xl p-8 flex flex-col items-center">

            <div className="flex items-center gap-2 mb-6">
                <Target size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-0.5">EXAM READINESS</span>
            </div>

            <div className="relative w-full aspect-square max-w-[200px] flex items-center justify-center">
                {/* Circular Gauge */}
                <svg width={size} height={size} className="rotate-[-90deg]">
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="transparent" stroke="rgba(39, 39, 42, 0.5)" strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={center} cy={center} r={radius}
                        fill="transparent" stroke="url(#gradient-gold)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 }}
                        className="text-4xl font-mono text-amber-500 font-black italic tracking-tighter"
                    >
                        {Math.round(readinessPct)}%
                    </motion.span>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Ready</span>
                </div>

                <div className="absolute inset-0 rounded-full shadow-[0_0_80px_rgba(245,158,11,0.05)] pointer-events-none" />
            </div>

            {/* Target Cert */}
            <div className="mt-8 w-full">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Award size={24} className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Target Certification</p>
                        <h4 className="text-xs font-black text-amber-200 mt-1">{targetCert}</h4>
                    </div>
                    <ShieldCheck size={20} className="text-emerald-500/40" />
                </div>
            </div>

            {/* Per-track progress — real data from API, or placeholder if empty */}
            <div className="mt-6 flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2 mb-1">
                    <BarChart2 size={12} className="text-zinc-600" />
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Track Progress</span>
                </div>

                {trackProgress.length > 0 ? (
                    trackProgress.map((track) => (
                        <div key={track.slug} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase px-1">
                                <span>{track.titleEn}</span>
                                <span className="text-zinc-400 font-mono">{track.completedPct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${track.completedPct}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                />
                            </div>
                            {TRACK_CERT_MAP[track.slug] && (
                                <p className="text-[8px] text-zinc-700 px-1">→ {TRACK_CERT_MAP[track.slug]}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-[10px] text-zinc-600 italic px-1">No tracks started yet. Begin learning to see your progress here.</p>
                )}
            </div>

            <p className="text-[9px] text-center text-zinc-600 mt-8 italic leading-relaxed">
                Exam readiness is calculated based on concept mastery<br />and track completion across all learning paths.
            </p>
        </div>
    );
}
