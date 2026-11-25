"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/services/apiClient";
import { Bell, Sun, Moon } from "lucide-react";

interface DockRowProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
  isExpanded: boolean;
  hoveredRow: string | null;
  setHoveredRow: (id: string | null) => void;
  onClick?: () => void;
  external?: boolean;
}

function DockRow({
  id,
  icon,
  label,
  href,
  isActive = false,
  isExpanded,
  hoveredRow,
  setHoveredRow,
  onClick,
  external = false,
}: DockRowProps) {
  const isHovered = hoveredRow === id;

  const content = (
    <div
      onMouseEnter={() => setHoveredRow(id)}
      onMouseLeave={() => setHoveredRow(null)}
      className={`relative transition-all duration-150 cursor-pointer select-none rounded-xl flex items-center ${
        isExpanded ? "h-10 w-full justify-between px-3" : "h-9 w-9 mx-auto justify-center"
      } ${
        isHovered
          ? isActive
            ? "bg-spring-500/20 text-spring-400 border border-spring-500/50 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
            : "bg-muted/70 text-foreground border border-border/60 shadow-xs"
          : isActive
          ? "text-spring-400 bg-spring-500/15 border border-spring-500/35 shadow-[0_0_10px_rgba(34,197,94,0.12)]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
      }`}
    >
      {/* Left Label (Smoothly reveals when dock is expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span
              className={`font-display text-xs tracking-tight truncate ${
                isActive ? "font-bold text-spring-400" : "font-semibold text-foreground/90"
              }`}
            >
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Icon Anchor */}
      <div className="h-8 w-8 grid place-items-center shrink-0">
        {icon}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="desktop-dock-link w-full flex flex-col items-center"
        title={label}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="w-full flex justify-center text-left" title={label}>
      {content}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setDueCount(0); return; }
    let active = true;
    const loadDue = () => {
      apiClient<unknown[]>("/decisions/due-reviews")
        .then((rows) => { if (active && Array.isArray(rows)) setDueCount(rows.length); })
        .catch(() => {});
    };
    loadDue();
    window.addEventListener("reviews-changed", loadDue);
    window.addEventListener("focus", loadDue);
    return () => {
      active = false;
      window.removeEventListener("reviews-changed", loadDue);
      window.removeEventListener("focus", loadDue);
    };
  }, [isAuthenticated]);

  const dockExpanded = isExpanded || isMenuOpen;

  const navLinks = [
    { href: "/", label: "Home", icon: "dashboard" as const },
    { href: "/decisions", label: "Collections", icon: "history" as const },
    { href: "/dna", label: "Chat", icon: "dna" as const },
  ];

  return (
    <>
      <header className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 py-4">
        <Link href="/" aria-label="Decision Replay home"
          className="col-start-2 inline-flex items-center gap-2 font-display text-sm font-bold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <AnimatedIcon name="compass" size={19} className="text-spring-500" />
          <span>Decision Replay</span>
        </Link>
        <div className="col-start-3 flex items-center justify-self-end gap-1 md:hidden">
          <ThemeToggle />
          <UserMenu side="bottom" />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* DESKTOP TOP-RIGHT CONTROLS FOR PUBLIC / LANDING PAGE (!isAuthenticated)  */}
      {/* Clean top-right header with Theme Switcher & GitHub - No awkward dock!     */}
      {/* ========================================================================= */}
      {!isAuthenticated && (
        <div className="hidden md:flex fixed top-4 sm:top-5 right-4 sm:right-6 z-40 items-center gap-2.5">
          <Link
            href="https://github.com/Tm-Beta"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 grid place-items-center rounded-2xl glass-dock shadow-dock border border-border/80 backdrop-blur-2xl text-muted-foreground hover:text-foreground hover:border-spring-500/40 transition-all duration-200"
            title="Tm-Beta on GitHub"
            aria-label="Tm-Beta on GitHub"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </Link>
          <div className="h-10 w-10 grid place-items-center rounded-2xl glass-dock shadow-dock border border-border/80 backdrop-blur-2xl hover:border-spring-500/40 transition-all duration-200">
            <ThemeToggle className="border-none bg-transparent shadow-none" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERTICAL RIGHT-SIDE FLOATING DOCK (md: & Wide Screens)                    */}
      {/* ONLY rendered when authenticated inside the application                   */}
      {/* ========================================================================= */}
      {isAuthenticated && (
        <motion.nav
          aria-label="Application navigation dock"
          initial={false}
          animate={{ width: dockExpanded ? 220 : 54 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => {
            if (!isMenuOpen) {
              setIsExpanded(false);
              setHoveredRow(null);
            }
          }}
          className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col justify-between items-center px-2 py-3.5 rounded-2xl glass-dock shadow-dock border border-border/80 backdrop-blur-2xl overflow-visible select-none h-[21rem] gap-3"
        >
          {/* Top Navigation Links */}
          <div className="w-full flex flex-col gap-1.5 items-center">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <DockRow
                  key={link.href}
                  id={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive}
                  isExpanded={dockExpanded}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
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
            <DockRow
              id="notifications"
              label={dueCount > 0 ? `Alerts (${dueCount})` : "Alerts"}
              icon={
                <span className="relative inline-flex">
                  <Bell size={17} />
                  {dueCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-background"
                    />
                  )}
                </span>
              }
              isExpanded={dockExpanded}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              href="/notifications"
              isActive={pathname === "/notifications"}
            />
          </div>

          {/* Bottom Utility Controls (Clean Icon-Only Buttons, No Text Expansion) */}
          <div className="w-full flex flex-col gap-1 items-center">
            {/* Separator */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent my-1" />

            <div
              className={`w-full flex ${
                dockExpanded
                  ? "flex-row items-center justify-around px-1 py-1 bg-muted/20 border border-border/40 rounded-xl"
                  : "flex-col items-center gap-1.5"
              }`}
            >
              {/* GitHub Organization Link */}
              <Link
                href="https://github.com/Tm-Beta"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shrink-0"
                title="Tm-Beta on GitHub"
                aria-label="Tm-Beta on GitHub"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </Link>

              {/* Theme Switcher Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="h-9 w-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors shrink-0 cursor-pointer"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Moon className="h-4 w-4 text-spring-400 pointer-events-none" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500 pointer-events-none" />
                )}
              </button>

              {/* User Profile Menu with inDock Support */}
              <UserMenu
                inDock
                side="left"
                onOpenChange={(open) => {
                  setIsMenuOpen(open);
                }}
              />
            </div>
          </div>
        </motion.nav>
      )}
    </>
  );
}
