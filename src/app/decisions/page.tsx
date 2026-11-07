// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: All Decisions List & Filter View
//
// TODO: [Member D]
// 1. Fetch all decisions from `decisionService.listDecisions()`.
// 2. Provide interactive search and status filter buttons (All, Active, Replayed).
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Decision } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
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

  useEffect(() => {
    async function load() {
      try {
        const res = await decisionService.listDecisions();
        setDecisions(res.data);
      } catch {
        // Fallback demo data
        setDecisions([
          {
            id: "dec-101",
            title: "Switch from EC2 Redis to Upstash Serverless Redis",
            category: "ENGINEERING",
            choice: "Migrate session storage to Upstash",
            context: "DevOps overhead managing Redis updates",
            expectedOutcome: "Zero maintenance hours, < $50/mo cost",
            confidence: 85,
            status: "REPLAYED",
            reviewDate: "2026-10-15T00:00:00.000Z",
            createdAt: "2026-09-01T00:00:00.000Z",
            lockedAt: "2026-09-01T00:00:00.000Z",
            snapshotHash: "e4f8892...",
            assumptions: [],
            alternatives: [],
            preMortems: [],
            events: [],
            outcome: {
              id: "out-101",
              decisionId: "dec-101",
              actualOutcome: "DevOps hours eliminated, bill came out to $42/mo.",
              outcomeScore: 90,
              predictionAccuracy: 92,
              reflection: "Low read latency held over public internet.",
              wouldRepeat: true,
              recordedAt: "2026-10-16T00:00:00.000Z",
            },
          },
          {
            id: "dec-102",
            title: "Implement Turborepo across monorepo packages",
            category: "TOOLING",
            choice: "Adopt Turborepo build caching in CI",
            context: "CI runs taking 22 minutes per commit",
            expectedOutcome: "CI runtime reduced to < 6 minutes",
            confidence: 75,
            status: "LOCKED",
            reviewDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            createdAt: new Date().toISOString(),
            lockedAt: new Date().toISOString(),
            snapshotHash: "a9104f2...",
            assumptions: [],
            alternatives: [],
            preMortems: [],
            events: [],
            outcome: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.choice.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "ALL" ? true : filter === "REPLAYED" ? d.status === "REPLAYED" : d.status !== "REPLAYED";
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

      {/* Decisions List */}
      <div className="space-y-3">
        {filteredDecisions.length === 0 ? (
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
                    {d.outcome?.predictionAccuracy !== undefined && (
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
