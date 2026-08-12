import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import compareLogo from "@/assets/compare-logo.svg";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";

export function CompanyLogo({ size = 42, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={compareLogo}
        alt="ZGenie Logo"
        width={size}
        height={size}
        className="rounded-xl shadow-md transition-transform hover:scale-105"
      />
      <span className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Z<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 bg-clip-text text-transparent">Genie</span>
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          Your Smart Shopping AI
        </span>
      </span>
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
    <div className="min-h-screen bg-slate-950/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-12">
        
        {/* Left branding & feature showcase panel */}
        <div className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:col-span-6 lg:flex lg:flex-col lg:justify-between xl:col-span-7">
          {/* Background Ambient Gradients */}
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-slate-500/20 blur-3xl" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />

          {/* Header Branding */}
          <div className="relative z-10">
            <Link to="/home" className="inline-flex items-center gap-3">
              <img src={compareLogo} alt="ZGenie Logo" className="h-11 w-11 rounded-xl shadow-lg ring-1 ring-white/20" />
              <div>
                <div className="text-2xl font-black tracking-tight text-white">
                  Z<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Genie</span>
                </div>
                <div className="text-xs font-medium text-blue-300/80">Your Smart Shopping AI</div>
              </div>
            </Link>
          </div>

          {/* Main Hero Tagline & Interactive Feature Card */}
          <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Product Intelligence</span>
            </div>

            <h2 className="text-4xl font-black tracking-tight leading-tight sm:text-5xl text-white">
              Compare Anything.<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200 bg-clip-text text-transparent">
                Buy with 100% Confidence.
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
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
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-blue-400/40 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 text-blue-300">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note & link */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} ZGenie. All rights reserved.</p>
            <Link to="/home" className="inline-flex items-center gap-1 font-medium text-blue-400 hover:text-blue-300 hover:underline">
              Explore Storefront <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-col justify-between px-6 py-10 sm:px-12 lg:col-span-6 lg:px-16 xl:col-span-5 bg-background">
          <div className="mx-auto w-full max-w-md my-auto">
            {/* Mobile Header Logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Link to="/home" className="inline-flex items-center gap-3">
                <img src={compareLogo} alt="ZGenie Logo" className="h-10 w-10 rounded-xl shadow-md" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Z<span className="text-brand">Genie</span>
                </span>
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
            <Link to="/home" className="font-semibold text-brand hover:underline">
              Continue to ZGenie Storefront →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}