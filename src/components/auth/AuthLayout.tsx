import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import compareLogo from "@/assets/zgenie-logo.png";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";

export function CompanyLogo({ size = 42, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src={compareLogo}
        alt="ZGenie Logo"
        width={size * 3} // Adjusting width for wide logo
        className="h-auto object-contain transition-transform hover:scale-105 drop-shadow-md"
      />
    </span>
  );
}

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
    <div className="min-h-screen text-foreground relative z-0">
      <AmbientBackground />
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left branding & feature showcase panel */}
        <div className="relative hidden overflow-hidden bg-background/40 backdrop-blur-sm p-12 lg:col-span-6 lg:flex lg:flex-col lg:justify-between xl:col-span-7">
          {/* Header Branding */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center">
              <img src={compareLogo} alt="ZGenie Logo" className="h-14 sm:h-16 w-auto drop-shadow-md transition-transform hover:scale-105" />
            </Link>
          </div>

          {/* Main Hero Tagline & Interactive Feature Card */}
          <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Product Intelligence</span>
            </div>

            <h2 className="text-4xl font-black tracking-tight leading-tight sm:text-5xl text-foreground">
              Compare Anything.<br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Buy with 100% Confidence.
              </span>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              ZGenie uses advanced AI to compare prices across stores, evaluate real user reviews, score product regret risk, and find you the perfect deal every time.
            </p>

            {/* Feature Highlights */}
            <div className="grid gap-3 pt-2">
              {[
                { title: "Side-by-Side Specs & Price Comparison", desc: "Live multi-store comparison", icon: Zap },
                { title: "AI Regret Score & Verdict", desc: "Predict satisfaction before purchase", icon: Sparkles },
                { title: "Price Drop Radar & Predictions", desc: "Get notified when prices hit historical lows", icon: ShieldCheck },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note & link */}
          <div className="relative z-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} ZGenie. All rights reserved.</p>
            <Link to="/" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
              Explore Storefront <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-between px-6 py-10 sm:px-12 lg:col-span-6 lg:px-16 xl:col-span-5 bg-background">
          <div className="mx-auto w-full max-w-md my-auto">
            {/* Mobile Header Logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Link to="/" className="inline-flex items-center">
                <img src={compareLogo} alt="ZGenie Logo" className="h-12 w-auto drop-shadow-md" />
              </Link>
            </div>

            {/* Form Title & Subtitle */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Main Form Slot */}
            <div className="mt-8">{children}</div>

            {/* Footer Slot */}
            <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border/60 pt-6">
              {footer}
            </div>
          </div>

          {/* Mobile Footer Guest Navigation */}
          <div className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
            <Link to="/" className="font-semibold text-brand hover:underline">
              Continue to ZGenie Storefront →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
