"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * 1. Prospective Decision Cycle Illustration
 * Belief -> Decision -> Reality -> Learning
 */
export function DecisionLoopIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 520 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-lg h-auto"
      >
        {/* Connection Curves */}
        <path
          d="M 60 60 H 180"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M 180 60 H 320"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M 320 60 H 460"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Node 1: Belief */}
        <g transform="translate(60, 60)">
          <circle r="22" className="fill-card stroke-border" strokeWidth="2" />
          <circle r="14" className="fill-plum-100 dark:fill-plum-900/60" />
          <circle r="6" className="fill-primary" />
          <text
            y="40"
            textAnchor="middle"
            className="fill-foreground font-display text-[11px] font-bold"
          >
            1. Belief
          </text>
        </g>

        {/* Node 2: Decision (Frozen Snapshot) */}
        <g transform="translate(190, 60)">
          <circle r="24" className="fill-card stroke-border" strokeWidth="2" />
          <circle r="16" className="fill-plum-900 dark:fill-primary" />
          {/* Lock Icon */}
          <rect x="-5" y="-3" width="10" height="9" rx="1.5" className="fill-cream-50 dark:fill-plum-950" />
          <path d="M -3 -3 V -6 C -3 -7.6 3 -7.6 3 -6 V -3" stroke="currentColor" className="stroke-cream-50 dark:stroke-plum-950" strokeWidth="1.5" />
          <text
            y="40"
            textAnchor="middle"
            className="fill-foreground font-display text-[11px] font-bold"
          >
            2. Lock Snapshot
          </text>
        </g>

        {/* Node 3: Reality (Outcome Arrival) */}
        <g transform="translate(330, 60)">
          <circle r="22" className="fill-card stroke-border" strokeWidth="2" />
          <circle r="14" className="fill-muted" />
          <circle r="6" className="fill-muted-foreground" />
          <text
            y="40"
            textAnchor="middle"
            className="fill-foreground font-display text-[11px] font-bold"
          >
            3. Reality
          </text>
        </g>

        {/* Node 4: Learning (Brier Score & Truth) */}
        <g transform="translate(460, 60)">
          <motion.circle
            r="26"
            className="fill-spring-500/10 stroke-spring-500"
            strokeWidth="2"
            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <circle r="18" className="fill-spring-500 text-plum-950" />
          {/* Spark Check */}
          <path d="M -5 0 L -1 4 L 5 -3" stroke="#1A0919" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text
            y="40"
            textAnchor="middle"
            className="fill-spring-600 dark:fill-spring-400 font-display text-[11px] font-extrabold"
          >
            4. Learning
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * 2. Empty State Illustration
 */
export function EmptyDecisionsIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-32 w-32 drop-shadow-soft"
      >
        <circle cx="80" cy="80" r="70" className="fill-card stroke-border/70" strokeWidth="2" />
        <circle cx="80" cy="80" r="50" className="fill-plum-50 dark:fill-plum-950/40" />
        {/* Animated Compass Rose */}
        <motion.path
          d="M 80 44 L 88 74 L 116 80 L 88 86 L 80 116 L 72 86 L 44 80 L 72 74 Z"
          className="fill-primary/80"
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "80px", originY: "80px" }}
        />
        {/* Center Spring Catalyst */}
        <circle cx="80" cy="80" r="5" className="fill-spring-400 ring-2 ring-background" />
      </svg>
    </div>
  );
}

/**
 * 3. Pre-Mortem Shield Visual
 */
export function PreMortemShieldIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 w-20"
      >
        <path
          d="M 60 15 L 95 30 V 65 C 95 88 60 105 60 105 C 60 105 25 88 25 65 V 30 Z"
          className="fill-card stroke-primary/30"
          strokeWidth="2.5"
        />
        <path
          d="M 60 25 L 85 36 V 63 C 85 80 60 93 60 93 C 60 93 35 80 35 63 V 36 Z"
          className="fill-plum-100/50 dark:fill-plum-900/30"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="10"
          className="fill-spring-500"
          animate={{ scale: [0.95, 1.1, 0.95] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <path d="M 57 60 L 59 62 L 63 58" stroke="#1A0919" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

