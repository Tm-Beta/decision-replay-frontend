"use client";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { MobileWelcomeSprout, WelcomeSprout } from "@/components/auth/WelcomeSprout";

const features = [
  { title: "Remember why you chose", description: "Keep your original reasons and expectations together.", art: "notebook", accent: "lavender" },
  { title: "See what happened", description: "Compare what you expected with the real outcome.", art: "terrarium", accent: "mint" },
  { title: "Find your next step", description: "Use your past decisions to guide what you do next.", art: "paper-plane", accent: "peach" },
] as const;

export function AuthGate() {
  return (
    <section className="signin-stage">
      <WelcomeSprout />
      <div className="signin-card" data-sprout-obstacle>
        <h1>Make decisions.<br />Learn from them.</h1>
        <p>Write down what you decide today, then come back to see what worked.</p>
        <MobileWelcomeSprout />
        <div data-google-welcome className="rounded-2xl">
          <GoogleAuthButton size="large" />
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
