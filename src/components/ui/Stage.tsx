"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export interface StageFit {
  /** Largest box with the given aspect ratio that fits. */
  width: number;
  height: number;
}

interface StageProps {
  /** Width divided by height of the thing to fit. */
  aspect: number;
  className?: string;
  children: (fit: StageFit) => ReactNode;
}

/** Fills the space it is given and fits a box of one aspect ratio inside it. */
export function Stage({ aspect, className = "", children }: StageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSpace((prev) =>
        prev && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1 ? prev : { width, height },
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  let fit: StageFit | null = null;
  if (space && space.width > 0 && space.height > 0) {
    const width = Math.floor(Math.min(space.width, space.height * aspect));
    fit = { width, height: Math.floor(width / aspect) };
  }

  return (
    <div ref={ref} className={`relative flex min-h-0 min-w-0 flex-1 items-center justify-center ${className}`}>
      {fit && children(fit)}
    </div>
  );
}
