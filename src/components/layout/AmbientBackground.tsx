import React from "react";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-background">
      {/* Soft Blue Ambient Glows */}
      <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-300/15 blur-[100px]" />
      <div className="absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full bg-indigo-300/15 blur-[120px]" />
      
      {/* Subtle floating spheres */}
      <div className="absolute left-[15%] top-[20%] h-32 w-32 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-xl" />
      <div className="absolute right-[20%] top-[30%] h-48 w-48 animate-[pulse_10s_ease-in-out_infinite_1s] rounded-full bg-gradient-to-tr from-purple-400/10 to-blue-400/10 blur-2xl" />
      <div className="absolute left-[30%] bottom-[20%] h-40 w-40 animate-[pulse_9s_ease-in-out_infinite_2s] rounded-full bg-gradient-to-bl from-indigo-400/10 to-purple-400/10 blur-2xl" />
      
      {/* Light Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-40" />
    </div>
  );
}
