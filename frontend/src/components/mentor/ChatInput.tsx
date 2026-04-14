import { SendHorizontal, Loader2, Briefcase, Mic, MicOff } from "lucide-react";
import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (message: string, mode: string) => void;
  isLoading: boolean;
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export function ChatInput({ onSendMessage, isLoading, activeMode, onModeChange }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modes = [
    { id: "learning", label: "🎓 Learn", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "certification", label: "🏆 Cert Prep", color: "text-amber-500", bg: "bg-amber-500/10" }
  ];

  // Auto-resize logic...
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const toggleMic = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // Tune to regional accents ideally but en-IN is solid globally

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + transcript);
    };

    recognition.start();
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), activeMode);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "56px";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-zinc-950/80 backdrop-blur-md p-4 border-t border-zinc-900 border-zinc-800 drop-shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-50 fixed bottom-0 left-0">
      <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between">
        <div className="flex gap-2">
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => onModeChange(m.id)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${
                        activeMode === m.id 
                        ? `${m.bg} ${m.color} border-${m.id === 'learning' ? 'emerald' : m.id === 'certification' ? 'amber' : 'sky'}-500/50 shadow-lg` 
                        : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                    }`}
                >
                    {m.label}
                </button>
            ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex gap-3 relative items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={
            activeMode === "certification" 
            ? "Ask about AWS SAA or CKA exam topics..." 
            : "Ask ANNA to explain any concept simply..."
          }
          className="w-full min-h-[56px] max-h-[150px] bg-zinc-900 rounded-xl px-4 py-4 pr-[100px] text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-zinc-800 disabled:opacity-50 text-zinc-100 placeholder-zinc-500 shadow-inner"
          rows={1}
        />
        
        <div className="absolute right-2 bottom-2 max-h-[44px] flex items-center gap-1">
            <button
              onClick={toggleMic}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center h-10 w-10 ${
                  isListening 
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse border border-red-500/50" 
                  : "bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-emerald-600 text-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors hover:bg-emerald-500 flex items-center justify-center h-10 w-10"
            >
              {isLoading ? (
                 <Loader2 size={18} className="animate-spin" />
              ) : (
                <SendHorizontal size={18} className="ml-0.5" />
              )}
            </button>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-600 mt-3 font-mono">
        AI responses can easily hallucinate. Always test your scripts locally.
      </p>
    </div>
  );
}
