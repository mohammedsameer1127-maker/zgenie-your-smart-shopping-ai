import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AiFloatingButton } from "./AiFloatingButton";
import { AmbientBackground } from "./AmbientBackground";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <AmbientBackground />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      <AiFloatingButton />
    </div>
  );
}