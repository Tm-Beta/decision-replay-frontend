"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { Plus } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const mobileLinks = [
    { href: "/", label: "Home", icon: "dashboard" as const },
    { href: "/decisions", label: "Decisions", icon: "history" as const },
    { href: "/dna", label: "DNA", icon: "dna" as const },
  ];

  return (
    <div className="fixed bottom-3 inset-x-3 z-50 sm:hidden">
      <nav className="glass-dock relative flex h-16 items-center justify-around rounded-2xl px-2 shadow-dock border border-border/80">
        {/* Left Links */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-colors ${
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <AnimatedIcon
            name="dashboard"
            size={18}
            className={pathname === "/" ? "text-primary" : "text-muted-foreground"}
          />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/decisions"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-colors ${
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

        {/* Right Links */}
        <Link
          href="/dna"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-colors ${
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
      </nav>
    </div>
  );
}
