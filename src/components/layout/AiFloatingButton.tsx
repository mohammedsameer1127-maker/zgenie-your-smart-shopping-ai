import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AiFloatingButton() {
  return (
    <Link
      to="/assistant"
      className="group fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] pl-4 pr-5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
      aria-label="Open AI assistant"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-1 ring-inset ring-white/30">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="hidden sm:inline">Ask ZGenie</span>
    </Link>
  );
}