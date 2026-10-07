"use client";

import { Cloud, CloudOff, LoaderCircle } from "lucide-react";
import type { SaveStatus } from "@/core/save/SyncedStorage";
import type { BayanSession } from "../session";
import { useSaveStatus } from "../useBayan";

const LABEL: Record<SaveStatus, string> = {
  loading: "Opening save",
  saving: "Saving",
  saved: "Saved",
  offline: "Saved on this laptop",
};

/** Reassurance for the teacher: progress is safe, and where it is kept. */
export function SaveBadge({ session }: { session: BayanSession }) {
  const status = useSaveStatus(session);
  const Icon = status === "offline" ? CloudOff : status === "saved" ? Cloud : LoaderCircle;
  return (
    <p
      role="status"
      title={status === "offline" ? "The server could not be reached. It will try again." : undefined}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 text-xs font-medium shadow-game"
    >
      <Icon aria-hidden className={`size-4 ${status === "saving" || status === "loading" ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">{LABEL[status]}</span>
    </p>
  );
}
