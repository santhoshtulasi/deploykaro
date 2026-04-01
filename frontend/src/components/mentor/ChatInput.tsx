import { SendHorizontal, Loader2 } from "lucide-react";
import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the text area as the user types a super long error log
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
      // Reset height after sending
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
      <div className="max-w-4xl mx-auto flex gap-3 relative items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask ANNA to review your AWS Architecture..."
          className="w-full min-h-[56px] max-h-[150px] bg-zinc-900 rounded-xl px-4 py-4 pr-14 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-zinc-800 disabled:opacity-50 text-zinc-100 placeholder-zinc-500 shadow-inner"
          rows={1}
        />
        
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-3 bottom-2.5 p-2 rounded-lg bg-emerald-600 text-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors hover:bg-emerald-500 flex items-center justify-center h-10 w-10"
        >
          {isLoading ? (
             <Loader2 size={18} className="animate-spin" />
          ) : (
            <SendHorizontal size={18} className="ml-0.5" />
          )}
        </button>
      </div>
      <p className="text-center text-xs text-zinc-600 mt-3 font-mono">
        AI responses can easily hallucinate. Always test your scripts locally.
      </p>
    </div>
  );
}
