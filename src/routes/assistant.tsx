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
  Mic,
  Camera,
  Wifi,
  WifiOff,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useOllamaChat } from "@/hooks/useOllamaChat";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Shopping Assistant — ZGenie" },
      {
        name: "description",
        content:
          "Chat with ZGenie AI for personalized product comparison and advice.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const {
    messages,
    isLoading,
    isOllamaOnline,
    error,
    sendMessage,
    checkConnection,
    clearChat,
  } = useOllamaChat();

  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

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

  const handleVoiceSearch = () => {
    toast.info("Voice Assistant activated: Speak your product query...");
  };

  const handleImageSearch = () => {
    toast.info(
      "Image Search activated: Please upload a photo of the product..."
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI Shopping
              Concierge
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
              Chat with ZGenie AI
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Get instant, unbiased recommendations, spec comparisons, and price
              drop forecasts.
            </p>
          </div>

          {/* Connection Status + Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Clear chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                isOllamaOnline === true
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  : isOllamaOnline === false
                    ? "border-red-500/30 bg-red-500/10 text-red-600"
                    : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {isOllamaOnline === true ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Ollama Online</span>
                </>
              ) : isOllamaOnline === false ? (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Ollama Offline</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Checking…</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={checkConnection}
              className="ml-3 rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-bold hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Chat Box */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs min-h-[420px] flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-xs">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <div
                  className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-brand text-white rounded-br-none"
                      : "bg-muted/60 text-foreground border border-border/60 rounded-bl-none"
                  }`}
                >
                  {m.text}
                  {/* Streaming cursor */}
                  {isLoading &&
                    idx === messages.length - 1 &&
                    m.sender === "ai" && (
                      <span className="inline-block w-1.5 h-3.5 bg-blue-500 rounded-sm ml-0.5 animate-pulse" />
                    )}
                </div>
                {m.sender === "user" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="pt-4 border-t border-border/60 mt-4">
            <div className="flex flex-wrap gap-2 text-xs mb-3">
              <span className="text-muted-foreground font-semibold">
                Try asking:
              </span>
              {[
                "Best wireless noise-canceling headphones under $300",
                "Compare MacBook Pro M3 vs Dell XPS 14",
                "Predict price drop for OLED TVs next month",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                  }}
                  className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground hover:border-brand hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Voice Search"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleImageSearch}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Upload Product Image"
              >
                <Camera className="h-4 w-4" />
              </button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about products, prices, or comparisons..."
                className="h-10 rounded-xl bg-background text-xs flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="h-10 rounded-xl px-4 font-bold text-xs gap-1.5"
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
            <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
              Powered by Qwen3:8b via local Ollama · Responses are
              shopping-focused only
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
