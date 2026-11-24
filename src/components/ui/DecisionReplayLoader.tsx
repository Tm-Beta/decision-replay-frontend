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
  // Dimensions based on size
  const dimensions = {
    sm: {
      outer: "h-12 w-12",
      ring1: "h-12 w-12",
      ring2: "h-9 w-9",
      core: "h-7 w-7 rounded-lg",
      icon: 14,
      dot: "h-1.5 w-1.5",
    },
    md: {
      outer: "h-16 w-16",
      ring1: "h-16 w-16",
      ring2: "h-12 w-12",
      core: "h-9 w-9 rounded-xl",
      icon: 18,
      dot: "h-2 w-2",
    },
    lg: {
      outer: "h-24 w-24",
      ring1: "h-24 w-24",
      ring2: "h-18 w-18",
      core: "h-14 w-14 rounded-2xl",
      icon: 26,
      dot: "h-2.5 w-2.5",
    },
    fullscreen: {
      outer: "h-28 w-28",
      ring1: "h-28 w-28",
      ring2: "h-20 w-20",
      core: "h-16 w-16 rounded-2xl",
      icon: 30,
      dot: "h-3 w-3",
    },
  }[size];

  const isFullscreen = size === "fullscreen" || size === "lg";

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        isFullscreen ? "w-full flex-1 py-16 sm:py-24 my-auto" : "py-8"
      } ${className}`}
    >
      <div className={`relative ${dimensions.outer} flex items-center justify-center`}>
        {/* Radar Pulse 1 */}
        <motion.div
          animate={{
            scale: [0.8, 1.6, 2.1],
            opacity: [0.55, 0.2, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full border border-spring-500/40 pointer-events-none"
        />

        {/* Radar Pulse 2 (Staggered) */}
        <motion.div
          animate={{
            scale: [0.8, 1.4, 1.9],
            opacity: [0.4, 0.15, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.9,
          }}
          className="absolute inset-0 rounded-full border border-primary/30 pointer-events-none"
        />

        {/* Outer Prospective Calibration Ring (Clockwise) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute ${dimensions.ring1} rounded-full border-2 border-t-spring-500 border-r-transparent border-b-primary/40 border-l-transparent shadow-xs`}
        />

        {/* Inner Counter-Rotating Gyro Ring (Counter-Clockwise) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute ${dimensions.ring2} rounded-full border border-dashed border-spring-400/60`}
        />

        {/* Ambient Core Glow */}
        <div className="absolute inset-2 rounded-full bg-spring-500/15 blur-md pointer-events-none" />

        {/* Center Brand Jewel Card */}
        <motion.div
          animate={{
            scale: [0.96, 1.04, 0.96],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative z-10 ${dimensions.core} grid place-items-center bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 shadow-soft border border-border/80`}
        >
          {/* Compass Metaphor with Gentle Needle Pivot */}
          <motion.div
            animate={{
              rotate: [-18, 18, -18],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Compass
              size={dimensions.icon}
              className="text-spring-400 dark:text-plum-950 stroke-[2.2]"
            />
          </motion.div>

          {/* Calibrated Pulse Beacon Dot */}
          <span
            className={`absolute -top-1 -right-1 ${dimensions.dot} rounded-full bg-spring-500 ring-2 ring-background`}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spring-400 opacity-75" />
          </span>
        </motion.div>
      </div>

      {/* Optional Subtle Label */}
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

