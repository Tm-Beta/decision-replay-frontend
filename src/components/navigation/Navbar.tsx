"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuthStore } from "@/store/useAuthStore";

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  external?: boolean;
}

function DockItem({
  icon,
  label,
  badge,
  href,
  isActive = false,
  onClick,
  external = false,
}: DockItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanding Text Pill (Unfolds smoothly to the left on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="absolute right-full mr-3.5 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/90 text-foreground text-xs font-semibold shadow-dock backdrop-blur-2xl whitespace-nowrap pointer-events-none"
          >
            <span>{label}</span>
            {badge && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/70">
                {badge}
              </span>
            )}
            {/* Directional Notch pointing to the dock icon */}
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-card border-r border-t border-border/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock Icon Button or Link */}
      {href ? (
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={`relative grid h-10 w-10 place-items-center rounded-xl transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-plum-100 dark:bg-plum-900/60 text-primary border border-primary/30 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border/80 border border-transparent"
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="activeDockPill"
              className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-spring-500 shadow-spring"
            />
          )}
          {icon}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={`relative grid h-10 w-10 place-items-center rounded-xl transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-plum-100 dark:bg-plum-900/60 text-primary border border-primary/30 shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border/80 border border-transparent"
          }`}
        >
          {icon}
        </button>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: "dashboard" as const },
    { href: "/decisions", label: "Decisions Archive", icon: "history" as const },
    { href: "/dna", label: "Decision DNA Profile", icon: "dna" as const },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE TOP HEADER BAR (< md)                                              */}
      {/* ========================================================================= */}
      <header className="flex md:hidden sticky top-0 z-40 items-center justify-between px-4 py-2.5 bg-card/85 backdrop-blur-xl border-b border-border/60 shadow-xs">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950 shadow-soft">
            <AnimatedIcon name="compass" size={16} className="text-spring-400 dark:text-plum-950" />
          </div>
          <span className="font-display text-sm font-bold text-foreground">Decision Replay</span>
          <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-muted text-muted-foreground border border-border/70">
            Tm-Beta
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu side="bottom" />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VERTICAL RIGHT-SIDE FLOATING DOCK (md: & Wide Screens)                    */}
      {/* ========================================================================= */}
      <nav
        aria-label="Application navigation dock"
        className="fixed right-3 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-2 p-2 rounded-2xl glass-dock shadow-dock border border-border/80 backdrop-blur-2xl"
      >
        {/* Brand Anchor */}
        <DockItem
          href="/"
          label="Decision Replay"
          badge="Tm-Beta"
          icon={
            <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-plum-900 text-cream-50 shadow-soft dark:bg-primary dark:text-plum-950">
              <AnimatedIcon name="compass" size={17} className="text-spring-400 dark:text-plum-950" />
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-spring-500 ring-2 ring-background" />
            </div>
          }
        />

        {/* Separator */}
        <div className="w-6 h-[1px] bg-border/60 my-0.5" />

        {/* Primary Navigation Links (Only when authenticated) */}
        {isAuthenticated &&
          navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <DockItem
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={isActive}
                icon={
                  <AnimatedIcon
                    name={link.icon}
                    size={17}
                    className={isActive ? "text-primary" : "text-muted-foreground"}
                  />
                }
              />
            );
          })}

        {/* Calibration Beacon (Only when authenticated) */}
        {isAuthenticated && (
          <DockItem
            label="Metacognitive Calibration"
            badge="Active"
            icon={
              <div className="grid h-8 w-8 place-items-center rounded-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spring-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-spring-500" />
                </span>
              </div>
            }
          />
        )}

        {/* Separator */}
        <div className="w-6 h-[1px] bg-border/60 my-0.5" />

        {/* GitHub Organization Link */}
        <DockItem
          href="https://github.com/Tm-Beta"
          label="Tm-Beta on GitHub"
          badge="External"
          external
          icon={
            <svg className="h-4 w-4 fill-current text-muted-foreground hover:text-foreground transition-colors" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          }
        />

        {/* Theme Switcher */}
        <div className="relative flex items-center justify-center">
          <ThemeToggle />
        </div>

        {/* User Profile Menu (Opens dropdown towards the left into view) */}
        <div className="relative flex items-center justify-center">
          <UserMenu side="left" />
        </div>
      </nav>
    </>
  );
}
