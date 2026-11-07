// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead) & Member B
// FEATURE: Combined Immutable Snapshot & Append-Only Timeline Component
//
// TODO: [Member D]
// 1. Render the immutable snapshot card with SHA-256 verification badge.
// 2. Render chronologically ordered append-only timeline events.
// 3. Provide quick inline form to append new evidence notes.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Lock, ShieldCheck, Plus, Clock, MessageSquare } from "lucide-react";
import { Decision, TimelineEvent } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";

interface SnapshotTimelineProps {
  decision: Decision;
  onEventAdded?: (event: TimelineEvent) => void;
}

export function SnapshotTimeline({ decision, onEventAdded }: SnapshotTimelineProps) {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setLoading(true);
    try {
      const newEvent = await decisionService.appendTimelineEvent(decision.id, {
        eventType: "EVIDENCE_NOTE",
        title: "Observation Log",
        detail: noteText.trim(),
      });
      setNoteText("");
      setShowNoteForm(false);
      onEventAdded?.(newEvent);
    } catch (err) {
      console.error("Failed to append note:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Immutable Snapshot Header Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge tone="violet">
                <Lock className="h-3 w-3 mr-1" />
                Snapshot Locked
              </Badge>
              {decision.isVerified !== false && (
                <Badge tone="green">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  SHA-256 Verified
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Hash: {decision.snapshotHash?.slice(0, 16)}...
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl mt-2">{decision.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Locked on {formatDate(decision.lockedAt || decision.createdAt)} • Review date:{" "}
            {formatDate(decision.reviewDate)} • {decision.confidence}% Initial Confidence
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block mb-1">
              Committed Choice
            </span>
            <p className="text-sm font-medium leading-relaxed">{decision.choice}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Trigger & Context
              </span>
              <p className="leading-relaxed text-foreground/80">{decision.decisionReason || decision.context}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Expected Observable Outcome
              </span>
              <p className="leading-relaxed text-foreground/80">{decision.expectedOutcome}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Append-Only Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Append-Only Timeline</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNoteForm(!showNoteForm)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Append Evidence
          </Button>
        </div>

        {showNoteForm && (
          <Card className="p-4 space-y-3 border-dashed border-primary/40 bg-muted/20">
            <label className="text-xs font-semibold block">Record New Signal or Evidence</label>
            <Textarea
              rows={3}
              placeholder="What new data did you observe? This note will be permanently timestamped in the timeline."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowNoteForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddNote} disabled={loading || !noteText.trim()}>
                {loading ? "Appending..." : "Append Note"}
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {decision.events?.map((evt) => (
            <div
              key={evt.id}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card/60 text-xs"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{evt.title}</span>
                  <span className="text-[11px] text-muted-foreground">{formatDate(evt.createdAt)}</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">{evt.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
