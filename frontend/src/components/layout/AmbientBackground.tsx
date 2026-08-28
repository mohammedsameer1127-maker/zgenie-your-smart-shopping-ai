import React from "react";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-background">
      {/* Very soft, static ambient gradients */}
      <div className="absolute -left-48 top-0 h-96 w-96 rounded-full bg-blue-400/5 blur-3xl" />
      <div className="absolute -right-48 top-1/4 h-96 w-96 rounded-full bg-indigo-400/5 blur-3xl" />
      
      {/* Subtle modern dot/grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,#000_15%,transparent_100%)] opacity-30" />
    </div>
  );
}
