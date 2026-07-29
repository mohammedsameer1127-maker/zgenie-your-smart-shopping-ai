import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="relative hidden overflow-hidden bg-[image:var(--gradient-brand)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight">ZGenie</span>
          </Link>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Shopping, reimagined by AI.
            </h2>
            <p className="max-w-sm text-white/80">
              Predict prices, score regret risk, and discover products curated
              for the moments that matter.
            </p>
            <div className="space-y-3">
              {[
                "AI Regret Score on every product",
                "Future price predictions",
                "Your personal Shopping Twin",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-xs text-white/60">
            © {new Date().getFullYear()} ZGenie. All rights reserved.
          </p>
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-brand)] text-white shadow-[var(--shadow-glow)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              ZGenie
            </span>
          </Link>

          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}