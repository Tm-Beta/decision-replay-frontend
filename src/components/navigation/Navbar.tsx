"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Plus } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: "dashboard" as const },
    { href: "/decisions", label: "Decisions", icon: "history" as const },
    { href: "/dna", label: "Decision DNA", icon: "dna" as const },
  ];

  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-5xl px-3 sm:px-6">
      <nav className="glass-dock relative flex h-14 items-center justify-between rounded-2xl px-3.5 sm:px-5">
        {/* Left: Brand Identity */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-plum-900 text-cream-50 shadow-soft transition-transform group-hover:scale-105 dark:bg-primary dark:text-plum-950">
            <AnimatedIcon name="compass" size={19} className="text-spring-400 dark:text-plum-950" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-spring-500 ring-2 ring-background" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
              Decision Replay
            </span>
            <span className="hidden text-[10px] font-medium tracking-wider text-muted-foreground uppercase sm:inline-block">
              Prospective Metacognition
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links with animated active pill */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-xl bg-plum-100/80 dark:bg-plum-900/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <AnimatedIcon
                    name={link.icon}
                    size={15}
                    className={isActive ? "text-primary" : "text-muted-foreground"}
                  />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions: System Beacon, Theme Switcher & Record CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Calibration Beacon */}
          <div className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spring-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-spring-500" />
            </span>
            <span>Calibrated</span>
          </div>

          <ThemeToggle />

          {/* Primary CTA Button */}
          <Link href="/decisions/new">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-xl bg-spring-500 px-3 py-1.5 text-xs font-bold text-plum-950 shadow-spring transition-shadow hover:bg-spring-400 sm:px-4 sm:py-2 sm:text-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Record Decision</span>
              <span className="sm:hidden">New</span>
            </motion.div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
