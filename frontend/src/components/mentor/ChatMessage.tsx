import { User, Bot } from "lucide-react";

export interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: MessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`flex max-w-[80%] md:max-w-[70%] rounded-2xl p-4 gap-4 ${
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
          {/* We use whitespace-pre-wrap so that newlines from Python actually show up as line breaks */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
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
