"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, User, SendHorizontal, Loader2, MessageCircle, AlertCircle, Terminal } from "lucide-react";
import { ChatMessage, MessageProps } from "@/components/mentor/ChatMessage";

interface DebugMentorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeStep: {
    title: string;
    description: string;
    actionable_command?: string;
  } | null;
  persona?: string;
}

export function DebugMentorOverlay({ isOpen, onClose, activeStep, persona = "anna-tamil" }: DebugMentorOverlayProps) {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeStep && messages.length === 0) {
      // Auto-greeting with context
      setMessages([
        {
          role: "assistant",
          content: `Vanjkam! I see you are stuck on **"${activeStep.title}"**. \n\nWhat error are you getting machan? Paste the red text from your terminal here and I'll explain it simply.`
        }
      ]);
    }
  }, [isOpen, activeStep]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (rawMessage: string) => {
    if (!rawMessage.trim() || isLoading) return;

    const userMsg: MessageProps = { role: "user", content: rawMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const currentMessages = [...messages, userMsg];
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("http://localhost:8000/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawMessage,
          persona: persona,
          context: {
            cloud_context: "Cloud Environment",
            mentor_mode: "learning",
            step_context: activeStep // Inject step title/command
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
            const content = line.slice(6).trim();
            if (content === "[DONE]") break;

            streamedResponse += content;
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
        updated[updated.length - 1].content = "⚠️ Mentor is thinking... try again?";
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Terminal className="text-purple-400" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">AI Debugger</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Step-Specific Help</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Step Alert */}
            {activeStep && (
              <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex gap-4 items-start">
                <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Context</p>
                  <p className="text-sm font-bold text-white capitalize">{activeStep.title}</p>
                  {activeStep.actionable_command && (
                    <code className="text-[10px] block mt-2 p-2 bg-black/50 rounded border border-zinc-800 font-mono text-zinc-400">
                      {activeStep.actionable_command}
                    </code>
                  )}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} {...msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-950">
              <div className="relative flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(input);
                    }
                  }}
                  placeholder="Paste your error log here..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none min-h-[50px] max-h-[150px] text-zinc-200"
                  rows={1}
                />
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-purple-600 text-white disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-purple-500 transition-all flex items-center justify-center"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-center text-zinc-600 mt-4 uppercase font-black tracking-widest">
                Mentor Anna understands your errors
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
