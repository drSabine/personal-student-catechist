"use client";

import { useCallback, useEffect, useState } from "react";

/** Full screen for one part of the page. Where there is no Fullscreen API (iPhone), it covers the window. */
export function useFullscreen() {
  const [active, setActive] = useState(false);

  const enter = useCallback(() => {
    setActive(true);
    document.documentElement.requestFullscreen?.().catch(() => {
      // Not allowed or not supported; covering the window still works.
    });
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    if (document.fullscreenElement) void document.exitFullscreen();
  }, []);

  useEffect(() => {
    if (!active) return;
    // Esc or the browser's own exit leaves full screen; keep our state in step.
    const onChange = () => {
      if (!document.fullscreenElement) setActive(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return { active, enter, exit };
}
