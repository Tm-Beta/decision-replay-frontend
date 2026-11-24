// FEATURE: Application Root Layout & Navigation Shell

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ReviewAlerts } from "@/components/dashboard/ReviewAlerts";
import { Navbar } from "@/components/navigation/Navbar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { AuthModal } from "@/components/auth/AuthModal";
import { WelcomeTourModal } from "@/components/onboarding/WelcomeTourModal";
import { GoogleOAuthListener } from "@/components/auth/GoogleOAuthListener";
import { VortexBackground } from "@/components/background/VortexBackground";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Decision Replay — Prospective Decision Intelligence & Metacognition",
  description:
    "Capture beliefs before reality happens; learn honestly when the outcome arrives. Zero hindsight bias.",
  authors: [{ name: "Tm-Beta", url: "https://github.com/Tm-Beta" }],
  creator: "Tm-Beta",
  publisher: "Tm-Beta",
  openGraph: {
    title: "Decision Replay",
    description: "Prospective Decision Intelligence & Metacognition by Tm-Beta",
    url: "https://github.com/Tm-Beta",
    siteName: "Decision Replay by Tm-Beta",
    type: "website",
  },
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
      className={`${displayFont.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30 selection:text-foreground">
        {/* Official Google Identity Services SDK */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
        <ThemeProvider>
          {/* Algorithmic Vortex Vector Field Canvas Background */}
          <VortexBackground />

          {/* Subtle Ambient Lighting & Paper Texture */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-plum-800/5 dark:bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute top-1/3 -right-40 w-[450px] h-[300px] bg-spring-500/5 blur-[100px] rounded-full" />
            <div className="absolute bottom-10 -left-40 w-[500px] h-[300px] bg-plum-500/5 blur-[120px] rounded-full" />
            <div className="absolute inset-0 noise opacity-35 pointer-events-none" />
          </div>

          <div className="relative z-10 flex min-h-screen flex-col justify-between overflow-x-hidden">
            {/* Desktop Right Floating Dock & Mobile Header */}
            <Navbar />

            {/* Main Application Container (with dedicated right clearance for the dock, top clearance for corner logo, and bottom clearance for mobile nav) */}
            <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 md:pr-20 lg:pr-24 pb-28 sm:pb-32 md:pb-16 pt-6 sm:pt-8 md:pt-16 lg:pt-16">
              <ReviewAlerts/>
              {children}
            </main>

            {/* Minimalist Brand Footer (Solveo style for Tm-Beta) */}
            <footer className="mt-auto border-t border-border/40 py-3 sm:py-3.5 text-center text-xs text-muted-foreground shrink-0">
              <div className="mx-auto max-w-7xl px-4 flex items-center justify-center">
                <p className="flex items-center justify-center flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>&copy; {new Date().getFullYear()} Decision Replay</span>
                  <span className="text-muted-foreground/40">&middot;</span>
                  <a
                    href="https://github.com/Tm-Beta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary"
                  >
                    <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>Website by Tm-Beta</span>
                  </a>
                </p>
              </div>
            </footer>

            {/* Mobile-First Bottom Navigation Dock */}
            <MobileNav />

            {/* Authentication & Onboarding Modals */}
            <GoogleOAuthListener />
            <AuthModal />
            <WelcomeTourModal />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
