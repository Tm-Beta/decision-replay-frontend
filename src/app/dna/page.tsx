// FEATURE: Decision DNA Profile & Longitudinal Patterns View

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DecisionDnaProfile, DnaDimension } from "@/types/decision.types";
import { dnaService } from "@/services/dnaService";
import { ApiError } from "@/services/apiClient";
import { DnaRadarChart } from "@/components/dna/DnaRadarChart";
import { MetricEvidenceModal } from "@/components/dna/MetricEvidenceModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";
import { Award, ShieldAlert } from "lucide-react";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { DecisionReplayLoader } from "@/components/ui/DecisionReplayLoader";
import { useAuthStore } from "@/store/useAuthStore";

export default function DecisionDnaPage() {
  const { isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<DecisionDnaProfile | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<DnaDimension | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  if (loading) {
    return <DecisionReplayLoader size="fullscreen" />;
  }

  const lowestDimension =
    profile && profile.totalDecisions > 0 && profile.dimensions.length > 0
      ? profile.dimensions.reduce((lowest, d) => (d.score < lowest.score ? d : lowest))
      : null;

  return (
    <ProtectedGate>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950">
              <AnimatedIcon name="dna" size={17} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Decision DNA Profile
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Longitudinal metacognitive profile derived from empirical prediction accuracy and estimation variance.
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-4 py-2.5 rounded-2xl bg-card border border-border/80 shadow-soft flex items-center gap-2.5">
              <Award className="h-5 w-5 text-spring-500" />
              <div>
                <div className="font-display text-lg font-extrabold leading-none text-foreground">
                  {profile.overallDnaScore}/100
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  DNA Index
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offline / Error Banner */}
      {loadError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
          <p className="text-foreground font-medium">{loadError}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {profile && profile.totalDecisions === 0 && (
        <Card className="text-center py-16 px-6 border-dashed border-border/80 bg-card/60 rounded-3xl shadow-soft">
          <div className="max-w-md mx-auto space-y-3">
            <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-plum-100 dark:bg-plum-900/40 text-primary">
              <AnimatedIcon name="dna" size={24} />
            </div>
            <h3 className="font-display text-base font-bold text-foreground">
              No Replay Data Recorded Yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Decision DNA profile synthesizes calibration, estimation accuracy, risk foresight, and alternative breadth once you record real outcomes on completed decisions.
            </p>
          </div>
        </Card>
      )}

      {/* Radar & Dimension Cards */}
      {profile && profile.totalDecisions > 0 && (
        <DnaRadarChart
          dimensions={profile.dimensions}
          onSelectDimension={(dim) => setSelectedDimension(dim)}
        />
      )}

      {/* Cognitive Calibration Insight */}
      {lowestDimension && (
        <Card className="border-amber-500/30 bg-amber-500/5 p-5 rounded-2xl shadow-soft">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-display font-bold text-amber-900 dark:text-amber-200 text-sm">
                Cognitive Calibration Insight
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Your lowest scoring dimension is{" "}
                <strong className="text-foreground">
                  {lowestDimension.label} ({lowestDimension.score}/100)
                </strong>
                . {lowestDimension.description}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Historical Evidence Modal */}
      {selectedDimension && (
        <MetricEvidenceModal
          dimension={selectedDimension}
          onClose={() => setSelectedDimension(null)}
        />
      )}
    </motion.div>
    </ProtectedGate>
  );
}
