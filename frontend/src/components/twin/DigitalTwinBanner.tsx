import React from "react";
import { useDigitalTwin } from "@/context/DigitalTwinContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, TrendingUp, Sliders, ArrowRight, ShieldCheck } from "lucide-react";

export function DigitalTwinBanner() {
  const { profile, openTwinModal } = useDigitalTwin();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900 p-6 sm:p-7 text-white shadow-md">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-0.5 text-xs font-semibold gap-1.5">
              <Bot className="h-3.5 w-3.5" /> AI Digital Twin Active
            </Badge>
            <Badge variant="outline" className="text-[11px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-semibold">
              96% Personal Calibration
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            Your Personal Shopping Twin is{" "}
            <span className="text-cyan-400">
              Monitoring 14 Deals
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Configured for <span className="font-semibold text-white uppercase tracking-wider">{profile.personaType.replace("_", " ")}</span> mode. Target budget ₹{profile.minBudget.toLocaleString()} - ₹{profile.maxBudget.toLocaleString()}. Your Twin projects <span className="font-semibold text-emerald-400">₹24,850 annual savings</span>.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Low Regret Risk Filter
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="h-4 w-4 text-cyan-400" /> {profile.priceDropThreshold}% Price Drop Trigger
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Button
            onClick={() => openTwinModal("results")}
            className="h-10 rounded-lg px-5 text-xs font-semibold bg-brand hover:bg-brand/90 text-white shadow-xs gap-2"
          >
            <Sparkles className="h-3.5 w-3.5" /> View Twin Insights & Deals <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={() => openTwinModal("collect")}
            variant="outline"
            className="h-10 rounded-lg px-4 text-xs font-semibold border-white/20 text-white hover:bg-white/10 gap-2 bg-transparent"
          >
            <Sliders className="h-3.5 w-3.5" /> Calibrate Data
          </Button>
        </div>
      </div>
    </div>
  );
}
