"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const SUGGESTED = [
  "Which branch is most at risk this month?",
  "Who are my top 3 reps by revenue?",
  "How many leads went cold? What's the value at risk?",
  "Where are leads dropping off in the funnel?",
  "What should I focus on today?",
  "Which lead source converts best?",
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={11} className="text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed",
          isUser
            ? "bg-zinc-900 text-white rounded-br-sm"
            : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
        )}
      >
        {msg.streaming && !msg.content ? (
          <TypingDots />
        ) : (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        )}
        {msg.streaming && msg.content && (
          <span className="inline-block w-0.5 h-3 bg-zinc-500 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      // welcome message
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm DealerPulse AI. I can answer any question about your dealership data — branches, reps, pipeline, targets, or lead patterns. What would you like to know?",
        },
      ]);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const userMsg = text.trim();
      setInput("");

      const nextMessages: Message[] = [
        ...messages,
        { role: "user", content: userMsg },
      ];
      setMessages(nextMessages);
      setLoading(true);

      // add streaming placeholder
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", streaming: true },
      ]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (err.error?.includes("OPENROUTER_API_KEY")) setNoKey(true);
          throw new Error(err.error ?? "Request failed");
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: accumulated,
                    streaming: true,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulated,
            streaming: false,
          };
          return updated;
        });
      } catch (e: any) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: noKey
              ? "⚠️ Please add your OPENROUTER_API_KEY to .env.local to enable AI chat."
              : "Something went wrong. Please try again.",
            streaming: false,
          };
          return updated;
        });
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, noKey]
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all text-xs font-medium"
        >
          <Sparkles size={13} />
          Ask AI
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[360px] flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-modal overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-900">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">DealerPulse AI</p>
                <p className="text-[10px] text-zinc-400">Answers from your real data</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
                  title="Clear chat"
                >
                  <RotateCcw size={12} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white"
          >
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-zinc-50 flex gap-1.5 overflow-x-auto pb-2">
              {SUGGESTED.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="flex-shrink-0 text-[11px] px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-zinc-100 flex items-end gap-2 bg-white">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about your data..."
              rows={1}
              className="flex-1 resize-none text-xs border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 max-h-24"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className={cn(
                "p-2.5 rounded-xl transition-all flex-shrink-0",
                input.trim() && !loading
                  ? "bg-zinc-900 text-white hover:bg-zinc-700"
                  : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
              )}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
