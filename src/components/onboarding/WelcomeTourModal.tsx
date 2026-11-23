"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { DecisionLoopIllustration, PreMortemShieldIllustration } from "@/components/illustrations/DecisionIllustrations";
import { useRouter } from "next/navigation";
import { X, Sparkles, Target, Dna, ArrowRight, Check } from "lucide-react";

export function WelcomeTourModal() {
  const { showTourModal, closeTourModal, completeTour, user } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  if (!showTourModal) return null;

  const slides = [
    {
      title: "Welcome to Prospective Truth",
      subtitle: "The antidote to hindsight bias & outcome bias",
      icon: "compass" as const,
      description:
        "Human memory naturally rewrites history once an outcome is known. Decision Replay enforces the prospective cycle: capturing your exact belief, confidence, and expected metric before reality unfolds.",
      visual: <DecisionLoopIllustration className="py-2" />,
    },
    {
      title: "Immutable Snapshots",
      subtitle: "Cryptographic locks on your original rationale",
      icon: "lock" as const,
      description:
        "Once you commit a decision, its hypotheses, pros/cons, and review date are hashed with SHA-256 and permanently locked. Any subsequent learnings are logged as append-only timeline signals.",
      visual: (
        <div className="py-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-muted/40 p-4 font-mono text-xs text-spring-600 dark:text-spring-400">
            <span className="h-2 w-2 rounded-full bg-spring-500 animate-pulse" />
            <span>sha256: 7d4a9f...e18b (FROZEN & IMMUTABLE)</span>
          </div>
        </div>
      ),
    },
    {
      title: "The Socratic AI Mirror",
      subtitle: "Questions your blind spots, never decides for you",
      icon: "sparkles" as const,
      description:
        "As you draft a decision, our Socratic challenger analyzes your reasoning in real time. It flags schedule optimism, unmeasurable targets, and overconfidence while keeping your autonomy 100% intact.",
      visual: <PreMortemShieldIllustration className="py-2" />,
    },
    {
      title: "Reality Replay & Decision DNA",
      subtitle: "Honest learning when the outcome arrives",
      icon: "dna" as const,
      description:
        "When review day arrives, record actual results to calculate your empirical Prediction Accuracy and Brier Score calibration. Over time, this builds your multi-dimensional Decision DNA profile.",
      visual: (
        <div className="py-4 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-spring-500/30 bg-spring-500/10 px-5 py-3">
            <div className="text-2xl font-extrabold font-display text-spring-600 dark:text-spring-400">
              92%
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">Calibration Index</div>
              <div className="text-[10px] text-muted-foreground">Longitudinal Metacognition</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleFinish = (goToNewDecision = false) => {
    completeTour();
    if (goToNewDecision) {
      router.push("/decisions/new");
    }
  };

  const current = slides[currentSlide];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTourModal}
          className="fixed inset-0 bg-plum-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-dock text-foreground z-10 overflow-hidden"
        >
          {/* Subtle Corner Glow */}
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-spring-500/15 blur-2xl pointer-events-none" />

          {/* Close / Skip Button */}
          <button
            onClick={() => handleFinish(false)}
            className="absolute top-5 right-5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip Tour
          </button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === i
                    ? "w-7 bg-spring-500"
                    : i < currentSlide
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Slide Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-plum-100 dark:bg-plum-900/50 px-2.5 py-0.5 text-[11px] font-bold text-primary mb-2">
                  <AnimatedIcon name={current.icon} size={12} />
                  Step {currentSlide + 1} of {slides.length}
                </div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
                  {currentSlide === 0 && user?.name
                    ? `Welcome, ${user.name.split(" ")[0]}!`
                    : current.title}
                </h2>
                <p className="text-xs font-medium text-spring-600 dark:text-spring-400 mt-0.5">
                  {current.subtitle}
                </p>
              </div>

              {/* Visual Metaphor Area */}
              <div className="min-h-[140px] flex items-center justify-center rounded-2xl bg-muted/20 border border-border/60 p-4">
                {current.visual}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              className="text-xs font-medium"
            >
              Back
            </Button>

            {currentSlide < slides.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentSlide((prev) => prev + 1)}
                className="bg-primary text-primary-foreground font-semibold hover:brightness-110 shadow-sm text-xs"
              >
                Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleFinish(true)}
                className="bg-spring-500 text-plum-950 font-bold hover:bg-spring-400 shadow-spring text-xs px-4"
              >
                <Check className="h-3.5 w-3.5 mr-1 stroke-[3]" />
                Record First Decision
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

