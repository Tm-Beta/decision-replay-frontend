"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { CoreDecisionStep } from "@/components/decision-form/CoreDecisionStep";
import { AssumptionBuilder } from "@/components/decision-form/AssumptionBuilder";
import { AlternativesInput } from "@/components/decision-form/AlternativesInput";
import { PreMortemStep } from "@/components/decision-form/PreMortemStep";
import { AiAnalystSidebar } from "@/components/decision-form/AiAnalystSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { decisionService } from "@/services/decisionService";
import { validateTitle, validateChoice, validateExpectedOutcome, validateReviewDate } from "@/lib/validation";
import { motion, AnimatePresence } from "framer-motion";

export default function NewDecisionWizardPage() {
  const router = useRouter();
  const store = useDecisionDraftStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const steps = [
    { title: "Core Choice", desc: "Hypothesis & expected outcome", icon: "target" as const },
    { title: "Reasoning", desc: "Assumptions & alternatives", icon: "layers" as const },
    { title: "Look Ahead", desc: "Pre-mortem & calibration", icon: "shield" as const },
  ];

  const handleNext = () => {
    if (store.currentStep === 0) {
      if (
        validateTitle(store.title) ||
        validateChoice(store.choice) ||
        validateExpectedOutcome(store.expectedOutcome)
      ) {
        setShowErrors(true);
        setError("Please fill out the highlighted required fields.");
        return;
      }
    }
    setShowErrors(false);
    setError("");
    store.nextStep();
  };

  const handleFinalSubmit = async () => {
    const dateError = validateReviewDate(store.reviewDate);
    if (dateError) {
      setError(dateError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const decision = await decisionService.createDecision({
        title: store.title,
        category: store.category || "GENERAL",
        choice: store.choice,
        context: store.context || "Direct prospective entry",
        decisionReason: store.decisionReason,
        beliefRationale: store.beliefRationale,
        expectedOutcome: store.expectedOutcome,
        confidence: store.confidence,
        reviewDate: store.reviewDate ? new Date(store.reviewDate).toISOString() : undefined,
        assumptions: store.assumptions.map((a) => ({
          statement: a.statement,
          metricTarget: a.metricTarget,
          confidence: a.confidence,
        })),
        alternatives: store.alternatives.map((alt) => ({
          title: alt.title,
          pros: alt.pros,
          cons: alt.cons,
        })),
        preMortems: store.preMortems.map((pm) => ({
          failureScenario: pm.failureScenario,
          preventiveAction: pm.preventiveAction,
          severityScore: pm.severityScore,
        })),
      });

      store.resetDraft();
      router.push(`/decisions/${decision.id}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to freeze decision snapshot. Check backend server."
      );
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Wizard Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Commit Prospective Decision
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Lock your core reasoning and confidence into an immutable snapshot before action begins.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map((s, index) => {
          const isActive = store.currentStep === index;
          const isDone = store.currentStep > index;

          return (
            <div
              key={s.title}
              className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                isActive
                  ? "border-primary bg-card shadow-soft ring-2 ring-primary/20"
                  : isDone
                  ? "border-spring-500/40 bg-spring-500/5"
                  : "border-border/60 bg-card/40 opacity-70"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-lg text-xs font-bold ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-spring-500 text-plum-950 font-extrabold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                <span className="font-display text-xs sm:text-sm font-bold text-foreground truncate">
                  {s.title}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Layout: Form Steps on Left, Socratic Challenger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <Card className="border-border/80 bg-card shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={store.currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {store.currentStep === 0 && <CoreDecisionStep showErrors={showErrors} />}
                  {store.currentStep === 1 && (
                    <div className="space-y-8">
                      <AssumptionBuilder />
                      <div className="border-t border-border/80 pt-6">
                        <AlternativesInput />
                      </div>
                    </div>
                  )}
                  {store.currentStep === 2 && <PreMortemStep />}
                </motion.div>
              </AnimatePresence>

              {error && (
                <div className="p-3.5 mt-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
                  {error}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/80">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={store.currentStep === 0 || submitting}
                  onClick={store.prevStep}
                  className="font-medium text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </Button>

                {store.currentStep < 2 ? (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-primary text-primary-foreground font-semibold hover:brightness-110 shadow-sm"
                  >
                    Continue <AnimatedIcon name="arrow-right" size={13} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleFinalSubmit}
                    disabled={submitting}
                    className="bg-spring-500 text-plum-950 font-bold hover:bg-spring-400 shadow-spring px-5"
                  >
                    <AnimatedIcon name="lock" size={13} className="mr-1.5" />
                    {submitting ? "Freezing Snapshot..." : "Lock Decision Snapshot"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Challenger Sidebar */}
        <AiAnalystSidebar />
      </div>
    </motion.div>
  );
}
