// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead) & Member D (Full-Stack UI)
// FEATURE: Application Root Layout & Navigation Shell
// ==============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import("./globals.css")
import { Compass, PlusCircle, Dna, LayoutDashboard, History } from "lucide-react";

export const metadata: Metadata = {
  title: "Decision Replay — Prospective Decision Intelligence",
  description: "Capture beliefs before reality happens; learn honestly when outcomes arrive.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
        <div className="flex min-h-screen flex-col">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span className="text-base font-semibold">Decision Replay</span>
                </Link>

                <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <Link href="/" className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700 hover:bg-indigo-100">
                    <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                    Dashboard
                  </Link>

                  <Link href="/decisions" className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-sky-700 hover:bg-sky-100">
                    <History className="h-4 w-4 text-sky-600" />
                    All Decisions
                  </Link>

                  <Link href="/dna" className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-violet-700 hover:bg-violet-100">
                    <Dna className="h-4 w-4 text-violet-600" />
                    Decision DNA
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/decisions/new"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Record Decision</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Viewport Container */}
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>

          {/* Minimalist Footer */}
          <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
            <p>
              Decision Replay • Prospective metacognition and calibration engine • Zero hindsight bias
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
