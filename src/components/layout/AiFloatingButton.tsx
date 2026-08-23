import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AiFloatingButton() {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  return (
    <button
      onClick={() => requireAuth(() => navigate({ to: "/assistant" }), "Sign in to chat with the AI Shopping Assistant.")}
      className="group fixed bottom-6 right-6 z-50 flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-brand/90 hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Open AI Shopping Assistant"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
        <Sparkles className="h-3 w-3" />
      </span>
      <span className="hidden sm:inline">AI Shopping Assistant</span>
    </button>
  );
}