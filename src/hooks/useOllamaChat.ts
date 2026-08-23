import { useState, useCallback, useRef } from "react";
import {
  sendOllamaChat,
  checkOllamaHealth,
  type ChatMessage,
} from "@/lib/ollama";

export interface DisplayMessage {
  sender: "ai" | "user";
  text: string;
}

interface UseOllamaChatReturn {
  messages: DisplayMessage[];
  isLoading: boolean;
  isOllamaOnline: boolean | null;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  checkConnection: () => Promise<void>;
  clearChat: () => void;
}

const WELCOME_MESSAGE: DisplayMessage = {
  sender: "ai",
  text: "Hello! I am your ZGenie AI Assistant, powered by local AI. Tell me what you're looking for (e.g., 'Compare Mac vs PC laptops under ₹80,000') and I'll find the best options for you!",
};

export function useOllamaChat(): UseOllamaChatReturn {
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaOnline, setIsOllamaOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortFlagRef = useRef(false);

  const checkConnection = useCallback(async () => {
    const online = await checkOllamaHealth();
    setIsOllamaOnline(online);
    if (!online) {
      setError("Ollama is not running. Please start it with: ollama serve");
    } else {
      setError(null);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);
      abortFlagRef.current = false;

      // Add user message
      const userMessage: DisplayMessage = { sender: "user", text: text.trim() };
      setMessages((prev) => [...prev, userMessage]);

      // Add placeholder AI message with loading indicator
      setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

      setIsLoading(true);

      // Build the conversation history for Ollama (excluding the welcome message)
      const conversationHistory: ChatMessage[] = [];
      const allMessages = [...messages, userMessage]; // current messages + the new user msg

      for (const msg of allMessages) {
        // Skip the welcome message from context (it's UI-only)
        if (msg === WELCOME_MESSAGE) continue;
        conversationHistory.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        });
      }

      try {
        // Send request through server function (non-streaming)
        const responseText = await sendOllamaChat(conversationHistory);

        if (abortFlagRef.current) return; // User cleared chat during request

        // Update the placeholder AI message with the full response
        if (responseText.trim()) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.sender === "ai") {
              updated[lastIdx] = { sender: "ai", text: responseText };
            }
            return updated;
          });
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.sender === "ai") {
              updated[lastIdx] = {
                sender: "ai",
                text: "I couldn't generate a response. Please try again!",
              };
            }
            return updated;
          });
        }

        setIsOllamaOnline(true);
      } catch (err) {
        if (abortFlagRef.current) return; // User cleared chat during request

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";

        console.error("[useOllamaChat] Error:", errorMessage);

        // Determine error type for better UX
        if (
          errorMessage.includes("Cannot connect") ||
          errorMessage.includes("ECONNREFUSED") ||
          errorMessage.includes("fetch failed")
        ) {
          setError(
            "Cannot connect to Ollama. Make sure it's running on localhost:11434"
          );
          setIsOllamaOnline(false);
        } else {
          setError(errorMessage);
        }

        // Update the placeholder AI message with error
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.sender === "ai" && !updated[lastIdx].text) {
            updated[lastIdx] = {
              sender: "ai",
              text: "⚠️ Sorry, I'm having trouble connecting right now. Please make sure Ollama is running and try again.",
            };
          }
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const clearChat = useCallback(() => {
    abortFlagRef.current = true;
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isOllamaOnline,
    error,
    sendMessage,
    checkConnection,
    clearChat,
  };
}
