"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuthStore } from "@/store/useAuthStore";
import { Sun, Moon } from "lucide-react";

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
      className="relative flex items-center justify-end h-10 w-10 shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanding Capsule on Hover (Unfolds smoothly to the left) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ width: 40, opacity: 0.7 }}
            animate={{ width: 215, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className={`absolute right-0 top-0 h-10 w-[215px] flex items-center justify-between rounded-xl backdrop-blur-2xl z-40 overflow-hidden select-none cursor-pointer transition-colors ${
              isActive
                ? "bg-plum-950/95 dark:bg-[#1f132b]/95 border border-spring-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.2)]"
                : "bg-card/95 dark:bg-[#181122]/95 border border-border/90 hover:border-spring-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.45),0_0_15px_rgba(34,197,94,0.12)]"
            }`}
            onClick={onClick}
          >
            {href ? (
              <Link
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="w-full h-full flex items-center justify-between pl-3.5 pr-0.5 text-foreground"
              >
                {/* Left Label & Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18, delay: 0.04 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <span className="text-xs font-semibold tracking-tight text-foreground truncate">
                    {label}
                  </span>
                  {badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
                        isActive
                          ? "bg-spring-500/20 text-spring-400 border-spring-500/40"
                          : "bg-muted text-muted-foreground border-border/70"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </motion.div>

                {/* Right Icon Anchor */}
                <div className="h-10 w-10 grid place-items-center shrink-0">
                  {icon}
                </div>
              </Link>
            ) : (
              <div className="w-full h-full flex items-center justify-between pl-3.5 pr-0.5 text-foreground">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18, delay: 0.04 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <span className="text-xs font-semibold tracking-tight text-foreground truncate">
                    {label}
                  </span>
                  {badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/70 shrink-0">
                      {badge}
                    </span>
                  )}
                </motion.div>

                <div className="h-10 w-10 grid place-items-center shrink-0">
                  {icon}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle Icon Slot */}
      {href ? (
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={`relative grid h-10 w-10 place-items-center rounded-xl transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-spring-500/15 text-spring-400 border border-spring-500/35 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border/80 border border-transparent"
          }`}
        >
          {isActive && (
            <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-spring-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]" />
          )}
          {icon}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={`relative grid h-10 w-10 place-items-center rounded-xl transition-all duration-200 cursor-pointer ${
            isActive
              ? "bg-spring-500/15 text-spring-400 border border-spring-500/35 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-border/80 border border-transparent"
          }`}
        >
          {isActive && (
            <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-spring-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]" />
          )}
          {icon}
        </button>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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
        className="fixed right-3 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-1.5 p-1.5 rounded-2xl glass-dock shadow-dock border border-border/80 backdrop-blur-2xl"
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
        <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent my-0.5" />

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
                badge={isActive ? "Active" : undefined}
                icon={
                  <AnimatedIcon
                    name={link.icon}
                    size={17}
                    className={isActive ? "text-spring-400" : "text-muted-foreground"}
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
        <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent my-0.5" />

        {/* GitHub Organization Link */}
        <DockItem
          href="https://github.com/Tm-Beta"
          label="Tm-Beta on GitHub"
          badge="↗"
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

        {/* Theme Switcher as Native Dock Item */}
        <DockItem
          label={isDark ? "Dark Theme" : "Light Theme"}
          badge="Switch"
          onClick={toggleTheme}
          icon={
            <div className="relative grid h-8 w-8 place-items-center">
              {isDark ? (
                <Moon className="h-4 w-4 text-spring-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </div>
          }
        />

        {/* User Profile Menu with inDock Support */}
        <UserMenu inDock side="left" />
      </nav>
    </>
  );
}
