"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, MessageProps } from "@/components/mentor/ChatMessage";
import { ChatInput } from "@/components/mentor/ChatInput";
import { Sparkles } from "lucide-react";

export default function MentorChatPage() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // This helps us automatically scroll down when a new message arrives
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (rawMessage: string) => {
    // 1. Add user's message to the screen instantly
    const newHistory = [...messages, { role: "user" as const, content: rawMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    // Add a blank placeholder for the AI response
    setMessages([...newHistory, { role: "assistant", content: "" }]);

    try {
      // 2. We use the native fetch API but process it chunk by chunk!
      const response = await fetch("http://localhost:8000/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Construct the EXACT format our Python API Pydantic model expects
        body: JSON.stringify({
          message: rawMessage,
          persona: "anna", 
          context: { cloud_context: "AWS" },
          history: newHistory.slice(0, -1) // Don't send the blank assistant message
        }),
      });

      if (!response.body) throw new Error("No readable stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";

      // 3. Keep looping until the Python API says "I'm done speaking"
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the binary chunks into normal strings
        const chunk = decoder.decode(value);
        
        // This splits by the SSE "data: " format we sent from Python
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.slice(6); // Remove "data: " string from start
            
            if (content.trim() === "[DONE]") {
              // The NVIDIA string completely finished!
              break; 
            }

            streamedResponse += content;
            
            // Re-render React so the user sees the words appearing line-by-line
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
        updated[updated.length - 1].content = "⚠️ Sorry, the AI Mentor API seems to be sleeping on Port 8000.";
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-zinc-950 text-white flex-col w-full relative">
      {/* Header Banner */}
      <div className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center px-8 fixed top-0 w-full z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="text-emerald-500" size={20} /> DeployKaro <span className="text-zinc-500 font-normal">Mentor AI</span>
        </h1>
        <div className="ml-auto text-xs bg-zinc-900 text-zinc-400 px-3 py-1 rounded-full border border-zinc-800 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           Connected to Port 8000
        </div>
      </div>

      {/* Main Chat Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 pt-24 pb-32"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-60">
            <h2 className="text-2xl font-bold mb-2">How can I help you learn today?</h2>
            <p className="text-zinc-400 text-center max-w-md">
              Try asking about Docker concepts, reviewing an AWS architecture diagram, or preparing for an interview.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Container */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </main>
  );
}
