// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Reusable Slider & Progress Indicators
// ==============================================================================

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: string | number;
}

export function Slider({ className, label, valueDisplay, ...props }: SliderProps) {
  return (
    <div className="w-full space-y-2">
      {(label || valueDisplay !== undefined) && (
        <div className="flex justify-between text-xs font-medium text-muted-foreground sm:text-sm">
          <span>{label}</span>
          <span className="font-semibold text-foreground">{valueDisplay}</span>
        </div>
      )}
      <input
        type="range"
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Progress({
  value = 0,
  max = 100,
  className,
}: {
  value?: number;
  max?: number;
  className?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
