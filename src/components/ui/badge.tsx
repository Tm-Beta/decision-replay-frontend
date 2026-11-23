import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "blue" | "green" | "amber" | "violet" | "red" | "spring" | "plum";
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  const tones = {
    default: "bg-muted text-muted-foreground border-border",
    spring: "bg-spring-500/15 text-spring-700 dark:text-spring-400 border-spring-500/30 font-bold",
    plum: "bg-plum-100 text-plum-900 dark:bg-plum-900/50 dark:text-primary border-plum-300 dark:border-plum-700 font-semibold",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    green: "bg-spring-500/15 text-spring-700 dark:text-spring-400 border-spring-500/30",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    violet: "bg-plum-100 text-plum-800 dark:bg-plum-900/50 dark:text-primary border-plum-200 dark:border-plum-800",
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
