"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { formatDate } from "@/lib/utils";
import { Decision } from "@/types/decision.types";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface PendingReviewsListProps {
  decisions: Decision[];
}

export function PendingReviewsList({ decisions = [] }: PendingReviewsListProps) {
  const pending = decisions.filter(
    (d) => d.status === "LOCKED" || d.status === "REVIEW_PENDING"
  );

  return (
    <Card className="border-border/80 bg-card shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="font-display text-base font-bold text-foreground">
            Decisions Awaiting Review
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Close the prospective loop by recording real outcomes.
          </p>
        </div>
        <Badge tone="plum">{pending.length} Pending</Badge>
      </CardHeader>

      <CardContent>
        {pending.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground space-y-2">
            <div className="grid h-10 w-10 mx-auto place-items-center rounded-xl bg-spring-500/10 text-spring-600 dark:text-spring-400">
              <AnimatedIcon name="check-circle" size={20} />
            </div>
            <p className="font-medium text-foreground">All clear — no pending reviews!</p>
            <p className="text-[11px] text-muted-foreground">
              New decisions with future review dates will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((d) => {
              const isPastDue = d.reviewDate && new Date(d.reviewDate) <= new Date();

              return (
                <motion.div
                  key={d.id}
                  whileHover={{ y: -1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/60 hover:border-primary/40 hover:bg-muted/30 transition-all gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/decisions/${d.id}`}
                        className="font-display font-semibold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {d.title}
                      </Link>
                      {isPastDue && <Badge tone="spring">Review Due</Badge>}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        Due: {formatDate(d.reviewDate)}
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        Confidence: <span className="text-foreground">{d.confidence}%</span>
                      </span>
                    </div>
                  </div>

                  <Link href={`/decisions/${d.id}/replay`}>
                    <Button
                      size="sm"
                      className={
                        isPastDue
                          ? "bg-spring-500 text-plum-950 hover:bg-spring-400 font-bold shadow-sm"
                          : "border-border text-foreground hover:bg-muted font-medium"
                      }
                      variant={isPastDue ? "default" : "outline"}
                    >
                      <span>Record Outcome</span>
                      <AnimatedIcon name="arrow-right" size={13} className="ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
