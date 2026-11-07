// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Multi-Step Decision Creation Wizard Page
//
// TODO: [Member B]
// 1. Orchestrate step flow (Step 0: Core, Step 1: Hypotheses & Alternatives, Step 2: Pre-Mortem & Lock).
// 2. Submit payload to `decisionService.createDecision()`.
// 3. Mount real-time AiAnalystSidebar for live Socratic sparring.
// ==============================================================================

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
import { decisionService } from "@/services/decisionService";
import { Lock, ArrowLeft, ArrowRight } from "lucide-react";

export default function NewDecisionWizardPage() {
  const router = useRouter();
  const store = useDecisionDraftStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { title: "The Choice", desc: "Define choice & expected result" },
    { title: "Hypotheses & Trade-Offs", desc: "Assumptions & counter-alternatives" },
    { title: "Pre-Mortem & Lock", desc: "Failure anticipation & calibration" },
  ];

  const handleNext = () => {
    if (store.currentStep === 0) {
      if (!store.title.trim() || !store.choice.trim() || !store.expectedOutcome.trim()) {
        setError("Please complete title, choice, and expected outcome.");
        return;
      }
    }
    setError("");
    store.nextStep();
  };

  const handleFinalSubmit = async () => {
    if (!store.reviewDate) {
      setError("Please pick a review date to schedule the replay.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const created = await decisionService.createDecision({
        title: store.title,
        category: store.category,
        choice: store.choice,
        context: store.context || store.decisionReason || "Prospective context",
        decisionReason: store.decisionReason,
        beliefRationale: store.beliefRationale,
        expectedOutcome: store.expectedOutcome,
        confidence: store.confidence,
        reviewDate: store.reviewDate,
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
      router.push(`/decisions/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record decision.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Progress Stepper */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => (
          <div key={i} className="space-y-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                i <= store.currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
            <p className="text-xs font-semibold text-foreground truncate">
              {i + 1}. {s.title}
            </p>
          </div>
        ))}
      </div>

      {/* Main Layout: Form Steps on Left, Socratic Challenger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-8">
              {store.currentStep === 0 && <CoreDecisionStep />}

              {store.currentStep === 1 && (
                <div className="space-y-8">
                  <AssumptionBuilder />
                  <div className="border-t border-border/80 pt-6">
                    <AlternativesInput />
                  </div>
                </div>
              )}

              {store.currentStep === 2 && <PreMortemStep />}

              {error && (
                <div className="p-3 mt-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                  {error}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={store.currentStep === 0 || submitting}
                  onClick={store.prevStep}
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>

                {store.currentStep < 2 ? (
                  <Button size="sm" onClick={handleNext}>
                    Next Step <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleFinalSubmit} disabled={submitting}>
                    <Lock className="h-4 w-4 mr-1.5" />
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
    </div>
  );
}
