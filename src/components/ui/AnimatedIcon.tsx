"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import {
  Compass,
  Dna,
  LayoutDashboard,
  History,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  PlayCircle,
  Repeat,
  Plus,
  Check,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

export type AnimatedIconName =
  | "compass"
  | "dna"
  | "dashboard"
  | "history"
  | "shield"
  | "shield-alert"
  | "sparkles"
  | "target"
  | "replay"
  | "repeat"
  | "plus"
  | "check"
  | "check-circle"
  | "alert"
  | "lock"
  | "arrow-right"
  | "trending-up"
  | "brain"
  | "layers"
  | "search"
  | "external-link"
  | "chevron-right";

const iconMap: Record<AnimatedIconName, LucideIcon> = {
  compass: Compass,
  dna: Dna,
  dashboard: LayoutDashboard,
  history: History,
  shield: Shield,
  "shield-alert": ShieldAlert,
  sparkles: Sparkles,
  target: Target,
  replay: PlayCircle,
  repeat: Repeat,
  plus: Plus,
  check: Check,
  "check-circle": CheckCircle,
  alert: AlertTriangle,
  lock: Lock,
  "arrow-right": ArrowRight,
  "trending-up": TrendingUp,
  brain: Brain,
  layers: Layers,
  search: Search,
  "external-link": ExternalLink,
  "chevron-right": ChevronRight,
};

interface AnimatedIconProps {
  name: AnimatedIconName;
  className?: string;
  size?: number;
  glow?: boolean;
  pulse?: boolean;
  interactive?: boolean;
}

export function AnimatedIcon({
  name,
  className = "",
  size = 18,
  glow = false,
  pulse = false,
  interactive = true,
}: AnimatedIconProps) {
  const IconComponent = iconMap[name] || Compass;

  const motionProps: HTMLMotionProps<"div"> = interactive
    ? {
        whileHover: {
          scale: 1.15,
          rotate: name === "compass" ? 45 : name === "replay" ? 180 : name === "plus" ? 90 : 0,
          transition: { type: "spring", stiffness: 400, damping: 15 },
        },
        whileTap: { scale: 0.9 },
      }
    : {};

  return (
    <motion.div
      {...motionProps}
      animate={
        pulse
          ? {
              scale: [1, 1.08, 1],
              opacity: [0.9, 1, 0.9],
              transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            }
          : undefined
      }
      className={`relative inline-flex items-center justify-center shrink-0 ${glow ? "drop-shadow-[0_0_8px_rgba(0,210,127,0.5)]" : ""}`}
    >
      <IconComponent size={size} className={className} />
    </motion.div>
  );
}

/**
 * Universal wrapper for any arbitrary Lucide icon with spring physics
 */
export function MotionIcon({
  icon: Icon,
  className = "",
  size = 18,
  glow = false,
  ...props
}: {
  icon: LucideIcon;
  className?: string;
  size?: number;
  glow?: boolean;
} & LucideProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, transition: { type: "spring", stiffness: 400, damping: 15 } }}
      whileTap={{ scale: 0.9 }}
      className={`inline-flex items-center justify-center shrink-0 ${glow ? "drop-shadow-[0_0_8px_rgba(0,210,127,0.5)]" : ""}`}
    >
      <Icon size={size} className={className} {...props} />
    </motion.div>
  );
}

