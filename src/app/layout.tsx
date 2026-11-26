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
import { PersonalizeOnboardingModal } from "@/components/onboarding/PersonalizeOnboardingModal";
import { GoogleOAuthListener } from "@/components/auth/GoogleOAuthListener";
import { VortexBackground } from "@/components/background/VortexBackground";
import { PageTransition } from "@/components/ui/PageTransition";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.soichose.com"),
  title: {
    default: "So I Chose App — Decide clearly. Learn honestly.",
    template: "%s · So I Chose",
  },
  description:
    "Sign in free to lock decisions with immutable SHA-256 Day-0 snapshots, map ANY/ALL branching outcomes, measure 6-axis Decision DNA calibration, and reflect with 6 private AI companions.",
  keywords: [
    "So I Chose app",
    "prospective decision journal",
    "decision replay workspace",
    "beat hindsight bias",
    "6-axis decision DNA",
    "encrypted .soichose vault",
  ],
  authors: [{ name: "Tm-Beta", url: "https://soichose.com" }],
  creator: "Tm-Beta",
  publisher: "So I Chose",
  alternates: { canonical: "https://app.soichose.com" },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "So I Chose App — Prospective Decision Journal & Replay",
    description:
      "Lock what you decided today before reality happens, compare expectations with outcomes honestly, and discover your 6-axis Decision DNA.",
    url: "https://app.soichose.com",
    siteName: "So I Chose",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "So I Chose — Decide clearly. Learn honestly.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "So I Chose App — Decide clearly. Learn honestly.",
    description:
      "Prospective SHA-256 decision locking, branching outcome trees, and 6 private AI companions.",
    images: ["/og-image.png"],
  },
};

const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://app.soichose.com/#app",
      name: "So I Chose",
      alternateName: "Decision Replay",
      url: "https://app.soichose.com",
      applicationCategory: "ProductivityApplication",
      applicationSubCategory: "Decision Journal & Calibration Analytics",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      isPartOf: { "@id": "https://soichose.com/#website" },
      publisher: { "@id": "https://soichose.com/#org" },
      mainEntityOfPage: "https://soichose.com",
      sameAs: ["https://soichose.com", "https://github.com/Tm-Beta"],
      softwareHelp: "https://soichose.com/guides",
      releaseNotes: "https://soichose.com/security",
      screenshot: "https://app.soichose.com/og-image.png",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Immutable SHA-256 Day-Zero Decision Snapshot Locking",
        "Pre-Mortem Failure Tracking & Assumption Checklists",
        "Visual Branching Outcome & ANY/ALL Contingency Trees",
        "6-Axis Decision DNA Calibration Analytics",
        "6 Journal-Grounded Private AI Reflection Companions",
        "AES-256-GCM Encrypted .soichose v2 Portable Vault Backups",
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_JSON_LD) }}
        />
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
            <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 md:pr-20 lg:pr-24 pb-28 sm:pb-32 md:pb-16 pt-6 sm:pt-8 md:pt-6">
              <ReviewAlerts/>
              <PageTransition>{children}</PageTransition>
            </main>

            {/* Minimalist Brand Footer (Solveo style for Tm-Beta) */}
            <footer className="mt-auto border-t border-border/40 py-3 sm:py-3.5 text-center text-xs text-muted-foreground shrink-0">
              <div className="mx-auto max-w-7xl px-4 flex items-center justify-center">
                <p className="flex items-center justify-center flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>&copy; {new Date().getFullYear()} So I Chose</span>
                  <span className="text-muted-foreground/40">&middot;</span>
                  <a
                    href="https://soichose.com"
                    className="hover:text-foreground transition-colors"
                  >
                    Website &amp; Guides
                  </a>
                  <span className="text-muted-foreground/40">&middot;</span>
                  <a
                    href="https://soichose.com/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
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
            <PersonalizeOnboardingModal />
            <WelcomeTourModal />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
