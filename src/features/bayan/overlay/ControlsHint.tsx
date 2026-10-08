"use client";

import type { BayanSession } from "../session";
import { isLocked } from "../stores";
import { useUi } from "../useBayan";

/** How to move, in words for the device: keys on a laptop, taps on a phone. */
export function ControlsText() {
  return (
    <>
      <span className="pointer-coarse:hidden">Arrows or WASD to walk, Enter to talk</span>
      <span className="hidden pointer-coarse:inline">Tap to walk, tap someone to talk</span>
    </>
  );
}

/** A small reminder of the controls in the corner, out of the way while someone talks. */
export function ControlsHint({ session }: { session: BayanSession }) {
  const locked = useUi(session, isLocked);
  if (locked) return null;
  return (
    <p className="pointer-events-none absolute bottom-0 left-0 m-game-gap hidden rounded-full border-2 border-ink/30 bg-paper/85 px-3 py-1 text-game-small text-ink @2xl:block">
      <ControlsText />
    </p>
  );
}
