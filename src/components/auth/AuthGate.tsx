"use client";

import React, { useState } from "react";
import { useAuthStore, GOOGLE_TEAM_ACCOUNTS, GoogleAccountOption } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Fingerprint,
  TrendingUp,
  BrainCircuit,
  Compass,
} from "lucide-react";

export function AuthGate() {
  const { loginWithGoogle } = useAuthStore();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (account?: GoogleAccountOption) => {
    const target = account || GOOGLE_TEAM_ACCOUNTS[0];
    setLoadingEmail(target.email);
    setError(null);
    try {
      await loginWithGoogle({
        email: target.email,
        name: target.name,
        avatar: target.avatar,
      });
    } catch {
      setError("Unable to authenticate with Google. Ensure backend service is reachable on port 4000.");
    } finally {
      setLoadingEmail(null);
    }
  };

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

          {error && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive max-w-md mx-auto">
              {error}
            </div>
          )}

          {/* Google Sign-in CTA Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-2 flex flex-col items-center gap-4"
          >
            {/* Primary Google Login Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loadingEmail !== null}
              onClick={() => handleSignIn()}
              className="group flex items-center justify-center gap-3.5 h-14 px-8 rounded-2xl bg-card border-2 border-border/90 hover:border-spring-500 font-display text-base font-bold text-foreground shadow-dock hover:shadow-spring transition-all cursor-pointer"
            >
              {/* Google Brand G */}
              <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loadingEmail ? "Signing in with Google..." : "Continue with Google"}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
            </motion.button>

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

          {/* Team Quick Switcher (Zero Manual Typing) */}
          <div className="pt-6 border-t border-border/60">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Or sign in directly as a team member
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              {GOOGLE_TEAM_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  disabled={loadingEmail !== null}
                  onClick={() => handleSignIn(acc)}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 transition-all text-left group disabled:opacity-50"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="h-9 w-9 rounded-full border border-border/80 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {acc.email}
                    </div>
                  </div>
                  <div className="shrink-0 text-[10px] font-semibold text-primary group-hover:underline">
                    Sign in
                  </div>
                </button>
              ))}
            </div>
          </div>
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
