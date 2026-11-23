"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { useAuthStore } from "@/store/useAuthStore";
import { Plus, User as UserIcon } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, openAuthModal, openTourModal } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-3 inset-x-3 z-50 sm:hidden">
      <nav className="glass-dock relative flex h-16 items-center justify-around rounded-2xl px-2 shadow-dock border border-border/80">
        {/* Dashboard */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <AnimatedIcon
            name="dashboard"
            size={18}
            className={pathname === "/" ? "text-primary" : "text-muted-foreground"}
          />
          <span>Home</span>
        </Link>

        {/* Decisions */}
        <Link
          href="/decisions"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            pathname.startsWith("/decisions") && pathname !== "/decisions/new"
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <AnimatedIcon
            name="history"
            size={18}
            className={
              pathname.startsWith("/decisions") && pathname !== "/decisions/new"
                ? "text-primary"
                : "text-muted-foreground"
            }
          />
          <span>Decisions</span>
        </Link>

        {/* Center Floating Jewel Button: Record Decision */}
        {isAuthenticated ? (
          <Link href="/decisions/new" className="-mt-6 flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-spring-500 text-plum-950 shadow-spring ring-4 ring-background"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
            </motion.div>
            <span className="mt-1 text-[10px] font-bold text-foreground">Record</span>
          </Link>
        ) : (
          <button
            onClick={openAuthModal}
            className="-mt-6 flex flex-col items-center cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-spring-500 text-plum-950 shadow-spring ring-4 ring-background"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
            </motion.div>
            <span className="mt-1 text-[10px] font-bold text-foreground">Record</span>
          </button>
        )}

        {/* DNA */}
        <Link
          href="/dna"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            pathname.startsWith("/dna") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <AnimatedIcon
            name="dna"
            size={18}
            className={pathname.startsWith("/dna") ? "text-primary" : "text-muted-foreground"}
          />
          <span>DNA</span>
        </Link>

        {/* Profile / Login */}
        <button
          onClick={() => (isAuthenticated ? openTourModal() : openAuthModal())}
          className="flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {isAuthenticated && user?.avatar ? (
            <div className="h-5 w-5 rounded-full overflow-hidden border border-border">
              <img src={user.avatar} alt="User" className="h-full w-full object-cover" />
            </div>
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
          <span>{isAuthenticated ? "Profile" : "Sign In"}</span>
        </button>
      </nav>
    </div>
  );
}
