"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

interface DecisionReplayLoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  className?: string;
  label?: string;
}

export function DecisionReplayLoader({
  size = "md",
  className = "",
  label,
}: DecisionReplayLoaderProps) {
  const config = {
    sm: {
      outer: "h-8 w-8",
      core: "h-6 w-6 rounded-lg",
      iconSize: 13,
      dot: "h-1.5 w-1.5",
      dotOffset: "-top-0.5 -right-0.5",
    },
    md: {
      outer: "h-16 w-16",
      core: "h-11 w-11 rounded-xl",
      iconSize: 20,
      dot: "h-2 w-2",
      dotOffset: "-top-1 -right-1",
    },
    lg: {
      outer: "h-24 w-24",
      core: "h-16 w-16 rounded-2xl",
      iconSize: 28,
      dot: "h-2.5 w-2.5",
      dotOffset: "-top-1 -right-1",
    },
    fullscreen: {
      outer: "h-28 w-28",
      core: "h-18 w-18 rounded-2xl",
      iconSize: 34,
      dot: "h-3 w-3",
      dotOffset: "-top-1.5 -right-1.5",
    },
  }[size];

  const isFullscreen = size === "fullscreen" || size === "lg";

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        isFullscreen ? "w-full flex-1 py-16 sm:py-24 my-auto" : "py-6"
      } ${className}`}
    >
      <div className={`relative ${config.outer} flex items-center justify-center`}>
        {/* Deep Ambient Breathing Spring Glow (Synchronized with Heartbeat) */}
        <motion.div
          animate={{
            scale: [0.9, 1.25, 1.05, 1.45, 0.95, 0.9],
            opacity: [0.25, 0.55, 0.35, 0.75, 0.25, 0.25],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.14, 0.28, 0.44, 0.7, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-spring-500/30 blur-2xl pointer-events-none"
        />

        {/* Primary Radiant Ripple Shockwave (Fired on the Main Beat) */}
        <motion.div
          animate={{
            scale: [0.85, 2.3],
            opacity: [0.65, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0.38, 1],
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full border border-spring-400/40 pointer-events-none"
        />

        {/* Secondary Radiant Ripple Shockwave (Subtle Pre-wave) */}
        <motion.div
          animate={{
            scale: [0.75, 1.75],
            opacity: [0.45, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0.12, 0.85],
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full border border-spring-500/25 pointer-events-none"
        />

        {/* Beating Center Core (Realistic lub-DUB Heartbeat Rhythm) */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1.05, 1.32, 1, 1],
            boxShadow: [
              "0 0 16px rgba(0, 229, 138, 0.3)",
              "0 0 32px rgba(0, 229, 138, 0.65)",
              "0 0 20px rgba(0, 229, 138, 0.38)",
              "0 0 48px rgba(0, 229, 138, 0.9)",
              "0 0 16px rgba(0, 229, 138, 0.3)",
              "0 0 16px rgba(0, 229, 138, 0.3)",
            ],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.14, 0.28, 0.44, 0.7, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative z-10 ${config.core} grid place-items-center bg-spring-500/15 dark:bg-spring-500/20 border border-spring-400/50 backdrop-blur-md shadow-lg`}
        >
          {/* Brand Compass Icon */}
          <Compass
            size={config.iconSize}
            className="text-spring-400 dark:text-spring-400 stroke-[2.3] filter drop-shadow-[0_0_8px_rgba(0,229,138,0.7)]"
          />

          {/* Calibrated Beacon Pulse Dot */}
          <span
            className={`absolute ${config.dotOffset} ${config.dot} rounded-full bg-spring-400 shadow-[0_0_8px_#00E58A] pointer-events-none`}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spring-300 opacity-60" />
          </span>
        </motion.div>
      </div>

      {/* Optional Label */}
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-[11px] font-mono tracking-wider text-muted-foreground uppercase"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
