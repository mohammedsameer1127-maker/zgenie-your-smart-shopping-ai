import { useState, useCallback, useRef } from "react";
import { sendGroqChat } from "@/lib/groq";

export interface DisplayMessage {
  sender: "ai" | "user";
  text: string;
}

interface UseOllamaChatReturn {
  messages: DisplayMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const WELCOME_MESSAGE: DisplayMessage = {
  sender: "ai",
  text: "Hello! I am your ZGenie AI Shopping Assistant. Tell me what you're looking for (e.g., 'Best wireless headphones under ₹25,000' or 'Compare iPhone 15 Pro vs Samsung S24 Ultra') and I'll find the best real-time deals across verified stores for you!",
};

export function useOllamaChat(): UseOllamaChatReturn {
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortFlagRef = useRef(false);

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

      // Build the conversation history (excluding the welcome message)
      const conversationHistory: { role: string; content: string }[] = [];
      const allMessages = [...messages, userMessage];

      for (const msg of allMessages) {
        if (msg === WELCOME_MESSAGE) continue;
        conversationHistory.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        });
      }

      try {
        const responseText = await sendGroqChat(conversationHistory);

        if (abortFlagRef.current) return;

        if (responseText && responseText.trim()) {
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
                text: "I couldn't generate a response. Please try asking again!",
              };
            }
            return updated;
          });
        }
      } catch (err: any) {
        if (abortFlagRef.current) return;

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("[useOllamaChat] Error:", errorMessage);

        setError(errorMessage);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.sender === "ai" && !updated[lastIdx].text) {
            updated[lastIdx] = {
              sender: "ai",
              text: "⚠️ Sorry, I'm having trouble connecting to ZGenie AI right now. Please check your API key and network connection.",
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
    error,
    sendMessage,
    clearChat,
  };
}
