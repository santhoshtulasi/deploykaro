"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Lock, Play, GraduationCap } from "lucide-react";
import { getTracks, getTrackProgress, completeTrackConcept } from "@/lib/api";

type Concept = { id: string; titleEn: string; content: any };
type Module = { id: string; titleEn: string; concepts: Concept[] };
type Track = { id: string; slug: string; titleEn: string; modules: Module[] };

export default function TrackPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [track, setTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [pct, setPct] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { tracks } = await getTracks();
        const found = tracks.find((t: any) => t.slug === params.slug);
        if (found) {
          setTrack(found);
          const prog = await getTrackProgress(found.id);
          setProgress(prog.completedConcepts || []);
          setPct(prog.completedPct || 0);
        }
      } catch (e) {
        console.error("Failed to load track", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  const handleComplete = async (conceptId: string) => {
    if (!track || progress.includes(conceptId)) return;
    try {
      const res = await completeTrackConcept(track.id, conceptId);
      if (res.progress) {
        setProgress(res.progress.completedConcepts);
        setPct(res.progress.completedPct);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;
  if (!track) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Track not found</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 selection:bg-emerald-500/30">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center">
          <button onClick={() => router.push("/")} className="text-zinc-500 flex items-center gap-2 hover:text-white transition-colors text-sm font-bold">
            <ArrowLeft size={16} /> Back to Hub
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-28 px-6 max-w-2xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-4 text-emerald-500">
          <GraduationCap size={24} />
          <span className="font-black uppercase tracking-widest text-xs">Curated Track</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4">{track.titleEn}</h1>
        
        {/* Progress Bar */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-zinc-400">Track Progress</span>
            <span className="text-xs font-black text-emerald-400">{Math.round(pct)}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Modules list */}
      <div className="px-6 max-w-2xl mx-auto space-y-8">
        {track.modules.map((mod, idx) => (
          <div key={mod.id}>
            <h2 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
              <span className="text-zinc-600">Module {idx + 1}</span>
              <span>{mod.titleEn}</span>
            </h2>
            <div className="space-y-3">
              {mod.concepts.map((concept) => {
                const isComplete = progress.includes(concept.id);
                return (
                  <motion.div
                    key={concept.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isComplete 
                        ? "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50" 
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                    onClick={() => handleComplete(concept.id)}
                  >
                    <div className="flex items-center gap-4">
                      {isComplete ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} className="text-zinc-600" />
                      )}
                      <div>
                        <p className={`font-bold text-sm ${isComplete ? "text-emerald-300" : "text-white"}`}>{concept.titleEn}</p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                          {typeof concept.content === 'object' ? JSON.stringify(concept.content) : concept.content}
                        </p>
                      </div>
                    </div>
                    {!isComplete && (
                      <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg">
                        Mark Done
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        {pct === 100 && (
          <div className="mt-8 p-6 text-center border border-emerald-500/50 bg-emerald-500/10 rounded-2xl">
            <h3 className="text-2xl font-black text-emerald-400 mb-2">🎉 Track Completed!</h3>
            <p className="text-sm text-emerald-200/80">You've mastered {track.titleEn}. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
}
