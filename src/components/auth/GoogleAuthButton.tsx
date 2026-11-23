"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              logo_alignment?: "left" | "center";
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleAuthButton() {
  const { loginWithGoogleCredential, loginWithGoogle } = useAuthStore();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [hasGoogleClient, setHasGoogleClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // If NEXT_PUBLIC_GOOGLE_CLIENT_ID is set, initialize official Google Identity Services
    if (clientId && typeof window !== "undefined") {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id && googleBtnContainerRef.current) {
          clearInterval(interval);
          setHasGoogleClient(true);

          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                setLoading(true);
                setError(null);
                try {
                  await loginWithGoogleCredential(response.credential);
                } catch {
                  setError("Google token verification failed.");
                } finally {
                  setLoading(false);
                }
              },
            });

            // Render Google's official One Tap / GSI button
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 280,
            });

            // Also prompt One-Tap popup on supported browsers
            window.google.accounts.id.prompt();
          } catch (e) {
            console.error("GIS initialization error:", e);
          }
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [clientId, loginWithGoogleCredential]);

  const handleInstantFallbackLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch {
      setError("Unable to connect to backend on port 4000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Container for official Google Identity Services rendered button */}
      <div
        ref={googleBtnContainerRef}
        className={hasGoogleClient ? "block min-h-[44px]" : "hidden"}
      />

      {/* High-visibility Brand Button (shown when custom GIS button not rendered or as direct CTA) */}
      {!hasGoogleClient && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          onClick={handleInstantFallbackLogin}
          className="group flex items-center justify-center gap-3.5 h-14 px-8 rounded-2xl bg-card border-2 border-border/90 hover:border-spring-500 font-display text-base font-bold text-foreground shadow-dock hover:shadow-spring transition-all cursor-pointer"
        >
          {/* Official Google G SVG */}
          <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24">
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
          <span>{loading ? "Signing in with Google..." : "Continue with Google"}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
        </motion.button>
      )}

      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}
