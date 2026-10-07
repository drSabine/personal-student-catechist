"use client";

import { Hand, MessageCircle } from "lucide-react";
import { useCallback, useEffect } from "react";
import type { BayanContent } from "../content";
import type { BayanSession } from "../session";
import { isLocked, type Near } from "../stores";
import { useNumberToken, useUi } from "../useBayan";

const TALK_KEYS = ["Enter", " ", "e", "E"];

function nameOf(near: Near, content: BayanContent): string {
  return content.people[near.id]?.name ?? near.id;
}

/** Big and bobbing, so pupils see it from across the room. Enter, Space, or E also works. */
export function TalkButton({ session, content }: { session: BayanSession; content: BayanContent }) {
  const near = useUi(session, (state) => state.near);
  const locked = useUi(session, isLocked);
  const show = near !== null && !locked;
  const coolMs = useNumberToken("--game-talk-cooldown-ms", 500);

  const talk = useCallback(() => {
    if (near) session.director.interact(near);
  }, [near, session]);

  useEffect(() => {
    if (!show) return;
    const onKey = (event: KeyboardEvent) => {
      if (!TALK_KEYS.includes(event.key)) return;
      // Typing in a field is the only time the key is not for talking; a focused corner button must not take it.
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
      event.preventDefault();
      talk();
    };
    // Listen a moment after the button appears, so the Enter that closed a conversation does not reopen it.
    const timer = window.setTimeout(() => window.addEventListener("keydown", onKey), coolMs);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [show, talk, coolMs]);

  if (!show || !near) return null;
  const pet = near.kind === "animal";
  const Icon = pet ? Hand : MessageCircle;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-game-gap">
      <button
        type="button"
        onClick={talk}
        className="pointer-events-auto inline-flex min-h-11 animate-bob items-center gap-3 rounded-full border-2 border-ink bg-gold px-6 py-3 text-game font-medium text-ink shadow-game"
      >
        <Icon aria-hidden className="size-6" />
        {pet ? `Pet ${nameOf(near, content)}` : `Talk to ${nameOf(near, content)}`}
        <kbd className="hidden rounded-md border border-ink/30 px-2 text-game-small md:inline">Enter</kbd>
      </button>
    </div>
  );
}
