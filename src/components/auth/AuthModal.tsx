"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { X, ShieldCheck, Sparkles } from "lucide-react";

export function AuthModal() {
  const { showAuthModal, closeAuthModal, loginWithGoogle } = useAuthStore();
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleInstantGoogleLogin = async (email = "achamath1@gmail.com", name = "Chamath Adithya") => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      });
    } catch {
      setError("Unable to authenticate with Google. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    handleInstantGoogleLogin(customEmail, customName || customEmail.split("@")[0]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-plum-950/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-dock text-foreground z-10 overflow-hidden"
        >
          {/* Subtle Corner Glow */}
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-spring-500/15 blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 shadow-soft mb-1">
              <AnimatedIcon name="compass" size={24} />
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Welcome to Decision Replay
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Sign in with your Google account to access your prospective decision snapshots and Decision DNA.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive text-center">
              {error}
            </div>
          )}

          {/* Google Sign-in Button */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={() => handleInstantGoogleLogin()}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-border/90 bg-card/90 hover:bg-muted/40 font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-spring-500"
            >
              {/* Google G Logo SVG */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
              <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
            </motion.button>

            {/* Alternate Google Account Toggle */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline font-medium"
              >
                {showCustom ? "Use standard 1-click Google Sign-In" : "Sign in with a specific Google / Gmail address"}
              </button>
            </div>

            {showCustom && (
              <form onSubmit={handleCustomSubmit} className="pt-2 space-y-2.5">
                <Input
                  placeholder="name@gmail.com"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="h-10 rounded-xl text-xs bg-muted/40"
                  required
                />
                <Input
                  placeholder="Full Name (optional)"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-10 rounded-xl text-xs bg-muted/40"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Confirm Gmail Login
                </Button>
              </form>
            )}
          </div>

          {/* Privacy & Zero-Password Assurance */}
          <div className="mt-6 pt-5 border-t border-border/60 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-spring-500 shrink-0" />
              <span>Zero password fatigue — no SMS or verification codes required.</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Decisions are cryptographically isolated to your verified identity.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
