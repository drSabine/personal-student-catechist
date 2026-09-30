"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { BrickWallActivity } from "./BrickWallActivity";
import { PassTheDove } from "./PassTheDove";

/** Connects a BrickWallActivity to React. Re-renders only when the wall changes. */
export function useBrickWall(activity: BrickWallActivity) {
  const snapshot = useSyncExternalStore(activity.subscribe, activity.getSnapshot, activity.getSnapshot);
  const place = useCallback((slot: number) => activity.place(slot), [activity]);
  const reset = useCallback(() => activity.reset(), [activity]);
  const setPieceCount = useCallback((count: number) => activity.setPieceCount(count), [activity]);
  return { snapshot, place, reset, setPieceCount };
}

/** One PassTheDove round per mounted view. */
export function usePassTheDove() {
  const [round] = useState(() => new PassTheDove());
  const phase = useSyncExternalStore(round.subscribe, round.getSnapshot, round.getSnapshot);
  const toggle = useCallback(() => round.toggle(), [round]);
  const stop = useCallback(() => round.stop(), [round]);
  return { passing: phase === "passing", toggle, stop };
}
