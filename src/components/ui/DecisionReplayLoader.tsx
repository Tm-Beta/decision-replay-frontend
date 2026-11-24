"use client";

import React from "react";

interface DecisionReplayLoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  className?: string;
}

export function DecisionReplayLoader({
  size = "md",
  className = "",
}: DecisionReplayLoaderProps) {
  const sizeMap = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-10 w-10 border-[2.5px]",
    fullscreen: "h-11 w-11 border-[2.5px]",
  }[size];

  const isFullscreen = size === "fullscreen" || size === "lg";

  return (
    <div
      className={`flex items-center justify-center select-none ${
        isFullscreen ? "w-full flex-1 py-16 sm:py-24 my-auto" : "py-6"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle Ambient Spring Glow */}
        <div className="absolute inset-0 rounded-full bg-spring-500/25 blur-sm pointer-events-none scale-125" />

        {/* Clean, Simple Minimalist Spinner */}
        <div
          className={`${sizeMap} rounded-full border-border/60 border-t-spring-500 border-r-spring-400/40 animate-spin`}
          style={{ animationDuration: "0.75s" }}
        />
      </div>
    </div>
  );
}
