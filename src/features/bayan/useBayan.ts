"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useStore } from "zustand";
import { readToken } from "@/lib/tokens";
import type { BayanSession } from "./session";
import type { SavedState, UiState } from "./stores";

/** Saved progress and settings. Re-renders only when the picked part changes. */
export function useSaved<T>(session: BayanSession, pick: (state: SavedState) => T): T {
  return useStore(session.saved, pick);
}

/** What is on screen now: the conversation, who is near, speech bubbles. */
export function useUi<T>(session: BayanSession, pick: (state: UiState) => T): T {
  return useStore(session.ui, pick);
}

export function useSaveStatus(session: BayanSession) {
  return useSyncExternalStore(session.sync.subscribe, session.sync.getSnapshot, session.sync.getSnapshot);
}

/** A number token from globals.css, such as a timing in milliseconds. The game only renders in the browser. */
export function useNumberToken(name: `--${string}`, fallback: number): number {
  const [value] = useState(() => {
    const read = Number.parseFloat(readToken(name));
    return Number.isFinite(read) ? read : fallback;
  });
  return value;
}

/** Person name to row in the people sheet, for portraits. */
export function usePeopleIndex(url: string): Record<string, number> | null {
  const [index, setIndex] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    let active = true;
    fetch(url)
      .then((response) => response.json() as Promise<Record<string, number>>)
      .then((rows) => {
        if (active) setIndex(rows);
      })
      .catch(() => {
        // Portraits are a nicety; the names still show.
      });
    return () => {
      active = false;
    };
  }, [url]);
  return index;
}
