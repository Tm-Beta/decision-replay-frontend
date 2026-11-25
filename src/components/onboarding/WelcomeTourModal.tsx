"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { JournalArt } from "@/components/illustrations/JournalArt";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

const slides = [
  {
    title: "Start with one decision",
    message: "Write down the choice and what you expect. I’ll help you look back later.",
    kind: "journal", reaction: "celebrating",
    example: [{ label: "Your choice", value: "Try a weekend pop-up" }, { label: "You expected", value: "20 orders" }],
  },
  {
    title: "See what happened",
    message: "When the results come in, compare them with what you originally expected.",
    kind: "insights", reaction: "celebrating",
    example: [{ label: "You expected", value: "20 orders" }, { label: "What happened", value: "24 orders" }],
  },
  {
    title: "Map decisions and outcomes",
    message: "Connect choices, record multiple outcomes, and plan 'what if' scenarios in one zoomable flow.",
    kind: "projects", reaction: "sorting",
    example: [{ label: "Outcome", value: "Passed exam" }, { label: "Next decision", value: "Join engineering" }],
  },
  {
    title: "Think through the next step",
    message: "Ask Chat about your recorded decisions so you can build on what you learned.",
    kind: "chat", reaction: "listening",
    example: [{ label: "Ask Chat", value: "What should I try at the next pop-up?" }],
  },
] as const;

function Tour({ finish }: { finish: (createDecision?: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const last = step === slides.length - 1;

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="tour-title"
      className="sprout-tour"
      onCancel={event => { event.preventDefault(); finish(); }}
    >
      <div className="sprout-tour-top">
        <span className="text-xs text-muted-foreground">So I Chose · {step + 1} of {slides.length}</span>
        <Button variant="ghost" size="sm" onClick={() => finish()}>Skip tour</Button>
      </div>
      <div aria-live="polite" className="sprout-tour-content">
        <div className="sprout-tour-scene" key={step}>
          <JournalArt kind={slide.kind} reaction={slide.reaction} />
          <p>{slide.message}</p>
        </div>
        <h2 id="tour-title" className="font-display text-2xl font-bold">{slide.title}</h2>
        <dl className="sprout-tour-example">
          {slide.example.map(({ label, value }) => <div key={label}>
            <dt>{label}</dt><dd>{value}</dd>
          </div>)}
        </dl>
      </div>
      <div className="sprout-tour-actions">
        <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ArrowLeft size={15} aria-hidden="true" /> Back
        </Button>
        {last
          ? <Button size="sm" onClick={() => finish(true)}><Plus size={16} aria-hidden="true" /> New decision</Button>
          : <Button size="sm" onClick={() => setStep(step + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Button>}
      </div>
    </dialog>
  );
}

export function WelcomeTourModal() {
  const showTourModal = useAuthStore(store => store.showTourModal);
  const completeTour = useAuthStore(store => store.completeTour);
  const router = useRouter();
  if (!showTourModal) return null;

  return <Tour finish={createDecision => {
    completeTour();
    if (createDecision) router.push("/decisions/new");
  }} />;
}
