"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { X, ShieldCheck, Lock } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export function AuthModal() {
  const { showAuthModal, closeAuthModal } = useAuthStore();

  if (!showAuthModal) return null;

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
          className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-dock text-foreground z-10 overflow-hidden text-center space-y-6"
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
          <div className="space-y-2">
            <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 shadow-soft mb-1">
              <AnimatedIcon name="compass" size={24} className="text-spring-400 dark:text-plum-950" />
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Sign In with Google
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Authenticate with your Google account to access your cryptographically isolated prospective decisions.
            </p>
          </div>

          {/* Genuine Google OAuth Button */}
          <div className="pt-2 flex justify-center">
            <GoogleAuthButton size="large" />
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-spring-500" />
              <span>Zero password fatigue — verified Google identity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-primary" />
              <span>
                Cryptographically isolated database &middot;{" "}
                <a
                  href="https://github.com/Tm-Beta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-2"
                >
                  Tm-Beta
                </a>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
