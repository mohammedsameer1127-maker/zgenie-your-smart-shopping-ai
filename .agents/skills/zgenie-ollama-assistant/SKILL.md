---
name: zgenie-ollama-assistant
description: Integrates the local Ollama Qwen3:8b model as the ZGenie AI Shopping Assistant. The model is constrained via a system prompt to ONLY answer shopping-related questions about the ZGenie platform (product comparisons, price tracking, recommendations across Amazon, Flipkart, Meesho, Croma, Reliance Digital).
---

# ZGenie Ollama AI Assistant

This skill documents how the ZGenie AI Shopping Assistant is powered by a **locally running Ollama instance** with the **Qwen3:8b** model. The model is system-prompted to act exclusively as a shopping concierge for the ZGenie platform.

## Architecture

```
Browser (React)
    │
    │  fetch POST http://localhost:11434/api/chat
    │  (streaming NDJSON)
    │
    ▼
Ollama Server (local, port 11434)
    │
    │  Model: Qwen3:8b (5.2 GB)
    │
    ▼
Streaming tokens → React state → UI
```

The browser communicates **directly** with the local Ollama server. There is no server-side proxy since Ollama runs on the same machine and allows localhost CORS by default.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/ollama.ts` | Ollama service: system prompt, streaming generator, health check |
| `src/hooks/useOllamaChat.ts` | React hook: manages messages, loading, errors, streaming state |
| `src/routes/assistant.tsx` | UI: chat page with streaming display, connection indicator |

## System Prompt (Shopping Guardrails)

The system prompt in `src/lib/ollama.ts` constrains the model to:

### ✅ Allowed Topics
- Product comparisons across Amazon, Flipkart, Meesho, Croma, Reliance Digital
- Price tracking, history, and drop predictions
- Shopping recommendations (budget, preferences, use case)
- Product specs, reviews, ratings, regret scores
- Category browsing, deal alerts, best-time-to-buy
- Warranty and delivery comparisons across stores
- Gift recommendations

### ❌ Blocked Topics
- Programming, coding, math, science, academics
- Politics, news, current events
- Health, medical, legal, financial advice
- Creative writing, entertainment
- Personal relationships, philosophy
- Any prompt injection attempts

When the user asks off-topic questions, the model responds with a friendly redirect:
> "I'm ZGenie AI, your shopping concierge! I specialize in product comparisons and shopping advice. How can I help you find the perfect product today? 🛍️"

## Configuration

### Model & Endpoint

Edit constants at the top of `src/lib/ollama.ts`:

```typescript
const OLLAMA_BASE_URL = "http://localhost:11434";
const OLLAMA_MODEL = "Qwen3:8b";
```

### Changing the Model

To use a different Ollama model:

1. Pull the model: `ollama pull <model-name>`
2. Update `OLLAMA_MODEL` in `src/lib/ollama.ts`
3. Restart the dev server

### Modifying the System Prompt

Edit `ZGENIE_SYSTEM_PROMPT` in `src/lib/ollama.ts`. The prompt is structured with clear sections:
- **Role** — defines who the AI is
- **Allowed topics** — exhaustive list of shopping subjects
- **Blocked topics** — explicit deny list with example decline response
- **Response style** — formatting, currency, length guidelines

## Prerequisites

1. **Ollama must be installed and running**:
   ```bash
   # Check if Ollama is running
   ollama list

   # Start Ollama server (if not running)
   ollama serve

   # Verify the model is available
   ollama list
   # Should show: Qwen3:8b
   ```

2. **Pull the model (first time only)**:
   ```bash
   ollama pull Qwen3:8b
   ```

## Troubleshooting

### "Ollama Offline" indicator in the UI
- **Cause**: Ollama server is not running
- **Fix**: Run `ollama serve` in a terminal, then click "Retry" in the UI

### Slow responses
- **Cause**: Qwen3:8b is a 5.2 GB model; speed depends on your GPU/CPU
- **Fix**: Ensure GPU acceleration is enabled. Check with `ollama ps`

### Model not found errors
- **Cause**: The model name doesn't match what's installed
- **Fix**: Run `ollama list` and update `OLLAMA_MODEL` in `src/lib/ollama.ts`

### CORS errors
- **Cause**: Ollama defaults allow localhost. If you're accessing from a different host:
- **Fix**: Set `OLLAMA_ORIGINS=*` environment variable before starting Ollama

### Model answers off-topic questions
- **Cause**: System prompt is being ignored (rare with Qwen3)
- **Fix**: Strengthen the system prompt deny list in `ZGENIE_SYSTEM_PROMPT`

## Streaming Behavior

The chat uses **token-by-token streaming** via Ollama's NDJSON streaming API:

1. User sends a message
2. `useOllamaChat` builds the conversation history
3. `streamOllamaChat()` sends to Ollama with `stream: true`
4. Tokens arrive as newline-delimited JSON chunks
5. Each token is appended to the AI message in real-time
6. A blinking cursor shows while streaming is active
7. The UI auto-scrolls to keep the latest content visible

## Adding New Features

### Adding product data context
To give the model knowledge of actual product inventory, modify the system prompt to include structured data:

```typescript
const ZGENIE_SYSTEM_PROMPT = `...existing prompt...

## Current Product Catalog
${JSON.stringify(productCatalog, null, 2)}
`;
```

### Adding conversation memory
The hook already maintains full conversation history within a session. For persistent memory across page refreshes, save `messages` to `localStorage` in the hook.

### Adding function calling
Qwen3 supports tool/function calling. You can extend `src/lib/ollama.ts` to include `tools` in the API request for structured actions like "add to cart" or "start comparison".
