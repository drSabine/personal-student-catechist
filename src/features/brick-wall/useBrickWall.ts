"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { BrickWallActivity } from "./BrickWallActivity";

/** Connects a BrickWallActivity to React. Re-renders only when the wall changes. */
export function useBrickWall(activity: BrickWallActivity) {
  const snapshot = useSyncExternalStore(activity.subscribe, activity.getSnapshot, activity.getSnapshot);
  const place = useCallback((slot: number) => activity.place(slot), [activity]);
  const reset = useCallback(() => activity.reset(), [activity]);
  return { snapshot, place, reset };
}
