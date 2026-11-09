//Lists only decisions with status LOCKED or REVIEW_PENDING (waiting for an outcome).
//Highlights decisions whose review date has passed with a red "Review Due" badge.
//Links each decision to its replay page (/decisions/[id]/replay) to record the outcome.

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Decision } from "@/types/decision.types";

interface PendingReviewsListProps {
  decisions: Decision[];
}

export function PendingReviewsList({ decisions = [] }: PendingReviewsListProps) {
const pending = decisions.filter((d) => d.status === "LOCKED" || d.status === "REVIEW_PENDING");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">Decisions Awaiting Review</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Close the loop by recording what reality produced.
          </p>
        </div>
        <Badge tone="blue">{pending.length} Pending</Badge>
      </CardHeader>

      <CardContent>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p>All scheduled decisions have been reviewed and replayed!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((d) => {
              const isPastDue = d.reviewDate && new Date(d.reviewDate) <= new Date();

              return (
                <div
                  key={d.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-colors gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm hover:underline cursor-pointer">
                        <Link href={`/decisions/${d.id}`}>{d.title}</Link>
                      </span>
                      {isPastDue && <Badge tone="red">Review Due</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Review: {formatDate(d.reviewDate)}</span>
                      <span>•</span>
                      <span>Confidence: {d.confidence}%</span>
                    </div>
                  </div>

                  <Link href={`/decisions/${d.id}/replay`}>
                    <Button size="sm" variant={isPastDue ? "default" : "outline"}>
                      Record Outcome <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
