import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useOllamaChat } from "@/hooks/useOllamaChat";
import { RichAiMessageRenderer } from "@/components/ai/RichAiMessageRenderer";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "ZGenie AI Shopping Assistant" },
      {
        name: "description",
        content:
          "Chat with ZGenie AI for personalized product comparison, price drop forecasts, and buying advice.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  } = useOllamaChat();

  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    await sendMessage(userMsg);
  };

  const handleQuickQuestion = (q: string) => {
    sendMessage(q);
  };



  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Badge className="rounded-full bg-brand/10 text-brand border border-brand/20 text-xs font-bold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> ZGenie AI Shopping Concierge
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
              Chat with ZGenie AI
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Get instant, unbiased product comparisons, spec breakdowns, and live price drop forecasts.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-brand fill-brand" />
              <span>ZGenie Ultra-Fast AI</span>
            </div>

            {/* Clear button */}
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="h-8.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground text-xs font-medium gap-1.5"
              title="Clear chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        {/* Chat Window Card */}
        <div className="rounded-3xl border border-border/80 bg-card shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-2xl text-xs font-bold shadow-xs ${
                    msg.sender === "user"
                      ? "bg-brand text-white"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-brand" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-brand text-white rounded-tr-xs"
                      : "bg-muted/40 text-foreground border border-border/60 rounded-tl-xs"
                  }`}
                >
                  {msg.sender === "ai" ? (
                    msg.text ? (
                      <RichAiMessageRenderer content={msg.text} />
                    ) : (
                      <div className="flex items-center gap-1.5 py-1 text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
                        <span className="ml-1 text-[11px] font-medium">ZGenie AI is analyzing live store deals...</span>
                      </div>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5 overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
              Suggestions:
            </span>
            {[
              "Best iPhone under ₹65,000",
              "Compare iPhone 15 Pro vs Samsung S24 Ultra",
              "Cheapest store for OnePlus 12",
              "Best Noise Canceling Headphones under ₹25,000",
              "MacBook Air M2 vs Dell XPS 14",
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-border/80 bg-background px-3 py-1 text-[11px] font-medium text-foreground hover:border-brand/60 hover:text-brand transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-border/60 bg-card p-4">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about live prices, stores, specs, or product comparisons..."
                className="h-10 rounded-full px-4 bg-background text-xs flex-1 border-border/80"
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="h-10 rounded-full px-5 font-semibold text-xs gap-1.5 shadow-xs bg-brand text-white hover:bg-brand/90"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isLoading ? "Thinking..." : "Send"}
              </Button>
            </form>

            {/* Model indicator */}
            <p className="text-[10px] text-muted-foreground text-center mt-2.5 font-medium">
              ⚡ Powered by ZGenie AI · Real-time multi-store shopping intelligence
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
