import { User, Bot, Volume2, VolumeX, Maximize2, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export interface MessageProps {
  role: "user" | "assistant";
  content: string;
  onActionClick?: (action: string) => void;
}

export function ChatMessage({ role, content, onActionClick }: MessageProps) {
  const isUser = role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Stop existing speech
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const cleanText = content.replace(/\[VISUAL:[\w_]+\]/g, "").replace(/\[PROGRESS:[\w_]+\]/g, "").replace(/\[Show me visually(?:\|[\w_]+)?\]/g, "").replace(/\[Practice this concept\]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // 1. Precise Language Detection
    let lang = 'en-IN'; 
    if (/[\u0b80-\u0bff]/.test(cleanText)) lang = 'ta-IN'; // Tamil
    else if (/[\u0c80-\u0cff]/.test(cleanText)) lang = 'kn-IN'; // Kannada
    else if (/[\u0c00-\u0c7f]/.test(cleanText)) lang = 'te-IN'; // Telugu
    else if (/[\u0900-\u097f]/.test(cleanText)) lang = 'hi-IN'; // Hindi

    // 2. High-Quality Regional Voice Hunting
    const voices = window.speechSynthesis.getVoices();
    
    // Mapping of language tags to high-quality regional voice name fragments
    const regionalVoiceMapping: Record<string, string[]> = {
        'ta-IN': ["Microsoft Valluvar", "Google தமிழ்", "Laila"],
        'kn-IN': ["Microsoft Hemant", "Google ಕನ್ನಡ"],
        'te-IN': ["Microsoft Venkat", "Google తెలుగు"],
        'hi-IN': ["Microsoft Kalpana", "Google हिन्दी", "Microsoft Hemant"],
        'en-IN': ["Microsoft Heera", "Microsoft Prabhat", "Google English (India)", "Ravi", "Sangeeta", "Vani"]
    };

    const priorityNames = regionalVoiceMapping[lang] || regionalVoiceMapping['en-IN'];
    let selectedVoice = voices.find(v => priorityNames.some(p => v.name.includes(p)));
    
    // Fallback 1: Try to find ANY voice matching the exact Indian regional language
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    }

    // Fallback 2: "Hard Accent Lock" - If it's an Indian persona (Anna/Bhai/Didi), 
    // force an Indian-English voice over any US/UK generic voice to keep it authentic.
    if (!selectedVoice || (!selectedVoice.lang.includes('IN') && !selectedVoice.lang.includes('ta'))) {
        selectedVoice = voices.find(v => v.lang.includes('en-IN')) || selectedVoice;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }

    // 3. Humanize the "Machine" Sound
    utterance.pitch = 1.15; 
    utterance.rate = 0.95;  

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);
  
  const renderContent = () => {
    // 1. Remove machine tags [VISUAL:id] and [PROGRESS:id]
    let displayContent = content.replace(/\[VISUAL:[\w_]+\]/g, "").replace(/\[PROGRESS:[\w_]+\]/g, "");
    
    // 2. Split by action tags to render buttons (support [Show me visually|vis_id])
    const parts = displayContent.split(/(\[Show me visually(?:\|[\w_]+)?\]|\[Practice this concept\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("[Show me visually")) {
        const visId = part.includes("|") ? part.split("|")[1].replace("]", "") : "Show me the visual for this concept";
        return (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onActionClick?.(visId)}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest my-2 hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <Maximize2 size={12} /> Show me visually
          </motion.button>
        );
      }
      if (part === "[Practice this concept]") {
        return (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onActionClick?.("I'm ready for a practice session on this!")}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/50 text-amber-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest my-2 hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            <Zap size={12} fill="currentColor" /> Practice this concept
          </motion.button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`flex max-w-[80%] md:max-w-[70%] rounded-2xl p-4 gap-4 group relative ${
          isUser
            ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50"
            : "bg-zinc-900 border border-zinc-800 text-zinc-300"
        }`}
      >
        {!isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <Bot size={18} className="text-emerald-400" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {renderContent()}
          </div>
          
          {!isUser && (
            <div className="mt-3 flex items-center gap-2">
                <button 
                  onClick={handleSpeak}
                  aria-label={isSpeaking ? "Mute" : "Read Aloud"}
                  className={`p-2 rounded-full border transition-all flex flex-shrink-0 items-center justify-center ${
                    isSpeaking 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                    : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
            </div>
          )}
        </div>

        {isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center border border-emerald-700">
              <User size={18} className="text-emerald-200" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
