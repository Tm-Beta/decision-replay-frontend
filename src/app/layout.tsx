// FEATURE: Application Root Layout & Navigation Shell

import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar } from "@/components/navigation/Navbar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { AuthModal } from "@/components/auth/AuthModal";
import { WelcomeTourModal } from "@/components/onboarding/WelcomeTourModal";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Decision Replay — Prospective Decision Intelligence & Metacognition",
  description:
    "Capture beliefs before reality happens; learn honestly when the outcome arrives. Zero hindsight bias.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={displayFont.variable}
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30 selection:text-foreground">
        <ThemeProvider>
          {/* Cinematic Ambient Background Lighting */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-plum-800/5 dark:bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute top-1/3 -right-40 w-[450px] h-[300px] bg-spring-500/5 blur-[100px] rounded-full" />
            <div className="absolute bottom-10 -left-40 w-[500px] h-[300px] bg-plum-500/5 blur-[120px] rounded-full" />
            <div className="absolute inset-0 noise opacity-40 pointer-events-none" />
          </div>

          <div className="flex min-h-screen flex-col pb-24 sm:pb-8">
            {/* Desktop Top Floating Navbar */}
            <Navbar />

            {/* Main Application Container */}
            <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
              {children}
            </main>

            {/* Minimalist Brand Footer */}
            <footer className="mt-auto border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
              <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="font-medium">
                  <span className="text-foreground font-semibold">Decision Replay</span> • Prospective Reasoning & Metacognitive Calibration
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Zero hindsight bias • Cryptographically frozen snapshots
                </p>
              </div>
            </footer>

            {/* Mobile-First Bottom Navigation Dock */}
            <MobileNav />

            {/* Authentication & Onboarding Modals */}
            <AuthModal />
            <WelcomeTourModal />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
