"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Send, Briefcase, Target, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

interface ResumeReviewOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalyze: (resumeText: string) => void;
}

interface ParsedAnalysis {
    atsScore: string;
    keywordGaps: string[];
    strengths: string[];
    certCoverage: string;
    rewrites: string;
}

function parseAnalysis(text: string): ParsedAnalysis {
    const section = (header: string) => {
        const re = new RegExp(`## ${header}\\s*([\\s\\S]*?)(?=## |$)`, "i");
        return text.match(re)?.[1]?.trim() || "";
    };
    const bullets = (raw: string) =>
        raw.split("\n").map(l => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean);

    const atsRaw = section("ATS Score");
    const atsScore = atsRaw.match(/\d+%/)?.[0] || atsRaw.slice(0, 60) || "—";

    return {
        atsScore,
        keywordGaps: bullets(section("Keyword Gaps")),
        strengths: bullets(section("Strengths Found")),
        certCoverage: section("Certification Coverage"),
        rewrites: section("Top 3 Rewrite Suggestions"),
    };
}

export function ResumeReviewOverlay({ isOpen, onClose, onAnalyze }: ResumeReviewOverlayProps) {
    const [text, setText] = useState("");
    const [targetRole, setTargetRole] = useState("Senior DevOps Engineer");
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [rawResponse, setRawResponse] = useState("");
    const [analysis, setAnalysis] = useState<ParsedAnalysis | null>(null);

    const handleStartAudit = async () => {
        if (!text.trim()) return;
        setStatus("loading");
        setRawResponse("");
        setAnalysis(null);

        try {
            const res = await fetch("http://localhost:8000/mentor/review-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText: text, targetRole }),
            });

            if (!res.body) throw new Error("No stream");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                for (const line of chunk.split("\n\n")) {
                    if (line.startsWith("data: ")) {
                        const content = line.slice(6);
                        if (content.trim() === "[DONE]") break;
                        fullText += content;
                        setRawResponse(fullText);
                    }
                }
            }

            setAnalysis(parseAnalysis(fullText));
            setStatus("done");

            // Also fire the chat message so the mentor chat history has context
            onAnalyze(text);
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    const handleClose = () => {
        setStatus("idle");
        setRawResponse("");
        setAnalysis(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-black italic uppercase tracking-tighter text-xl">Resume Expert Audit</h3>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Powered by AI Mentor</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {status === "idle" && (
                            <div className="p-8 space-y-6">
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Paste your resume text below. The AI will analyze keyword gaps, ATS score, cert coverage, and rewrite weak bullets.
                                </p>

                                {/* Target Role Input */}
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Target Role</label>
                                    <input
                                        value={targetRole}
                                        onChange={e => setTargetRole(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                        placeholder="e.g. Senior DevOps Engineer"
                                    />
                                </div>

                                <div className="relative group">
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Paste resume text here (Skills, Experience, Projects)..."
                                        className="w-full h-64 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none custom-scrollbar"
                                    />
                                    <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 font-mono">
                                        {text.length} chars
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === "loading" && (
                            <div className="p-8 flex flex-col items-center justify-center gap-6 min-h-[300px]">
                                <Loader2 size={36} className="text-emerald-500 animate-spin" />
                                <div className="text-center">
                                    <p className="text-white font-bold">Analyzing your resume...</p>
                                    <p className="text-zinc-500 text-xs mt-1">Checking ATS score, keyword gaps & cert coverage</p>
                                </div>
                                {rawResponse && (
                                    <pre className="w-full mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-[10px] text-zinc-500 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                                        {rawResponse}
                                    </pre>
                                )}
                            </div>
                        )}

                        {status === "done" && analysis && (
                            <div className="p-8 space-y-6">
                                {/* ATS Score card */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-1">
                                        <CheckCircle2 size={18} className="text-emerald-400" />
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">ATS Score</span>
                                        <span className="text-xl font-black text-emerald-400 font-mono">{analysis.atsScore}</span>
                                    </div>
                                    <div className="col-span-1 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col items-center gap-1">
                                        <Target size={18} className="text-amber-400" />
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Target</span>
                                        <span className="text-xs font-black text-amber-300 text-center leading-tight">{targetRole.split(" ").slice(-2).join(" ")}</span>
                                    </div>
                                    <div className="col-span-1 p-4 bg-sky-500/5 border border-sky-500/20 rounded-2xl flex flex-col items-center gap-1">
                                        <ShieldCheck size={18} className="text-sky-400" />
                                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Role Fit</span>
                                        <span className="text-xs font-black text-sky-300">Mid-Senior</span>
                                    </div>
                                </div>

                                {/* Keyword Gaps */}
                                {analysis.keywordGaps.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Missing Keywords</p>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.keywordGaps.map(k => (
                                                <span key={k} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full">{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Strengths */}
                                {analysis.strengths.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Strengths Found</p>
                                        <div className="space-y-1.5">
                                            {analysis.strengths.map(s => (
                                                <div key={s} className="flex items-start gap-2 text-xs text-zinc-300">
                                                    <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cert Coverage */}
                                {analysis.certCoverage && (
                                    <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Certification Coverage</p>
                                        <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">{analysis.certCoverage}</p>
                                    </div>
                                )}

                                {/* Rewrites */}
                                {analysis.rewrites && (
                                    <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Suggested Rewrites</p>
                                        <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">{analysis.rewrites}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {status === "error" && (
                            <div className="p-8 flex flex-col items-center gap-4 min-h-[200px] justify-center">
                                <AlertCircle size={32} className="text-rose-500" />
                                <p className="text-zinc-400 text-sm">Mentor AI is offline. Please make sure the mentor service is running.</p>
                                <button onClick={() => setStatus("idle")} className="text-xs text-emerald-400 hover:text-emerald-300 underline">Try again</button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-zinc-900/20 border-t border-zinc-900 flex justify-end gap-3 shrink-0">
                        <button onClick={handleClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                            {status === "done" ? "Close" : "Cancel"}
                        </button>
                        {status === "idle" && (
                            <button
                                onClick={handleStartAudit}
                                disabled={!text.trim()}
                                className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 flex items-center gap-2 group"
                            >
                                <Send size={14} className="group-hover:translate-x-1 transition-transform" /> Start Expert Audit
                            </button>
                        )}
                        {status === "done" && (
                            <button
                                onClick={() => { setStatus("idle"); setText(""); }}
                                className="px-8 py-2.5 rounded-xl bg-zinc-800 text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-2"
                            >
                                Analyze Another
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
