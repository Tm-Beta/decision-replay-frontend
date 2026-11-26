"use client";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { MobileWelcomeSprout, WelcomeSprout } from "@/components/auth/WelcomeSprout";

const features = [
  { title: "Remember why you chose", description: "Lock in your reasoning, alternatives, and expectations before hindsight kicks in.", art: "notebook", accent: "lavender" },
  { title: "Map choices & outcomes", description: "See how one decision branches into real outcomes, plans, and next steps.", art: "terrarium", accent: "mint" },
  { title: "Spot your patterns", description: "Review what worked, track your calibration, and ask AI about your next move.", art: "paper-plane", accent: "peach" },
] as const;

export function AuthGate() {
  return (
    <section className="signin-stage">
      <WelcomeSprout />
      <div className="signin-card" data-sprout-obstacle>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-spring-500 mb-2">
          So I Chose
        </span>
        <h1>Decide clearly.<br />Learn honestly.</h1>
        <p>Write down what you chose today, then come back to see what worked.</p>
        <MobileWelcomeSprout />
        <div data-google-welcome className="rounded-2xl">
          <GoogleAuthButton size="large" />
        </div>
        <div className="pt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <a href="https://soichose.com" className="hover:text-foreground transition-colors underline underline-offset-4">
            How So I Chose works
          </a>
          <span aria-hidden="true">&middot;</span>
          <a href="https://soichose.com/security" className="hover:text-foreground transition-colors underline underline-offset-4">
            .soichose Security
          </a>
        </div>
      </div>
      {features.map(({ title, description, art, accent }, index) => (
        <article key={title} className={`signin-feature signin-feature-${index + 1} signin-${accent}`} data-sprout-obstacle>
          <div className="signin-feature-art" aria-hidden="true">
            <span className={`sprout-object object-${art}`} />
            <span className="sprout-object object-leaf" />
            <span className="sprout-object object-petal" />
          </div>
          <h2>{title}</h2>
          <p>{description}</p>
        </article>
      ))}
    </section>
  );
}
