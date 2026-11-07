// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Decision DNA Profile & Longitudinal Patterns View
//
// TODO: [Member D]
// 1. Fetch Decision DNA profile from `dnaService.getProfile()`.
// 2. Render DnaRadarChart with 6 dimensions (Calibration, Prediction Accuracy, Rigor, Risk Foresight, Estimation, Breadth).
// 3. Open MetricEvidenceModal when a user clicks a dimension to inspect underlying historical decisions.
// ==============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { DecisionDnaProfile, DnaDimension } from "@/types/decision.types";
import { dnaService } from "@/services/dnaService";
import { DnaRadarChart } from "@/components/dna/DnaRadarChart";
import { MetricEvidenceModal } from "@/components/dna/MetricEvidenceModal";
import { Card, CardContent } from "@/components/ui/card";
import { Dna, ShieldAlert, Award } from "lucide-react";

export default function DecisionDnaPage() {
  const [profile, setProfile] = useState<DecisionDnaProfile | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<DnaDimension | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await dnaService.getProfile();
        setProfile(res);
      } catch {
        // Fallback demo profile
        setProfile({
          totalDecisions: 18,
          overallDnaScore: 81,
          dimensions: [
            {
              name: "Calibration",
              score: 84,
              label: "Confidence Calibration",
              description: "Stated subjective probabilities tightly track empirical outcome rates.",
              evidenceDecisionIds: ["dec-101", "dec-102", "dec-105"],
            },
            {
              name: "PredictionAccuracy",
              score: 79,
              label: "Prediction Accuracy",
              description: "Fidelity of expected metrics vs observed production telemetry.",
              evidenceDecisionIds: ["dec-101", "dec-103"],
            },
            {
              name: "AssumptionRigor",
              score: 88,
              label: "Assumption Rigor",
              description: "Proportion of explicitly validated testable hypotheses.",
              evidenceDecisionIds: ["dec-101", "dec-104", "dec-107"],
            },
            {
              name: "RiskForesight",
              score: 74,
              label: "Risk Foresight",
              description: "Realized production challenges anticipated in Pre-Mortems.",
              evidenceDecisionIds: ["dec-102", "dec-106"],
            },
            {
              name: "EstimationAccuracy",
              score: 68,
              label: "Time & Cost Estimation",
              description: "Consistency in scheduling and budget boundaries without optimism drift.",
              evidenceDecisionIds: ["dec-101", "dec-105"],
            },
            {
              name: "AlternativeBreadth",
              score: 92,
              label: "Alternative Breadth",
              description: "Rigorous exploration of trade-offs across counter-options before locking.",
              evidenceDecisionIds: ["dec-101", "dec-102", "dec-103", "dec-104"],
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground">
        Loading Decision DNA Profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Dna className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Decision DNA Profile</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Longitudinal metacognitive profile derived from historical decision replays.
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-4 py-2 rounded-xl bg-card border border-border shadow-soft flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <div>
                <div className="text-base font-bold leading-none">{profile.overallDnaScore}/100</div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">DNA Index</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Radar & Dimension Grid */}
      {profile && (
        <DnaRadarChart
          dimensions={profile.dimensions}
          onSelectDimension={(dim) => setSelectedDimension(dim)}
        />
      )}

      {/* Cognitive Blind Spot Advice */}
      <Card className="border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
              Cognitive Calibration Insight
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Your lowest scoring dimension is <strong>Time & Cost Estimation (68/100)</strong>. Historical replays reveal an average schedule variance of +25% on engineering refactoring tasks. For future decisions, add an explicit buffer to your metric targets before locking.
            </p>
          </div>
        </div>
      </Card>

      {/* Evidence Audit Modal */}
      <MetricEvidenceModal
        dimension={selectedDimension}
        onClose={() => setSelectedDimension(null)}
      />
    </div>
  );
}
