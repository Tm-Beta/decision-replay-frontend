"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted ${className}`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 90 : 0,
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="h-4 w-4 text-amber-600" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : -90,
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="h-4 w-4 text-plum-300 dark:text-primary" />
      </motion.div>
    </motion.button>
  );
}
