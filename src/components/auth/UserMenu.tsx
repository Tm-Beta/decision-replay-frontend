"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, HelpCircle, Shield, ChevronDown } from "lucide-react";
import { launchGoogleSignIn } from "@/lib/googleAuth";

interface UserMenuProps {
  side?: "bottom" | "left";
  inDock?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserMenu({
  side = "bottom",
  inDock = false,
  onOpenChange,
}: UserMenuProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, logout, openTourModal } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenChange]);

  if (!mounted || !isHydrated) {
    return (
      <div className={inDock ? "h-9 w-9 rounded-xl bg-muted/40 animate-pulse" : "h-9 w-20 rounded-xl bg-muted/40 animate-pulse"} />
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CA";

  const handleToggle = () => {
    if (isAuthenticated && user) {
      const next = !open;
      setOpen(next);
      onOpenChange?.(next);
    } else {
      launchGoogleSignIn();
    }
  };

  const handleLogout = () => {
    setOpen(false);
    onOpenChange?.(false);
    logout();
    router.push("/");
  };

  // Render for Vertical Right-Side Dock (Clean icon button, no text expansion, left-aligned dropdown)
  if (inDock) {
    return (
      <div className="shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={handleToggle}
          className={`h-9 w-9 grid place-items-center rounded-xl transition-all duration-150 cursor-pointer ${
            open
              ? "bg-spring-500/15 text-spring-400 border border-spring-500/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
          aria-label="User profile"
        >
          {isAuthenticated && user ? (
            <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-plum-100 dark:bg-plum-900/60 text-primary font-bold text-xs grid place-items-center ring-1 ring-border/80">
              {user.avatar && !imgError ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="font-bold text-[11px] text-primary dark:text-primary-foreground select-none">
                  {initials}
                </span>
              )}
            </div>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
        </button>

        {/* Profile Dropdown Menu (Opens towards the left into view) */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-full bottom-0 mr-3.5 w-64 rounded-2xl border border-border/80 bg-card p-2 shadow-dock z-50 text-foreground backdrop-blur-2xl"
            >
              {/* User Info Header */}
              <div className="p-2.5 border-b border-border/60 mb-1">
                <div className="font-display text-xs font-bold text-foreground truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-[11px] text-muted-foreground truncate font-mono">
                  {user?.email || ""}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-spring-500/15 px-2 py-0.5 text-[10px] font-bold text-spring-700 dark:text-spring-400">
                  <Shield className="h-3 w-3" />
                  Verified Google ID
                </div>
              </div>

              {/* Menu Options */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenChange?.(false);
                    openTourModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  <span>Take Product Tour</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile / Top Bar Render
  if (!isAuthenticated || !user) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => launchGoogleSignIn()}
        className="flex items-center gap-2 h-9 px-3.5 rounded-xl border border-border/90 bg-card hover:border-spring-500 hover:bg-muted font-semibold text-xs text-foreground shadow-sm transition-all cursor-pointer shrink-0"
      >
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="whitespace-nowrap">Sign In</span>
      </motion.button>
    );
  }

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 px-2 py-1 rounded-xl border border-border/80 bg-card hover:border-primary/40 text-foreground shadow-sm transition-all cursor-pointer"
        aria-label="User profile"
      >
        <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-plum-100 dark:bg-plum-900/60 text-primary font-bold text-xs grid place-items-center shrink-0">
          {user.avatar && !imgError ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="font-bold text-[11px] text-primary dark:text-primary-foreground select-none">
              {initials}
            </span>
          )}
        </div>
        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
      </motion.button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, ...(side === "left" ? { x: 10 } : { y: 8 }) }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, ...(side === "left" ? { x: 10 } : { y: 8 }) }}
            transition={{ duration: 0.15 }}
            className={`absolute w-64 rounded-2xl border border-border/80 bg-card p-2 shadow-dock z-50 text-foreground ${
              side === "left" ? "right-full bottom-0 mr-3.5" : "right-0 mt-2"
            }`}
          >
            {/* User Info Header */}
            <div className="p-2.5 border-b border-border/60 mb-1">
              <div className="font-display text-xs font-bold text-foreground truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-muted-foreground truncate font-mono">
                {user.email}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-spring-500/15 px-2 py-0.5 text-[10px] font-bold text-spring-700 dark:text-spring-400">
                <Shield className="h-3 w-3" />
                Verified Google ID
              </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setOpen(false);
                  openTourModal();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
              >
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                <span>Take Product Tour</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

