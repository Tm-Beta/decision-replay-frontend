"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Lightweight, Ultra-fast 2D Simplex Noise Implementation (Mulberry32 PRNG)
 * Enables mathematically pure algorithmic flow fields without external dependencies.
 */
function createSimplexNoise(seed = 1407) {
  const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  function mulberry32(a: number) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = Math.floor(rand() * 256);

  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }

  const grad3 = new Float32Array([
    1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
    1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
    0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
  ]);

  return {
    noise2D: function (xin: number, yin: number): number {
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;

      let i1: number, j1: number;
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } else {
        i1 = 0;
        j1 = 1;
      }

      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1.0 + 2.0 * G2;
      const y2 = y0 - 1.0 + 2.0 * G2;

      const ii = i & 255;
      const jj = j & 255;

      let n0 = 0.0;
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        t0 *= t0;
        const gi0 = permMod12[ii + perm[jj]] * 3;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
      }

      let n1 = 0.0;
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        t1 *= t1;
        const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }

      let n2 = 0.0;
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        t2 *= t2;
        const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }

      return 70.0 * (n0 + n1 + n2);
    },
  };
}

/**
 * High-performance Particle tracking coordinates, lifecycle, and brand color palette
 */
class FlowParticle {
  x: number = 0;
  y: number = 0;
  prevX: number = 0;
  prevY: number = 0;
  life: number = 0;
  maxLife: number = 0;
  speedMultiplier: number = 1;
  colorIndex: number = 0; // 0: Spring Green, 1: Orchid Plum, 2: Butter Cream

  constructor(width: number, height: number) {
    this.reset(true, width, height);
  }

  reset(initial = false, width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.prevX = this.x;
    this.prevY = this.y;
    this.life = initial ? Math.random() * 250 : 0;
    this.maxLife = 180 + Math.random() * 260;
    this.speedMultiplier = 0.75 + Math.random() * 0.55;

    const rand = Math.random();
    if (rand < 0.65) {
      this.colorIndex = 0; // Primary brand accent (Spring Green)
    } else if (rand < 0.88) {
      this.colorIndex = 1; // Secondary brand accent (Luminous Orchid Plum)
    } else {
      this.colorIndex = 2; // Warm Butter Cream tint
    }
  }

  update(
    width: number,
    height: number,
    simplex: ReturnType<typeof createSimplexNoise>,
    timeOffset: number,
    mouse: { x: number; y: number; active: boolean },
    speed: number,
    noiseScale: number,
    mouseRadius: number
  ) {
    this.prevX = this.x;
    this.prevY = this.y;

    // Vector field calculation with 2D simplex noise and continuous time drift
    const noiseVal = simplex.noise2D(
      this.x * noiseScale,
      this.y * noiseScale + timeOffset
    );

    // Map noise [-1, 1] to flowing angle radians
    let angle = noiseVal * Math.PI * 2.5;

    // Smooth Deflection around Mouse Cursor
    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distSq = dx * dx + dy * dy;
      const radiusSq = mouseRadius * mouseRadius;

      if (distSq < radiusSq && distSq > 1) {
        const dist = Math.sqrt(distSq);
        const force = 1 - dist / mouseRadius;

        // Pillar deflection angle
        const pushAngle = Math.atan2(dy, dx);
        angle = angle * (1 - force * 0.75) + pushAngle * (force * 0.75);

        // Gentle outward fluid push
        this.x += Math.cos(pushAngle) * force * 2.2;
        this.y += Math.sin(pushAngle) * force * 2.2;
      }
    }

    // Step particle along field velocity vector
    const vx = Math.cos(angle) * speed * this.speedMultiplier;
    const vy = Math.sin(angle) * speed * this.speedMultiplier;

    this.x += vx;
    this.y += vy;
    this.life++;

    // Reset particle when leaving viewport or exceeding lifespan
    if (
      this.x < -20 ||
      this.x > width + 20 ||
      this.y < -20 ||
      this.y > height + 20 ||
      this.life > this.maxLife
    ) {
      this.reset(false, width, height);
    }
  }
}

export function VortexBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const isDark = theme === "dark";

  useEffect(() => {
    // Only animate on the public landing page/auth gate; never distract inside the app
    if (isAuthenticated) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Subtle, elegant Vortex Parameters for the Landing Page
    const config = {
      seed: 1407,
      density: 1500,
      speed: 1.2,
      noiseScale: 0.0032,
      mouseRadius: 150,
      strokeWidth: 0.85,
    };

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      config.speed = 0.25;
    }

    const simplex = createSimplexNoise(config.seed);
    let particles: FlowParticle[] = [];
    let animationFrameId: number;
    let timeOffset = 0;
    let isTabVisible = true;

    // Interactive Mouse Coordinates with smooth inertia
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
    };

    // Color definitions for light and dark themes (delicate & non-intrusive)
    const getColors = (): {
      trailFill: string;
      solidFill: string;
      strokes: [string, string, string];
    } => {
      if (isDark) {
        return {
          trailFill: "rgba(18, 12, 22, 0.06)", // Soft fading trail
          solidFill: "#120C16",
          strokes: [
            "rgba(34, 197, 94, 0.16)", // Delicate Spring Green
            "rgba(216, 140, 212, 0.14)", // Soft Orchid Plum
            "rgba(250, 245, 232, 0.10)", // Subtle Cream
          ],
        };
      } else {
        return {
          trailFill: "rgba(250, 246, 237, 0.06)",
          solidFill: "#FAF6ED",
          strokes: [
            "rgba(49, 20, 48, 0.12)", // Soft Velvet Plum
            "rgba(16, 149, 80, 0.14)", // Gentle Emerald
            "rgba(107, 88, 106, 0.09)", // Warm Muted Plum
          ],
        };
      }
    };

    let colors = getColors();

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Adjust particle count for mobile screens
      const targetCount =
        width < 768 ? Math.floor(config.density * 0.42) : config.density;

      particles = [];
      for (let i = 0; i < targetCount; i++) {
        particles.push(new FlowParticle(width, height));
      }

      // Fill solid base color on reset
      ctx.fillStyle = colors.solidFill;
      ctx.fillRect(0, 0, width, height);
    };

    resizeCanvas();

    // Render loop with batched path strokes
    const render = () => {
      if (isTabVisible) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Smooth mouse inertia
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;

        timeOffset += 0.0003 * config.speed;

        // Vortex 'trace' mode: draw semi-transparent background for fading trails
        ctx.fillStyle = colors.trailFill;
        ctx.fillRect(0, 0, width, height);

        // Update all particles
        for (let i = 0; i < particles.length; i++) {
          particles[i].update(
            width,
            height,
            simplex,
            timeOffset,
            mouse,
            config.speed,
            config.noiseScale,
            config.mouseRadius
          );
        }

        // Draw particles batched by color for maximum 60fps performance
        ctx.lineWidth = config.strokeWidth;
        ctx.lineCap = "round";

        for (let c = 0; c < 3; c++) {
          ctx.strokeStyle = colors.strokes[c];
          ctx.beginPath();
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.colorIndex === c) {
              ctx.moveTo(p.prevX, p.prevY);
              ctx.lineTo(p.x, p.y);
            }
          }
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Window Listeners
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const onTouchEnd = () => {
      mouse.active = false;
    };

    const onVisibilityChange = () => {
      isTabVisible = document.visibilityState !== "hidden";
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isDark, isAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
