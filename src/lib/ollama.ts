/**
 * Ollama Chat Service (Client Side)
 *
 * Routes all Ollama requests through TanStack Start server functions,
 * which run on the server and forward to Ollama at http://127.0.0.1:11434.
 *
 * Architecture:
 *   Browser → TanStack Start Server Function → Ollama API
 *
 * This avoids CORS issues and Vite/Nitro proxy conflicts.
 */

import {
  checkOllamaHealthServer,
  chatWithOllamaServer,
  listOllamaModelsServer,
} from "./ollama.server";

const DEFAULT_MODEL = "Qwen3:8b";

/**
 * System prompt that constrains the Qwen3:8b model to only answer
 * ZGenie shopping platform–related questions.
 */
const ZGENIE_SYSTEM_PROMPT = `You are ZGenie AI, an elite smart shopping assistant comparing Amazon, Flipkart, Meesho, Myntra, and Blinkit.

## Critical Response Rules:
- Keep answers SHORT, DIRECT, and CONCISE (under 120-150 words max).
- Recommend the top 1-2 best products with price in ₹ (INR) and the best retailer to buy from.
- Use 2-4 bullet points highlighting key reasons (price, ANC/specs, battery, regret score).
- No long introductory fluff, boilerplate text, or essays. Get straight to the buying verdict.
- Always use ₹ for currency.`;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Check if the Ollama server is reachable via server function.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const result = await checkOllamaHealthServer();
    if (!result.online) {
      console.warn("[Ollama Client] Health check failed:", result.error);
    }
    return result.online;
  } catch (err) {
    console.error("[Ollama Client] Health check exception:", err);
    return false;
  }
}

/**
 * Send a chat message to Ollama via server function.
 * Returns the full response text (non-streaming).
 */
export async function sendOllamaChat(
  userMessages: ChatMessage[]
): Promise<string> {
  // Prepend the system prompt to the conversation
  const messages: ChatMessage[] = [
    { role: "system", content: ZGENIE_SYSTEM_PROMPT },
    ...userMessages,
  ];

  console.log(`[Ollama Client] Sending chat request with ${messages.length} messages (model: ${DEFAULT_MODEL})`);

  const result = await chatWithOllamaServer({
    data: {
      model: DEFAULT_MODEL,
      messages,
    },
  });

  if (!result.success) {
    console.error("[Ollama Client] Chat failed:", result.error);
    throw new Error(result.error || "Ollama chat request failed");
  }

  const responseText = result.message?.content || "";
  console.log(`[Ollama Client] Response received (${responseText.length} chars)`);
  return responseText;
}

/**
 * List available Ollama models.
 */
export async function listOllamaModels(): Promise<Array<{ name: string }>> {
  try {
    const result = await listOllamaModelsServer();
    if (!result.success) {
      console.warn("[Ollama Client] Failed to list models:", result.error);
    }
    return result.models;
  } catch (err) {
    console.error("[Ollama Client] List models exception:", err);
    return [];
  }
}
