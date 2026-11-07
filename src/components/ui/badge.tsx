// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Reusable Badge Component
// ==============================================================================

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "blue" | "green" | "amber" | "violet" | "red";
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  const tones = {
    default: "bg-muted text-muted-foreground border-border",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
    red: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
