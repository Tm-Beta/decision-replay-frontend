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
} from "lucide-react";

export function AuthGate() {
  return (
    <div className="py-6 sm:py-12 space-y-12">
      {/* Hero Welcome Card */}
      <div className="relative rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-plum-500/5 p-6 sm:p-12 shadow-dock overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-spring-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-plum-800/10 dark:bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]"
          >
            Capture your beliefs before reality happens.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Human retrospect edits past memory to fit what happened. Decision Replay locks your explicit reasoning into a cryptographic SHA-256 snapshot, so you discover your true prediction accuracy without hindsight bias.
          </motion.p>

          {/* Real Google Sign-in Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4 flex flex-col items-center gap-4"
          >
            <GoogleAuthButton size="large" />

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-spring-500" />
                Zero passwords or verification codes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                User-isolated encrypted database
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1 */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-3 shadow-soft">
          <div className="h-10 w-10 rounded-2xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 grid place-items-center shadow-soft">
            <Fingerprint className="h-5 w-5 text-spring-400 dark:text-plum-950" />
          </div>
          <h3 className="font-display text-base font-bold text-foreground">
            Cryptographic Snapshots
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every choice, rationale, and assumption is frozen with a SHA-256 hash. Invariants prohibit editing past snapshots, guaranteeing honest post-mortems.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-3 shadow-soft">
          <div className="h-10 w-10 rounded-2xl bg-spring-500 text-plum-950 grid place-items-center shadow-soft">
            <TrendingUp className="h-5 w-5 stroke-[2.5]" />
          </div>
          <h3 className="font-display text-base font-bold text-foreground">
            Empirical Replay Review
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When reality unfolds, score your predictions against frozen beliefs. Quantify your calibration delta and celebrate assumptions that held.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-3 shadow-soft">
          <div className="h-10 w-10 rounded-2xl bg-plum-100 text-primary dark:bg-plum-900/60 grid place-items-center shadow-soft">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-bold text-foreground">
            Longitudinal Decision DNA
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Synthesize your cognitive radar across 6 dimensions. Detect blind spots such as Schedule Optimism or Cost Underestimation across projects.
          </p>
        </div>
      </div>
    </div>
  );
}
