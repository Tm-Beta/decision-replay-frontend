"use client";

import React from "react";
import { motion } from "framer-motion";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import {
  ShieldCheck,
  Lock,
  Fingerprint,
  TrendingUp,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

export function AuthGate() {
  return (
    <div className="relative w-full min-h-[calc(100vh-9rem)] flex flex-col items-center justify-center py-6 sm:py-12 overflow-visible">
      {/* Central Stage Container */}
      <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* ========================================================================= */}
        {/* DESKTOP FLOATING SATELLITE CARDS (elevated z-index, orbit/floating physics) */}
        {/* ========================================================================= */}

        {/* Satellite Card 1: Cryptographic Snapshots (Top-Left / West) */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: -20 }}
          animate={{
            opacity: 1,
            x: 0,
            y: [-8, 8, -8],
            rotate: [-1.5, 0.5, -1.5],
          }}
          transition={{
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.8, delay: 0.1 },
            x: { duration: 0.8, delay: 0.1 },
          }}
          whileHover={{ scale: 1.05, rotate: 0 }}
          className="hidden lg:block absolute -top-8 -left-24 xl:-left-36 z-20 w-72 rounded-2xl border border-border/90 bg-card/90 p-4 shadow-dock backdrop-blur-xl cursor-default transition-colors hover:border-spring-500/60"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 grid place-items-center shadow-soft">
              <Fingerprint className="h-5 w-5 text-spring-400 dark:text-plum-950" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-spring-600 dark:text-spring-400 px-2 py-0.5 rounded-full bg-spring-500/10 border border-spring-500/20">
              SHA-256 Seal
            </span>
          </div>
          <h4 className="font-display text-sm font-bold text-foreground">
            Cryptographic Snapshots
          </h4>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Every belief frozen into an immutable SHA-256 snapshot. Invariants prohibit editing past post-mortems.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-spring-500 animate-pulse" />
            <span>Immutable Integrity</span>
          </div>
        </motion.div>

        {/* Satellite Card 2: Empirical Replay Review (Top-Right / East) */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20 }}
          animate={{
            opacity: 1,
            x: 0,
            y: [8, -8, 8],
            rotate: [1.5, -0.5, 1.5],
          }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
            rotate: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
            opacity: { duration: 0.8, delay: 0.2 },
            x: { duration: 0.8, delay: 0.2 },
          }}
          whileHover={{ scale: 1.05, rotate: 0 }}
          className="hidden lg:block absolute -top-6 -right-24 xl:-right-36 z-20 w-72 rounded-2xl border border-border/90 bg-card/90 p-4 shadow-dock backdrop-blur-xl cursor-default transition-colors hover:border-spring-500/60"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-spring-500 text-plum-950 grid place-items-center shadow-soft">
              <TrendingUp className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-spring-600 dark:text-spring-400 px-2 py-0.5 rounded-full bg-spring-500/10 border border-spring-500/20">
              Calibration Delta
            </span>
          </div>
          <h4 className="font-display text-sm font-bold text-foreground">
            Empirical Replay Review
          </h4>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            When reality unfolds, score predictions against frozen beliefs. Quantify your calibration delta honestly.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-spring-500" />
            <span>Zero Hindsight Bias</span>
          </div>
        </motion.div>

        {/* Satellite Card 3: Longitudinal Decision DNA (Bottom-Right / South-East) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: [-6, 6, -6],
            rotate: [-1, 1, -1],
          }}
          transition={{
            y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            rotate: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            opacity: { duration: 0.8, delay: 0.3 },
          }}
          whileHover={{ scale: 1.05, rotate: 0 }}
          className="hidden lg:block absolute -bottom-8 -right-16 xl:-right-28 z-20 w-76 rounded-2xl border border-border/90 bg-card/90 p-4 shadow-dock backdrop-blur-xl cursor-default transition-colors hover:border-primary/50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-plum-100 text-primary dark:bg-plum-900/60 grid place-items-center shadow-soft">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              Cognitive Radar
            </span>
          </div>
          <h4 className="font-display text-sm font-bold text-foreground">
            Longitudinal Decision DNA
          </h4>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Surface recurring cognitive blind spots like Schedule Optimism & Cost Underestimation across projects.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-spring-500" />
            <span>6 Cognitive Dimensions</span>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* CENTER PRIMARY CARD: "Capture your beliefs before reality happens."        */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-plum-500/10 p-6 sm:p-12 shadow-dock overflow-hidden text-center space-y-6"
        >
          {/* Ambient Glows inside card */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-spring-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-plum-800/10 dark:bg-primary/10 blur-3xl pointer-events-none" />

          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-spring-500/30 bg-spring-500/10 px-3.5 py-1 text-xs font-bold text-spring-700 dark:text-spring-400 shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spring-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-spring-500" />
            </span>
            <span>Prospective Metacognition & Zero Hindsight Bias</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]"
          >
            Capture your beliefs before reality happens.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Human retrospect edits past memory to fit what happened. Decision Replay locks your explicit reasoning into a cryptographic SHA-256 snapshot, so you discover your true prediction accuracy without hindsight bias.
          </motion.p>

          {/* Google Sign-in Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4 flex flex-col items-center gap-4"
          >
            <GoogleAuthButton size="large" />

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-spring-500" />
                Zero passwords or verification codes
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                User-isolated encrypted database
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ========================================================================= */}
        {/* MOBILE & TABLET RESPONSIVE CARDS (< lg screens)                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full mt-6 lg:hidden">
          {/* Mobile Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-dock backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 grid place-items-center shadow-soft shrink-0">
                <Fingerprint className="h-4 w-4 text-spring-400 dark:text-plum-950" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-xs font-bold text-foreground">
                  Cryptographic Snapshots
                </h4>
                <span className="text-[10px] font-mono text-spring-600 dark:text-spring-400">
                  SHA-256 Seal
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every belief frozen into an immutable snapshot. Invariants prohibit editing past post-mortems.
            </p>
          </motion.div>

          {/* Mobile Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-dock backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-xl bg-spring-500 text-plum-950 grid place-items-center shadow-soft shrink-0">
                <TrendingUp className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-xs font-bold text-foreground">
                  Empirical Replay Review
                </h4>
                <span className="text-[10px] font-mono text-spring-600 dark:text-spring-400">
                  Zero Hindsight Bias
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              When reality unfolds, score predictions against frozen beliefs and quantify your calibration delta.
            </p>
          </motion.div>

          {/* Mobile Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-dock backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-xl bg-plum-100 text-primary dark:bg-plum-900/60 grid place-items-center shadow-soft shrink-0">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-xs font-bold text-foreground">
                  Decision DNA
                </h4>
                <span className="text-[10px] font-mono text-primary">
                  Cognitive Radar
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Detect systematic blind spots like schedule and cost optimism across projects.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
