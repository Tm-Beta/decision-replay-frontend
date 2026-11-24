"use client";
import { BackLink } from "@/components/navigation/BackLink";
import { formatReminder } from "@/lib/utils";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Decision } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
import { ApiError } from "@/services/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { EmptyDecisionsIllustration } from "@/components/illustrations/DecisionIllustrations";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { DecisionReplayLoader } from "@/components/ui/DecisionReplayLoader";
import { useAuthStore } from "@/store/useAuthStore";
import { Search, Plus } from "lucide-react";

export default function DecisionsListPage() {
  const { isAuthenticated } = useAuthStore();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOCKED" | "REPLAYED">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

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
    <ProtectedGate>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
      <BackLink href="/decisions">Collections</BackLink>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            All decisions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            
          </p>
        </div>

        <Link href="/decisions/new">
          <Button className="h-10 rounded-xl bg-spring-500 text-plum-950 font-bold shadow-spring hover:bg-spring-400">
            <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
            New Decision
          </Button>
        </Link>
      </div>

      {/* Search Bar & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by decision title or choice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-card border-border/80 text-xs sm:text-sm shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-xl border border-border/80 bg-card p-1 shadow-sm shrink-0">
          {(["ALL", "LOCKED", "REPLAYED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === tab
                  ? "bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? "All Decisions" : tab === "LOCKED" ? "Awaiting outcome" : "Outcome recorded"}
            </button>
          ))}
        </div>
      </div>

      {/* Error Fallback */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
          <p className="text-foreground font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {/* Decisions List */}
      <div className="space-y-3">
        {loading ? (
          <DecisionReplayLoader size="md" />
        ) : filteredDecisions.length === 0 ? (
          <Card className="border-border/80 bg-card/60 p-8 text-center shadow-soft">
            <EmptyDecisionsIllustration />
            <div className="space-y-2 mt-2">
              <h3 className="font-display text-base font-bold text-foreground">
                No decisions match your search
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {search
                  ? "Try adjusting your search terms or clearing your filter."
                  : "Your decision ledger is clean. Capture your next significant choice before taking action."}
              </p>
              {!search && (
                <div className="pt-3">
                  <Link href="/decisions/new">
                    <Button className="bg-spring-500 text-plum-950 font-bold hover:bg-spring-400">
                      <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
                      Record Your First Decision
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        ) : (
          filteredDecisions.map((d, index) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <Card className="border-border/80 bg-card hover:border-primary/40 hover:shadow-soft transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/decisions/${d.id}`}
                        className="font-display font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {d.title}
                      </Link>
                      {d.status === "REPLAYED" ? (
                        <Badge tone="spring">
                          <AnimatedIcon name="replay" size={11} className="mr-1" /> Outcome recorded
                        </Badge>
                      ) : (
                        <Badge tone="plum">
                          <AnimatedIcon name="lock" size={11} className="mr-1" /> Frozen Snapshot
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      <span className="font-semibold text-foreground/80">Chosen Action:</span> {d.choice}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        Review: {formatReminder(d.nextReminder || d.reviewDate)}
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        Initial Confidence: <span className="text-foreground">{d.confidence==null?"Unspecified":d.confidence+"%"}</span>
                      </span>
                      {typeof d.outcome?.predictionAccuracy === "number" && (
                        <>
                          <span>•</span>
                          <span className="text-spring-600 dark:text-spring-400 font-bold">
                            Accuracy: {d.outcome.predictionAccuracy}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link href={`/decisions/${d.id}`}>
                      <Button variant="outline" size="sm" className="h-9 font-medium text-xs">
                        Snapshot <AnimatedIcon name="arrow-right" size={12} className="ml-1" />
                      </Button>
                    </Link>
                    {d.status !== "REPLAYED" ? (
                      <Link href={`/decisions/${d.id}/replay`}>
                        <Button
                          size="sm"
                          className="h-9 bg-spring-500 text-plum-950 font-bold shadow-sm hover:bg-spring-400 text-xs"
                        >
                          Record Outcome
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/decisions/${d.id}/replay`}>
                        <Button size="sm" variant="secondary" className="h-9 text-xs font-semibold">
                          View Replay
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
    </ProtectedGate>
  );
}
