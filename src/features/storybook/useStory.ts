"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WORKER_GIFTS } from "./cast";
import { readNumberToken, readToken } from "@/lib/tokens";

export interface Timings {
  hop: number;
  work: number;
  stagger: number;
  pause: number;
  concerned: number;
  opening: number;
}

/** Lesson 03's timings from globals.css, in milliseconds. Reduced motion zeroes the hops and fades there. */
export function useTimings(): Timings {
  const [timings] = useState<Timings>(() => ({
    hop: readNumberToken("--story-hop-ms"),
    work: readNumberToken("--story-work-ms"),
    stagger: readNumberToken("--story-stagger-ms"),
    pause: readNumberToken("--story-pause-ms"),
    concerned: readNumberToken("--story-concerned-ms"),
    opening: readNumberToken("--story-opening-ms"),
  }));
  return timings;
}

type Shoot = (options: { particleCount: number; spread: number; origin: { y: number }; colors: string[] }) => unknown;

/**
 * Confetti on a canvas inside the game, loaded only in the browser. Put `canvas` on a canvas that
 * covers the game; the confetti is cleared when the game closes.
 */
export function useConfetti() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const shoot = useRef<(Shoot & { reset: () => void }) | null>(null);

  useEffect(() => {
    let active = true;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (!active || !canvas.current) return;
      shoot.current = confetti.create(canvas.current, { resize: true, disableForReducedMotion: true });
    });
    return () => {
      active = false;
      shoot.current?.reset();
      shoot.current = null;
    };
  }, []);

  const fire = useCallback(() => {
    const colors = WORKER_GIFTS.map((gift) => readToken(`--gift-${gift}`));
    shoot.current?.({ particleCount: 160, spread: 90, origin: { y: 0.65 }, colors });
  }, []);

  return { canvas, fire };
}
