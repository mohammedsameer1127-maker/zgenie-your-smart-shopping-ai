import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
    },
    optimizeDeps: {
      include: [
        "lucide-react",
        "firebase/auth",
        "firebase/app",
        "firebase/firestore",
        "axios",
        "sonner",
        "@tanstack/react-router",
        "@tanstack/react-query",
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
