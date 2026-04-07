"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, MessageProps } from "@/components/mentor/ChatMessage";
import { ChatInput } from "@/components/mentor/ChatInput";
import { VisualEngine } from "@/components/mentor/VisualEngine";
import { ProgressIndicator } from "@/components/mentor/ProgressIndicator";
import { TrackRoadmap } from "@/components/mentor/TrackRoadmap";
import { CareerDashboard } from "@/components/mentor/CareerDashboard";
import { ResumeReviewOverlay } from "@/components/mentor/ResumeReviewOverlay";
import { Sparkles, MessageSquare, Map, Gauge, ChevronDown, Check, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const PERSONAS = [
    { id: "anna-tamil", name: "Anna (Tamil)", description: "DevOps Sister | Slang & Analogies" },
    { id: "guru-kannada", name: "Guru (Kannada)", description: "Bangalore Tech | Street Slang" },
    { id: "didi-telugu", name: "Didi (Telugu)", description: "Friendly Didi | Street/Mix" },
    { id: "bhai-hindi", name: "Bhai (Hindi)", description: "Street Smart | Simplified DevOps" },
    { id: "buddy-english", name: "Buddy (English)", description: "Friendly Peer | Professional Tone" }
];

export default function MentorChatPage() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeVisualId, setActiveVisualId] = useState<string | null>(null);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [mentorMode, setMentorMode] = useState("learning"); // learning, certification, interview
  const [isResumeOverlayOpen, setIsResumeOverlayOpen] = useState(false);
  const [userPersona, setUserPersona] = useState("anna-tamil");
  const [isMentorPopupOpen, setIsMentorPopupOpen] = useState(false);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  
  // Progress State
  const [progress, setProgress] = useState({
      completedPct: 0,
      completedConcepts: [] as string[],
      totalConcepts: 4, 
      lastUpdatedId: null as string | null,
      xp: 0
  });

  // Roadmap & Dashboard State
  const [isTrackRoadmapOpen, setIsTrackRoadmapOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [trackData, setTrackData] = useState<any>(null);
  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [activeTrackSlug, setActiveTrackSlug] = useState("my-first-deploy");

  // Career Stats State
  const [careerStats, setCareerStats] = useState<{
    xp: number;
    totalConceptsCompleted: number;
    achievementCount: number;
    trackProgress: { slug: string; titleEn: string; completedPct: number }[];
    achievements: { slug: string; titleEn: string; badgeUrl: string; earnedAt: string }[];
  }>({
    xp: 0,
    totalConceptsCompleted: 0,
    achievementCount: 0,
    trackProgress: [],
    achievements: [],
  });

  // Achievement toast state
  const [achievementToast, setAchievementToast] = useState<{ titleEn: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch career stats (profile + tracks + achievements in one shot)
  const fetchCareerStats = async () => {
    if (!token) return;
    try {
      const [profileRes, statsRes, trackRes] = await Promise.all([
        fetch("http://localhost:3001/v1/user/profile", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:3001/v1/user/career-stats", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("http://localhost:3001/v1/tracks", { headers: { "Authorization": `Bearer ${token}` } }),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setExpertMode(data.expertMode);
        const p = (data.persona || 'anna').toLowerCase();
        const l = (data.language || 'english').toLowerCase();
        setUserPersona(`${p}-${l}`);
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setCareerStats({
          xp: stats.xp || 0,
          totalConceptsCompleted: stats.totalConceptsCompleted || 0,
          achievementCount: stats.achievementCount || 0,
          trackProgress: stats.trackProgress || [],
          achievements: [], // populated from profile
        });
        setProgress(prev => ({ ...prev, xp: stats.xp || 0 }));
      }

      if (profileRes.ok) {
        const profileData = await profileRes.clone().json().catch(() => ({}));
        if (profileData.achievements) {
          setCareerStats(prev => ({ ...prev, achievements: profileData.achievements }));
        }
      }

      if (trackRes.ok) {
        const tData = await trackRes.json();
        setAllTracks(tData.tracks || []);
        const active = tData.tracks?.find((t: any) => t.slug === activeTrackSlug) || tData.tracks?.[0];
        setTrackData(active);
        if (active) {
          const total = active.modules?.reduce((acc: number, mod: any) => acc + (mod.concepts?.length || 0), 0) || 4;
          setProgress(prev => ({ ...prev, totalConcepts: total }));
        }
      }
    } catch (err) { console.error(err); }
  };

  // Fetch on mount and when track changes
  useEffect(() => {
    fetchCareerStats();
  }, [activeTrackSlug, token]);

  useEffect(() => {
    if (!token) return;
    const fetchProgress = async () => {
      try {
        const progressRes = await fetch(`http://localhost:3001/v1/tracks/${activeTrackSlug}/progress`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (progressRes.ok) {
            const pData = await progressRes.json();
            setProgress(prev => ({ 
                ...prev, 
                completedPct: Math.min(pData.completedPct || 0, 100),
                completedConcepts: pData.completedConcepts || [],
                xp: pData.xp || 0
            }));
        }
      } catch (err) { console.error(err); }
    };
    if (activeTrackSlug) fetchProgress();
  }, [activeTrackSlug, token]);

  const changeMentor = async (newPersona: string) => {
    setUserPersona(newPersona);
    setIsMentorPopupOpen(false);
    const [p, l] = newPersona.split("-");
    try {
        await fetch("http://localhost:3001/v1/user/settings", {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ persona: p, language: l })
        });
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (rawMessage: string) => {
    if (!rawMessage.trim()) return;

    // Direct Action Interceptor
    if (rawMessage.startsWith("vis_")) {
        console.log("Direct Visual Trigger Detected:", rawMessage);
        setActiveVisualId(rawMessage);
        setIsSplitMode(true);
        return;
    }

    const userMsg: MessageProps = { role: "user", content: rawMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const currentMessages = [...messages, userMsg];
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("http://localhost:8000/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawMessage,
          persona: userPersona, 
          context: { 
              cloud_context: "AWS",
              architect_mode: expertMode,
              mentor_mode: mentorMode,
              completed_concepts: progress.completedConcepts,
              active_track_slug: activeTrackSlug
          },
          history: currentMessages.slice(0, -1)
        }),
      });

      if (!response.body) throw new Error("No readable stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.slice(6);
            if (content.trim() === "[DONE]") break;

            streamedResponse += content;
            
            // Visual Parsing
            const visualMatch = streamedResponse.match(/\[(?:VISUAL|PROGRESS):\s*(vis_[\w_]+)\]/);
            if (visualMatch) {
              const visualId = visualMatch[1];
              setActiveVisualId(visualId);
              setIsSplitMode(true);
              streamedResponse = streamedResponse.replace(/\[(?:VISUAL|PROGRESS):\s*vis_[\w_]+\]/, "");
            }
            
            // Progress Parsing
            if (streamedResponse.includes(`[PROGRESS:`)) {
              const match = streamedResponse.match(/\[PROGRESS:\s*([^\]]+)\]/);
              const conceptId = (match && !match[1].includes("vis_")) ? match[1].trim() : null;
              
              if (conceptId && !progress.completedConcepts.includes(conceptId)) {
                fetch(`http://localhost:3001/v1/tracks/${activeTrackSlug}/complete-concept`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ conceptId })
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    setProgress(prev => ({
                        ...prev,
                        completedPct: data.progress.completedPct,
                        completedConcepts: data.progress.completedConcepts,
                        xp: data.totalXp || prev.xp
                    }));
                    // Show achievement toast if a badge was just unlocked
                    if (data.achievementUnlocked) {
                      setAchievementToast({ titleEn: data.achievementUnlocked.titleEn });
                      setTimeout(() => setAchievementToast(null), 5000);
                      fetchCareerStats(); // Refresh career stats to show new badge
                    }
                  }
                });
              }
              streamedResponse = streamedResponse.replace(/\[PROGRESS:\s*[^\]]+\]/g, "");
            }

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].content = streamedResponse;
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = "⚠️ AI Mentor sleeping.";
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-zinc-950 text-white flex-col w-full relative overflow-hidden">
      {/* Header Banner */}
      <div className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center px-8 fixed top-0 w-full z-50">
        <div className="flex items-center gap-2 relative">
          <Sparkles className="text-emerald-500" size={20} />
          <div 
            onClick={() => setIsMentorPopupOpen(!isMentorPopupOpen)} 
            className="flex items-center gap-2 cursor-pointer hover:bg-zinc-900 p-2 rounded-lg transition-colors group"
          >
            <h1 className="text-lg font-bold">DeployKaro <span className="text-zinc-500 font-normal">Mentor AI</span></h1>
            <ChevronDown size={16} className={`text-zinc-500 transition-transform ${isMentorPopupOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isMentorPopupOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-14 left-8 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[100]"
              >
                {PERSONAS.map((p) => (
                  <button 
                    key={p.id} onClick={() => changeMentor(p.id)}
                    className="w-full px-4 py-3 text-left hover:bg-zinc-800 flex items-center justify-between group transition-colors border-b border-zinc-800/50 last:border-0"
                  >
                    <div>
                      <p className={`text-xs font-bold ${userPersona === p.id ? 'text-emerald-400' : 'text-zinc-200'}`}>{p.name}</p>
                      <p className="text-[10px] text-zinc-500">{p.description}</p>
                    </div>
                    {userPersona === p.id && <Check size={14} className="text-emerald-400" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
            {isSplitMode && (
                <button onClick={() => setIsSplitMode(false)} className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2">
                    <MessageSquare size={14} /> Full Chat
                </button>
            )}
            <button data-testid="open-roadmap" onClick={() => setIsTrackRoadmapOpen(true)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"><Map size={20} /></button>
            <button data-testid="open-dashboard" onClick={() => setIsDashboardOpen(true)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"><Gauge size={20} /></button>
        </div>
      </div>

      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        <motion.div className={`flex flex-col relative transition-all duration-500 ease-in-out ${isSplitMode ? "w-1/2 border-r border-zinc-900" : "w-full"}`}>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-8 pb-32 custom-scrollbar">
            <div className="max-w-3xl mx-auto w-full">
                {messages.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center opacity-60 text-center">
                    <h2 className="text-2xl font-bold mb-2">Enga Guru, DevOps kathukkalama?</h2>
                    <p className="text-zinc-400 max-w-sm italic">"Ask me about Docker analogies or Cloud servers."</p>
                </div>
                ) : (
                messages.map((msg, idx) => (
                    <ChatMessage key={idx} {...msg} onActionClick={(action) => handleSendMessage(action)} />
                ))
                )}
                <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
            <div className="max-w-3xl mx-auto">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} activeMode={mentorMode} onModeChange={(mode) => setMentorMode(mode)} />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
            {isSplitMode && (
                <motion.div 
                    initial={{ x: "100%" }} 
                    animate={{ x: 0 }} 
                    exit={{ x: "100%" }} 
                    transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.5 }} 
                    className="w-1/2 h-full bg-zinc-900/30 backdrop-blur-sm flex flex-col border-l border-zinc-800 shadow-2xl"
                >
                    <VisualEngine visualId={activeVisualId} onClose={() => setIsSplitMode(false)} expertMode={expertMode} />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <ProgressIndicator completedPct={progress.completedPct} totalConcepts={progress.totalConcepts} completedCount={progress.completedConcepts.length} lastUpdateConceptId={progress.lastUpdatedId} xp={progress.xp} />
      <CareerDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        xp={careerStats.xp}
        readinessPct={progress.completedPct}
        achievements={careerStats.achievements}
        trackProgress={careerStats.trackProgress}
        totalConceptsCompleted={careerStats.totalConceptsCompleted}
      />
      <TrackRoadmap isOpen={isTrackRoadmapOpen} onClose={() => setIsTrackRoadmapOpen(false)} track={trackData} completedConcepts={progress.completedConcepts} allTracks={allTracks} onTrackChange={(id) => {
            const t = allTracks.find(t => t.id === id);
            if (t) setActiveTrackSlug(t.slug);
        }} onSendMessage={(msg, mode) => { if (mode) setMentorMode(mode); handleSendMessage(msg); setIsTrackRoadmapOpen(false); }} />
      <ResumeReviewOverlay isOpen={isResumeOverlayOpen} onClose={() => setIsResumeOverlayOpen(false)} onAnalyze={(resumeText) => handleSendMessage(`Review my resume: \n\n${resumeText}`)} />

      {/* Achievement Unlock Toast */}
      <AnimatePresence>
        {achievementToast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.8 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-amber-500 text-black font-black px-6 py-4 rounded-2xl shadow-2xl shadow-amber-900/40"
          >
            <Trophy size={20} />
            <div>
              <p className="text-xs uppercase tracking-widest">Achievement Unlocked!</p>
              <p className="text-sm">{achievementToast.titleEn}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
