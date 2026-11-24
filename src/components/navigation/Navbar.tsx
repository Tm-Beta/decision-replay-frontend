"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: "dashboard" as const },
    { href: "/decisions", label: "Decisions", icon: "history" as const },
    { href: "/dna", label: "Decision DNA", icon: "dna" as const },
  ];

  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-3 sm:px-6">
      <nav className="glass-dock relative flex h-14 items-center justify-between rounded-2xl px-3.5 sm:px-5">
        {/* Left: Brand Identity */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-plum-900 text-cream-50 shadow-soft transition-transform group-hover:scale-105 dark:bg-primary dark:text-plum-950 shrink-0">
            <AnimatedIcon name="compass" size={19} className="text-spring-400 dark:text-plum-950" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-spring-500 ring-2 ring-background" />
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-display text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base whitespace-nowrap">
                Decision Replay
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/70 shrink-0">
                Tm-Beta
              </span>
            </div>
            <span className="hidden text-[10px] font-medium tracking-wider text-muted-foreground uppercase sm:inline-block whitespace-nowrap">
              Prospective Metacognition
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links with animated active pill (Only when authenticated) */}
        {isAuthenticated && (
          <div className="hidden items-center gap-1 sm:flex shrink-0">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
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
        )}

        {/* Right Actions: System Beacon, Theme Switcher & Record CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Calibration Beacon (Only when authenticated) */}
          {isAuthenticated && (
            <div className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground lg:flex shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spring-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-spring-500" />
              </span>
              <span>Calibrated</span>
            </div>
          )}

          {/* GitHub Tm-Beta Link */}
          <a
            href="https://github.com/Tm-Beta"
            target="_blank"
            rel="noopener noreferrer"
            title="Tm-Beta on GitHub"
            className="grid h-9 w-9 place-items-center rounded-xl bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-spring-500/50 hover:bg-muted/60 transition-all shadow-xs shrink-0"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          <div className="shrink-0">
            <ThemeToggle />
          </div>

          <UserMenu />

          {/* Primary CTA Button (Only when authenticated) */}
          {isAuthenticated && (
            <Link href="/decisions/new" className="shrink-0">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-xl bg-spring-500 px-3 py-1.5 text-xs font-bold text-plum-950 shadow-spring transition-shadow hover:bg-spring-400 sm:px-4 sm:py-2 sm:text-xs shrink-0"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Record Decision</span>
                <span className="sm:hidden">New</span>
              </motion.div>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

