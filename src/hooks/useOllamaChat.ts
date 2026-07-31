import { useState, useCallback, useRef } from "react";
import {
  streamOllamaChat,
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
  text: "Hello! I am your ZGenie AI Assistant, powered by local AI. Tell me what you're looking for (e.g., 'Compare Mac vs PC laptops under $1,200') and I'll find the best options for you!",
};

export function useOllamaChat(): UseOllamaChatReturn {
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaOnline, setIsOllamaOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

      // Add user message
      const userMessage: DisplayMessage = { sender: "user", text: text.trim() };
      setMessages((prev) => [...prev, userMessage]);

      // Add placeholder AI message that we'll stream into
      const aiPlaceholder: DisplayMessage = { sender: "ai", text: "" };
      setMessages((prev) => [...prev, aiPlaceholder]);

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
        // Cancel any previous in-flight request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        let fullResponse = "";

        for await (const token of streamOllamaChat(
          conversationHistory,
          abortController.signal
        )) {
          fullResponse += token;
          // Update the last AI message with the accumulated text
          const currentText = fullResponse;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.sender === "ai") {
              updated[lastIdx] = { sender: "ai", text: currentText };
            }
            return updated;
          });
        }

        // If the response is empty, show a fallback
        if (!fullResponse.trim()) {
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
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";

        // Check if it's a connection error
        if (
          errorMessage.includes("fetch") ||
          errorMessage.includes("network") ||
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError")
        ) {
          setError(
            "Cannot connect to Ollama. Make sure it's running on localhost:11434"
          );
          setIsOllamaOnline(false);
        } else if (errorMessage.includes("aborted")) {
          // User cancelled — not an error
        } else {
          setError(errorMessage);
        }

        // Update the placeholder AI message with an error
        if (!errorMessage.includes("aborted")) {
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
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
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
