// FEATURE: Decision DNA Profile & Longitudinal Patterns View
//Fetches the Decision DNA profile from `dnaService.getProfile()`.
//Renders DnaRadarChart with the 6 dimensions (Calibration, Prediction Accuracy, Rigor, Risk Foresight, Estimation, Breadth), or an empty-state message when no decision has been replayed yet.
//Passes the dimension the user clicks to MetricEvidenceModal, which shows the historical decisions behind that score.
//If the backend is offline, shows an error message with a "Try again" button instead of fake data.

"use client";

import React, { useCallback, useEffect, useState } from "react";import { DecisionDnaProfile, DnaDimension } from "@/types/decision.types";
import { dnaService } from "@/services/dnaService";
import { ApiError } from "@/services/apiClient";
import { DnaRadarChart } from "@/components/dna/DnaRadarChart";
import { MetricEvidenceModal } from "@/components/dna/MetricEvidenceModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dna, ShieldAlert, Award } from "lucide-react";

export default function DecisionDnaPage() {
  const [profile, setProfile] = useState<DecisionDnaProfile | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<DnaDimension | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await dnaService.getProfile();
      setProfile(res);
    } catch (err) {
      setProfile(null);
      setLoadError(
        err instanceof ApiError ? err.message : "Something went wrong while loading your Decision DNA."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground">
        Loading Decision DNA Profile...
      </div>
    );
  }

  // to find weakest dimension, only when there is real data behind scores.
  const lowestDimension =
    profile && profile.totalDecisions > 0 && profile.dimensions.length > 0
      ? profile.dimensions.reduce((lowest, d) => (d.score < lowest.score ? d : lowest))
      : null;

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

      {/* Offline / error fallback */}
      {loadError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground">{loadError}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty state: nothing replayed yet */}
      {profile && profile.totalDecisions === 0 && (
        <div className="text-center py-12 border border-dashed rounded-2xl text-xs text-muted-foreground">
          No replayed decisions yet. Record an outcome on a decision to build your Decision DNA.
        </div>
      )}

      {/* Radar & Dimension Grid */}
      {profile && profile.totalDecisions > 0 && (
        <DnaRadarChart
          dimensions={profile.dimensions}
          onSelectDimension={(dim) => setSelectedDimension(dim)}
        />
      )}

      {/* Cognitive Blind Spot Insight (built from the real lowest score) */}
      {lowestDimension && (
        <Card className="border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                Cognitive Calibration Insight
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Your lowest scoring dimension is{" "}
                <strong>
                  {lowestDimension.label} ({lowestDimension.score}/100)
                </strong>
                . {lowestDimension.description}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Evidence Audit Modal */}
      <MetricEvidenceModal
        dimension={selectedDimension}
        onClose={() => setSelectedDimension(null)}
      />
    </div>
  );
}
