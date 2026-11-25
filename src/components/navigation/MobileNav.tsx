"use client";

import { Bell } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus, User as UserIcon, LogOut, HelpCircle, Shield, Settings } from "lucide-react";
import { launchGoogleSignIn } from "@/lib/googleAuth";
import { getDueReviews, invalidateDueReviews } from "@/lib/dueReviewsCache";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal, openTourModal, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) { setDueCount(0); return; }
    let active = true;
    const uid = user.id;
    const loadDue = (force = false) => {
      getDueReviews(uid, force)
        .then((rows) => { if (active) setDueCount(rows.length); })
        .catch(() => {});
    };
    const handleChanged = () => {
      invalidateDueReviews();
      loadDue(true);
    };
    const handleFocus = () => loadDue(false);
    loadDue(false);
    window.addEventListener("reviews-changed", handleChanged);
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      window.removeEventListener("reviews-changed", handleChanged);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const handleProfileClick = () => {
    if (isAuthenticated && user) {
      setProfileOpen((prev) => !prev);
    } else {
      launchGoogleSignIn();
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    router.push("/");
  };

  const isHomeActive = pathname === "/";
  const isDecisionsActive = pathname.startsWith("/decisions") && pathname !== "/decisions/new";
  const isDnaActive = pathname.startsWith("/dna");

  return (
    <div className="fixed bottom-3 inset-x-3 z-50 md:hidden">
      <nav className="glass-dock relative flex h-16 items-center justify-around rounded-2xl px-2 shadow-dock border border-border/80 backdrop-blur-2xl">
        {/* Dashboard */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] transition-colors ${
            isHomeActive ? "text-spring-400 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AnimatedIcon
            name="dashboard"
            size={18}
            className={isHomeActive ? "text-spring-400" : "text-muted-foreground"}
          />
          <span>Home</span>
          {isHomeActive && <span className="h-1 w-1 rounded-full bg-spring-400" />}
        </Link>

        {/* Decisions */}
        <Link
          href="/decisions"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] transition-colors ${
            isDecisionsActive ? "text-spring-400 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AnimatedIcon
            name="history"
            size={18}
            className={isDecisionsActive ? "text-spring-400" : "text-muted-foreground"}
          />
          <span>Collections</span>
          {isDecisionsActive && <span className="h-1 w-1 rounded-full bg-spring-400" />}
        </Link>

        {/* Center Floating Jewel Button: Record Decision */}
        {isAuthenticated ? (
          <Link href="/decisions/new" className="-mt-6 flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-spring-500 text-plum-950 shadow-[0_0_15px_rgba(34,197,94,0.35)] ring-4 ring-background"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
            </motion.div>
            <span className="mt-1 text-[10px] font-bold text-foreground">New</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="-mt-6 flex flex-col items-center cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-spring-500 text-plum-950 shadow-[0_0_15px_rgba(34,197,94,0.35)] ring-4 ring-background"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
            </motion.div>
            <span className="mt-1 text-[10px] font-bold text-foreground">New</span>
          </button>
        )}

        {/* DNA */}
        <Link
          href="/dna"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] transition-colors ${
            isDnaActive ? "text-spring-400 font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AnimatedIcon
            name="dna"
            size={18}
            className={isDnaActive ? "text-spring-400" : "text-muted-foreground"}
          />
          <span>Chat</span>
          {isDnaActive && <span className="h-1 w-1 rounded-full bg-spring-400" />}
        </Link>

        {isAuthenticated && (
          <Link
            href="/notifications"
            aria-label={dueCount > 0 ? `Alerts (${dueCount} due)` : "Alerts"}
            aria-current={pathname === "/notifications" ? "page" : undefined}
            className={`relative flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] transition-colors ${
              pathname === "/notifications" ? "text-spring-400 font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="relative inline-flex">
              <Bell size={18} />
              {dueCount > 0 && (
                <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-background" />
              )}
            </span>
            <span>Alerts</span>
            {pathname === "/notifications" && <span className="h-1 w-1 rounded-full bg-spring-400" />}
          </Link>
        )}

        {/* Profile / Menu Button with Popup */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={handleProfileClick}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 text-[10px] transition-colors ${
              profileOpen ? "text-spring-400 font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAuthenticated && user?.avatar ? (
              <div
                className={`h-5 w-5 rounded-full overflow-hidden border transition-all ${
                  profileOpen ? "border-spring-400 ring-2 ring-spring-500/30" : "border-border"
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
            <span>Profile</span>
            {profileOpen && <span className="h-1 w-1 rounded-full bg-spring-400" />}
          </button>

          {/* Mobile Profile Dropdown Popup (Opens upwards above bottom nav) */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-3 w-64 rounded-2xl border border-border/80 bg-card p-2 shadow-dock z-50 text-foreground backdrop-blur-2xl"
              >
                {/* User Info Header with Avatar */}
                <div className="p-2.5 border-b border-border/60 mb-1 flex items-center gap-2.5">
                  <div className="relative h-9 w-9 rounded-full overflow-hidden bg-plum-100 dark:bg-plum-900/60 text-primary font-bold text-xs grid place-items-center ring-1 ring-border/80 shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "User"}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-xs text-plum-950 dark:text-cream-50 select-none">
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : "CA"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-xs font-bold text-foreground truncate">
                      {user?.name || "User"}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate font-mono">
                      {user?.email || ""}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-spring-500/15 px-2 py-0.5 text-[9px] font-bold text-spring-400 border border-spring-500/30">
                      <Shield className="h-2.5 w-2.5" />
                      Verified Google ID
                    </div>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <Settings className="h-3.5 w-3.5 text-spring-400" />
                    <span>Settings & Character</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      openTourModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Take Product Tour</span>
                  </button>

                  <button
                    type="button"
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
      </nav>
    </div>
  );
}
