"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";

export interface BlindSpotItem {
  patternKey: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "POSITIVE" | string;
}

const SEVERITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, POSITIVE: 3 };
const MAX_ALERTS = 3;

export function BlindSpotAlert({ patterns = [] }: { patterns?: BlindSpotItem[] }) {
  const topPatterns = [...patterns]
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2))
    .slice(0, MAX_ALERTS);

  return (
    <Card className="border-border/80 bg-card shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-plum-100 dark:bg-plum-900/60 text-primary">
            <AnimatedIcon name="sparkles" size={15} />
          </div>
          <div>
            <CardTitle className="font-display text-base font-bold text-foreground">
              Reasoning Patterns & Blind Spots
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Empirical cognitive signals detected from your replay logs.
            </p>
          </div>
        </div>
        <Link href="/dna">
          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary hover:bg-muted">
            View DNA <AnimatedIcon name="arrow-right" size={13} className="ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {topPatterns.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground space-y-2">
            <div className="grid h-10 w-10 mx-auto place-items-center rounded-xl bg-plum-50 dark:bg-plum-900/30 text-muted-foreground">
              <AnimatedIcon name="brain" size={20} />
            </div>
            <p className="font-medium text-foreground">No recurring cognitive blind spots detected yet.</p>
            <p className="text-[11px] text-muted-foreground">
              Signals such as Schedule Optimism or Cost Underestimation activate as outcomes arrive.
            </p>
          </div>
        ) : (
          topPatterns.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -1 }}
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                p.severity === "HIGH"
                  ? "border-destructive/30 bg-destructive/5"
                  : p.severity === "POSITIVE"
                  ? "border-spring-500/30 bg-spring-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <AnimatedIcon
                    name={p.severity === "POSITIVE" ? "trending-up" : "alert"}
                    size={14}
                    className={p.severity === "POSITIVE" ? "text-spring-600 dark:text-spring-400" : "text-destructive"}
                  />
                  {p.title}
                </span>
                <Badge
                  tone={
                    p.severity === "HIGH"
                      ? "red"
                      : p.severity === "POSITIVE"
                      ? "spring"
                      : "amber"
                  }
                >
                  {p.severity}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">{p.description}</p>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
