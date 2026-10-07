"use client";

import type { BayanSession } from "../session";
import { useUi } from "../useBayan";

/** Lines people say as the class walks by, floating over their heads. */
export function SpeechBubbles({ session }: { session: BayanSession }) {
  const bubbles = useUi(session, (state) => state.bubbles);
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((bubble) => (
        <p
          key={bubble.id}
          className="absolute w-max max-w-bubble -translate-x-1/2 -translate-y-full animate-pop-in rounded-xl border-2 border-ink bg-paper px-3 py-1.5 text-center text-game-small font-medium text-ink shadow-game"
          style={{ left: bubble.x, top: bubble.y }}
        >
          {bubble.text}
          {/* The little tail pointing down at the speaker. */}
          <span
            aria-hidden
            className="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-ink bg-paper"
          />
        </p>
      ))}
    </div>
  );
}
