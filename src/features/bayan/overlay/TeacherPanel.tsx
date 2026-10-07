"use client";

import { Music, RotateCcw, Settings, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { BayanSession } from "../session";
import { useSaved } from "../useBayan";

function Toggle({ label, on, onChange, icon }: { label: string; on: boolean; onChange: () => void; icon: ReactNode }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-sm hover:bg-wash"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${on ? "bg-ink text-paper" : "bg-wash text-muted"}`}>
        {on ? "On" : "Off"}
      </span>
    </button>
  );
}

/** A small corner panel for the teacher: sound switches, the opening again, and reset. */
export function TeacherPanel({ session }: { session: BayanSession }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const music = useSaved(session, (state) => state.music);
  const sounds = useSaved(session, (state) => state.sounds);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    setConfirming(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Teacher panel"
        title="Teacher panel"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="inline-flex size-11 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-game hover:bg-wash"
      >
        {open ? <X aria-hidden className="size-5" /> : <Settings aria-hidden className="size-5" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 flex w-64 animate-pop-in flex-col gap-1 rounded-2xl border-2 border-ink bg-paper p-2 shadow-game">
          <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-label text-muted">Teacher</p>
          <Toggle
            label="Music"
            on={music}
            onChange={() => session.saved.setState({ music: !music })}
            icon={<Music aria-hidden className="size-4" />}
          />
          <Toggle
            label="Sounds"
            on={sounds}
            onChange={() => session.saved.setState({ sounds: !sounds })}
            icon={sounds ? <Volume2 aria-hidden className="size-4" /> : <VolumeX aria-hidden className="size-4" />}
          />
          <button
            type="button"
            onClick={() => {
              close();
              session.director.playOpening();
            }}
            className="flex min-h-11 items-center rounded-xl px-3 text-left text-sm hover:bg-wash"
          >
            Play the opening again
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirming) return setConfirming(true);
              close();
              session.director.reset();
            }}
            className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm ${
              confirming ? "bg-coral text-ink" : "hover:bg-wash"
            }`}
          >
            <RotateCcw aria-hidden className="size-4" />
            {confirming ? "Tap again to empty the town" : "Reset the town"}
          </button>
        </div>
      )}
    </div>
  );
}
