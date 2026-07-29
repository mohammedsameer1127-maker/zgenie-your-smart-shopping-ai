import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import compareLogo from "@/assets/compare-logo.svg";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";

export function CompanyLogo({ size = 42, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={compareLogo}
        alt="Comparing Products Logo"
        width={size}
        height={size}
        className="rounded-xl shadow-md transition-transform hover:scale-105"
      />
      <span className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Comparing <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Products</span>
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          AI-Powered Smart Shopping
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
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />

          {/* Header Branding */}
          <div className="relative z-10">
            <Link to="/home" className="inline-flex items-center gap-3">
              <img src={compareLogo} alt="Comparing Products" className="h-11 w-11 rounded-xl shadow-lg ring-1 ring-white/20" />
              <div>
                <div className="text-2xl font-black tracking-tight text-white">
                  Comparing <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Products</span>
                </div>
                <div className="text-xs font-medium text-cyan-300/80">Smart AI Shopping Engine</div>
              </div>
            </Link>
          </div>

          {/* Main Hero Tagline & Interactive Feature Card */}
          <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Product Intelligence</span>
            </div>

            <h2 className="text-4xl font-black tracking-tight leading-tight sm:text-5xl text-white">
              Compare Anything.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                Buy with 100% Confidence.
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Comparing Products uses advanced AI to compare prices across stores, evaluate real user reviews, score product regret risk, and find you the perfect deal every time.
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
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-cyan-400/40 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 text-cyan-300">
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
            <p>© {new Date().getFullYear()} Comparing Products. All rights reserved.</p>
            <Link to="/home" className="inline-flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300 hover:underline">
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
                <img src={compareLogo} alt="Comparing Products" className="h-10 w-10 rounded-xl shadow-md" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Comparing <span className="text-brand">Products</span>
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
              Continue to Comparing Products Storefront →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}