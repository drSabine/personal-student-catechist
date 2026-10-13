"use client";

import { useCallback, useEffect, useRef } from "react";

export type SfxName = "select" | "place" | "wrong" | "right" | "done" | "tap";

/** Files under public/, one short clip per name. */
export type SfxFiles = Readonly<Record<SfxName, string>>;

/** Short clips, loaded once when the game opens and released when it closes. Silent when `on` is false. */
export function useSfx(files: SfxFiles, on: boolean): (name: SfxName) => void {
  const clips = useRef<Map<SfxName, HTMLAudioElement> | null>(null);
  const enabled = useRef(on);

  useEffect(() => {
    enabled.current = on;
  }, [on]);

  useEffect(() => {
    const loaded = new Map<SfxName, HTMLAudioElement>();
    for (const [name, src] of Object.entries(files) as [SfxName, string][]) {
      const audio = new Audio(src);
      audio.preload = "auto";
      loaded.set(name, audio);
    }
    clips.current = loaded;
    return () => {
      for (const audio of loaded.values()) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      clips.current = null;
    };
  }, [files]);

  return useCallback((name: SfxName) => {
    const audio = clips.current?.get(name);
    if (!audio || !enabled.current) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // The browser blocks sound until the page is tapped once; the game works without it.
    });
  }, []);
}
