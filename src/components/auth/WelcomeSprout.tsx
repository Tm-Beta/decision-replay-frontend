"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { findWelcomeRoute } from "./welcomeRoute";
import { JournalArt } from "@/components/illustrations/JournalArt";

const tour = [
  { message: "Hi! I’m Sprout. Come on in!", kind: "journal", reaction: "celebrating" },
  { message: "Write down a choice while it’s fresh.", kind: "projects", reaction: "sorting" },
  { message: "See what worked when the results come in.", kind: "insights", reaction: "celebrating" },
  { message: "Talk through your next step in Chat.", kind: "chat", reaction: "listening" },
  { message: "Ready? Continue with Google to start.", kind: "journal", reaction: "celebrating" },
] as const;

const flourishes = ["wave", "peek", "twinkle"] as const;
const lastStop = tour.length - 1;

export function MobileWelcomeSprout() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (mobile.matches && !reduced.matches && !document.hidden) {
        setStep(current => (current + 1) % tour.length);
      }
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const { message, kind, reaction } = tour[step];
  return <div className="mobile-welcome-sprout">
    <JournalArt key={step} kind={kind} reaction={reaction} />
    <p>{message}</p>
  </div>;
}

export function WelcomeSprout() {
  const guide = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [arrival, setArrival] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const element = guide.current;
    if (!mounted || !element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    let walking: Animation | undefined;
    let timer = 0;
    let position: { x: number; y: number } | undefined;
    let recent: { x: number; y: number }[] = [];
    let current = 0;

    const transform = ({ x, y }: { x: number; y: number }) => `translate(${x}px, ${y}px)`;

    function wander() {
      if (!element || document.hidden) return;
      const visibleBounds = (selector: string) => [...document.querySelectorAll(selector)]
        .filter(node => node.getClientRects().length > 0)
        .map(node => node.getBoundingClientRect());
      const controls = visibleBounds("header, footer, button, a, [data-google-welcome]");
      const cards = visibleBounds("[data-sprout-obstacle]").map(box =>
        new DOMRect(box.x, box.y - 5, box.width, box.height + 10),
      );
      const viewport = { width: document.documentElement.clientWidth, height: window.innerHeight };
      const size = { width: element.offsetWidth, height: element.offsetHeight };
      const route = findWelcomeRoute(viewport, size, controls, position, recent, cards);
      const sprint = route.length > 1 && route.some(point => cards.some(card =>
        point.x < card.right && point.x + size.width > card.left &&
        point.y < card.bottom && point.y + size.height > card.top,
      ));
      const destination = route.at(-1);
      element.style.visibility = destination ? "visible" : "hidden";
      if (!destination) {
        timer = window.setTimeout(wander, 4000);
        return;
      }

      function arrive() {
        if (!element || !destination) return;
        position = destination;
        recent = [...recent.slice(-3), destination];
        element.style.transform = transform(destination);
        element.dataset.walking = "false";
        element.dataset.sprint = "false";
        element.dataset.flourish = flourishes[Math.floor(Math.random() * flourishes.length)];
        setStep(current);
        setArrival(count => count + 1);
        current = (current + 1) % tour.length;
        timer = window.setTimeout(wander, 4300 + Math.random() * 2200);
      }

      if (route.length < 2) {
        arrive();
        return;
      }

      element.dataset.walking = "true";
      element.dataset.sprint = String(sprint);
      let distance = 0;
      const frames = route.map((point, index) => {
        const previous = route[index - 1];
        if (previous) distance += Math.hypot(point.x - previous.x, point.y - previous.y);
        return { transform: transform(point), distance };
      });
      walking = element.animate(
        frames.map(frame => ({ transform: frame.transform, offset: frame.distance / distance })),
        { duration: Math.max(1100, distance * (sprint ? 4.2 : 5.4)), easing: "ease-in-out" },
      );
      walking.onfinish = arrive;
    }

    function reset() {
      window.clearTimeout(timer);
      walking?.cancel();
      if (element) element.dataset.sprint = "false";
      position = undefined;
      recent = [];
      if (mobile.matches) return;
      if (motion.matches) {
        element?.style.removeProperty("transform");
        if (element) element.style.visibility = "visible";
        setStep(0);
      } else {
        if (element) element.style.visibility = "hidden";
        timer = window.setTimeout(wander, 650);
      }
    }

    reset();
    window.addEventListener("resize", reset);
    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("visibilitychange", reset);
    motion.addEventListener("change", reset);
    return () => {
      window.clearTimeout(timer);
      walking?.cancel();
      window.removeEventListener("resize", reset);
      window.removeEventListener("scroll", reset);
      document.removeEventListener("visibilitychange", reset);
      motion.removeEventListener("change", reset);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const element = guide.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function lookAtPointer(event: PointerEvent) {
      if (event.pointerType !== "mouse" || motion.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!element) return;
        const bounds = element.getBoundingClientRect();
        const x = event.clientX - bounds.left - bounds.width / 2;
        const y = event.clientY - bounds.bottom + 38;
        const nearby = Math.hypot(x, y) < 125;
        element.dataset.nearby = String(nearby);
        element.style.setProperty("--sprout-look-x", nearby ? `${Math.max(-4, Math.min(4, x / 15))}px` : "0px");
        element.style.setProperty("--sprout-look-y", nearby ? `${Math.max(-3, Math.min(3, y / 15))}px` : "0px");
      });
    }

    function resetPointer() {
      cancelAnimationFrame(frame);
      if (!element) return;
      element.dataset.nearby = "false";
      element.style.setProperty("--sprout-look-x", "0px");
      element.style.setProperty("--sprout-look-y", "0px");
    }
    window.addEventListener("pointermove", lookAtPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    return () => {
      resetPointer();
      window.removeEventListener("pointermove", lookAtPointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, [mounted]);

  useEffect(() => {
    if (step !== lastStop) return;
    const target = document.querySelector("[data-google-welcome]");
    target?.classList.add("sprout-signin-highlight");
    return () => target?.classList.remove("sprout-signin-highlight");
  }, [step]);

  if (!mounted) return null;

  const { message, kind, reaction } = tour[step];
  return createPortal(
    <div ref={guide} className="welcome-sprout" data-stop={step} data-arrival={arrival} aria-hidden="true">
      <span className="welcome-sprout-bubble"><span className="sprout-tour-line">{message}</span><span className="sprout-dash-line">Oh! Oh!</span></span>
      <JournalArt key={arrival} kind={kind} reaction={reaction} />
    </div>,
    document.body,
  );
}
