// FEATURE: Application Root Layout & Navigation Shell

/**
 * Root Layout (app/layout.tsx)
 *
 * Defines the shell that wraps every page in the Decision Replay app.
 *
 * - Sets the page metadata (title and description) used for SEO and the browser tab.
 * - Loads the global stylesheet (globals.css).
 * - Renders a sticky top navigation bar with the app logo, links to Dashboard,
 *   All Decisions and Decision DNA, and a "Record Decision" call-to-action button.
 * - Renders the active page inside a centered, max-width <main> container
 *   via the `children` prop.
 * - Renders a minimal footer at the bottom of every page.
 */

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Compass, Dna, LayoutDashboard, History } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

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
<html lang="en" className={`light ${display.variable}`}>
<body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
  <div className="flex min-h-screen flex-col">          {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
              <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-2">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <Compass className="h-4 w-4" />
                    </div>
                    <span className="text-base font-semibold">Decision Replay</span>
                  </Link>

                  <nav className="flex items-center gap-1 overflow-x-auto md:gap-4">
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
