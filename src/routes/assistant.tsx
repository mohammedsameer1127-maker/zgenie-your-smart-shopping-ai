import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User, Scale, ArrowRight, Mic, Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Shopping Assistant — Comparing Products" },
      { name: "description", content: "Chat with Comparing Products AI for personalized product comparison and advice." },
    ],
  }),
  component: AssistantPage,
});

interface Message {
  sender: "ai" | "user";
  text: string;
}

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your Comparing Products AI Assistant. Tell me what you're looking for (e.g., 'Compare Mac vs PC laptops under $1,200') and I'll find the best options for you!",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Based on your request "${userMsg}", I evaluated 14 products across 3 retailers. The top winner is Aether Pro 14 due to its 94% spec match and low 8% return risk score! Would you like to view the side-by-side spec comparison table?`,
        },
      ]);
    }, 600);
  };

  const handleVoiceSearch = () => {
    toast.info("Voice Assistant activated: Speak your product query...");
  };

  const handleImageSearch = () => {
    toast.info("Image Search activated: Please upload a photo of the product...");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Badge className="rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI Shopping Concierge
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mt-2">
            Chat with Comparing Products AI
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Get instant, unbiased recommendations, spec comparisons, and price drop forecasts.
          </p>
        </div>

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
                  className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-brand text-white rounded-br-none"
                      : "bg-muted/60 text-foreground border border-border/60 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === "user" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div className="pt-4 border-t border-border/60 mt-4">
            <div className="flex flex-wrap gap-2 text-xs mb-3">
              <span className="text-muted-foreground font-semibold">Try asking:</span>
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
              />
              <Button type="submit" className="h-10 rounded-xl px-4 font-bold text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </form>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
