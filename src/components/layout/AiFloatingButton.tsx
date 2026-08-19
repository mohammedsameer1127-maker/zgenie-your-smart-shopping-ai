import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AiFloatingButton() {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  return (
    <button
      onClick={() => requireAuth(() => navigate({ to: "/assistant" }), "Sign in to chat with the AI Shopping Assistant.")}
      className="group fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pl-3.5 pr-4 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Open AI assistant"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <span className="hidden sm:inline">AI Assistant</span>
    </button>
  );
}