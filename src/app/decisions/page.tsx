// FEATURE: All Decisions List & Filter View
// Fetches all decisions from `decisionService.listDecisions()`.
// Provides interactive search and status filter buttons (All, Active, Replayed)."Active" means LOCKED or REVIEW_PENDING (waiting for an outcome).
// If the backend is offline, shows an error message with a "Try again" button.

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Decision } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
import { ApiError } from "@/services/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Search, Lock, GitCompare, Calendar, ArrowRight, PlusCircle } from "lucide-react";

export default function DecisionsListPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOCKED" | "REPLAYED">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // limit 200 so the list is never cut short by default paging
      const res = await decisionService.listDecisions({ limit: 200 });
      setDecisions(res.data);
    } catch (err) {
      setDecisions([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong while loading decisions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.choice.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "REPLAYED"
        ? d.status === "REPLAYED"
        : d.status === "LOCKED" || d.status === "REVIEW_PENDING";    
        return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Decisions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit locked snapshots, review append-only timelines, and inspect replayed outcomes.
          </p>
        </div>
        <Link href="/decisions/new">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-1.5" /> New Decision
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search decisions or choices..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(["ALL", "LOCKED", "REPLAYED"] as const).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={filter === mode ? "default" : "outline"}
              className="text-xs h-9"
              onClick={() => setFilter(mode)}
            >
              {mode === "ALL" ? "All Decisions" : mode === "LOCKED" ? "Active / Locked" : "Replayed"}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {/* Decisions List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading decisions...</p>
        ) : error ? null : filteredDecisions.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl text-xs text-muted-foreground">
            No decisions match the current filter.
          </div>
        ) : (
          filteredDecisions.map((d) => (
            <Card key={d.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-base">
                      <Link href={`/decisions/${d.id}`} className="hover:underline">
                        {d.title}
                      </Link>
                    </span>
                    {d.status === "REPLAYED" ? (
                      <Badge tone="green">
                        <GitCompare className="h-3 w-3 mr-1" /> Replayed
                      </Badge>
                    ) : (
                      <Badge tone="violet">
                        <Lock className="h-3 w-3 mr-1" /> Frozen Snapshot
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-2xl line-clamp-1">
                    Choice: {d.choice}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Review: {formatDate(d.reviewDate)}
                    </span>
                    <span>•</span>
                    <span>Confidence: {d.confidence}%</span>
                    {typeof d.outcome?.predictionAccuracy === "number" && (
                        <>
                        <span>•</span>
                        <span className="text-primary font-semibold">
                          Accuracy: {d.outcome.predictionAccuracy}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/decisions/${d.id}`}>
                    <Button variant="outline" size="sm">
                      Snapshot <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                  {d.status !== "REPLAYED" ? (
                    <Link href={`/decisions/${d.id}/replay`}>
                      <Button size="sm">Record Replay</Button>
                    </Link>
                  ) : (
                    <Link href={`/decisions/${d.id}/replay`}>
                      <Button size="sm" variant="secondary">
                        View Replay
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
