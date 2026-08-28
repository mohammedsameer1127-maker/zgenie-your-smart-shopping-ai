/**
 * Ollama Server Functions
 *
 * These TanStack Start server functions proxy Ollama requests from the
 * browser through the SSR server, avoiding CORS and Vite proxy conflicts
 * with TanStack Start's Nitro/h3 server.
 *
 * Flow: Browser → Server Function → Ollama at http://127.0.0.1:11434
 */
import { createServerFn } from "@tanstack/react-start";

const OLLAMA_ORIGIN = "http://127.0.0.1:11434";

/**
 * Server function: Check if Ollama is reachable.
 * Returns { online: boolean, error?: string }
 */
export const checkOllamaHealthServer = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const response = await fetch(OLLAMA_ORIGIN, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        return { online: true };
      }
      return { online: false, error: `Ollama returned HTTP ${response.status}` };
    } catch (err: any) {
      return { online: false, error: err.message || "Cannot reach Ollama" };
    }
  }
);

/**
 * Server function: Send a non-streaming chat request to Ollama.
 * Returns the full response object from Ollama.
 *
 * We use non-streaming here because TanStack Start server functions
 * return JSON — they don't support streaming responses natively.
 * The frontend will show a loading state while the full response generates.
 */
export const chatWithOllamaServer = createServerFn({ method: "POST" })
  .validator(
    (data: { model: string; messages: Array<{ role: string; content: string }> }) => data
  )
  .handler(async ({ data }) => {
    const { model, messages } = data;

    const requestUrl = `${OLLAMA_ORIGIN}/api/chat`;
    const requestBody = { model, messages, stream: false };

    console.log(`[Ollama Server] POST ${requestUrl} | model=${model} | messages=${messages.length}`);

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        // Generous timeout for large model inference
        signal: AbortSignal.timeout(120_000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error(`[Ollama Server] ERROR: HTTP ${response.status} from ${requestUrl} — ${errorText}`);
        return {
          success: false,
          error: `Ollama returned HTTP ${response.status}: ${errorText}`,
          status: response.status,
        };
      }

      const result = await response.json();
      console.log(`[Ollama Server] SUCCESS: model=${result.model}, done=${result.done}`);

      return {
        success: true,
        message: result.message,
        model: result.model,
        done: result.done,
      };
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error connecting to Ollama";
      console.error(`[Ollama Server] EXCEPTION: ${errorMsg}`);

      const isTimeout = errorMsg.includes("timeout") || errorMsg.includes("abort");
      const isConnection = errorMsg.includes("ECONNREFUSED") || errorMsg.includes("fetch failed");

      return {
        success: false,
        error: isConnection
          ? "Cannot connect to Ollama at http://127.0.0.1:11434. Make sure Ollama is running (ollama serve)."
          : isTimeout
            ? "Ollama took too long to respond. The model may be loading or the query was too complex."
            : `Ollama error: ${errorMsg}`,
        isConnectionError: isConnection,
      };
    }
  });

/**
 * Server function: List available Ollama models.
 * Returns { models: Array<{ name: string, ... }> }
 */
export const listOllamaModelsServer = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const response = await fetch(`${OLLAMA_ORIGIN}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return { success: false, error: `Ollama /api/tags returned HTTP ${response.status}`, models: [] };
      }

      const data = await response.json();
      console.log(`[Ollama Server] Models available: ${data.models?.map((m: any) => m.name).join(", ") || "none"}`);
      return { success: true, models: data.models || [] };
    } catch (err: any) {
      return { success: false, error: err.message, models: [] };
    }
  }
);
