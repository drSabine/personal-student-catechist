"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { isLotDone, leadersFound } from "../BayanRules";
import { LOT_IDS, type BayanContent } from "../content";
import type { BayanSession } from "../session";
import { useSaved } from "../useBayan";

function Box({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 ${
        done ? "border-leaf bg-leaf text-paper" : "border-ink/40 bg-paper"
      }`}
    >
      {done && <Check className="size-3.5" strokeWidth={3} />}
    </span>
  );
}

/** Where the class is and what to do next. Small by default so it hides little of the town; tap for the list. */
export function QuestCard({ session, content }: { session: BayanSession; content: BayanContent }) {
  const progress = useSaved(session, (state) => state.progress);
  const [open, setOpen] = useState(false);
  const stage = content.stages[progress.stage - 1];
  const found = leadersFound(progress);

  return (
    <section aria-label="Quest" className="w-quest max-w-full rounded-2xl border-2 border-ink bg-paper/90 p-3 shadow-game">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Hide the list" : "Show the list"}
        className="flex min-h-11 w-full items-start justify-between gap-2 text-left"
      >
        <span className="min-w-0">
          <span className="block text-game-small uppercase tracking-label text-muted">
            Stage {progress.stage} of {content.stages.length}
          </span>
          <span className="pixel block text-game lowercase">{stage.title}</span>
        </span>
        {open ? <ChevronUp aria-hidden className="mt-1 size-5 shrink-0" /> : <ChevronDown aria-hidden className="mt-1 size-5 shrink-0" />}
      </button>
      <p className="mt-1 text-game-small">{stage.instructions}</p>
      {progress.stage === 1 &&
        (open ? (
          <ul className="mt-2 flex flex-col gap-1">
            {LOT_IDS.map((lot) => {
              const done = isLotDone(progress, lot);
              return (
                <li key={lot} className="flex items-center gap-2 text-game-small">
                  <Box done={done} />
                  <span className={done ? "text-muted" : ""}>
                    {done ? content.lots[lot].leaders : `Leader of the ${content.lots[lot].name}`}
                  </span>
                  <span className="sr-only">{done ? "found" : "not found yet"}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 text-game-small text-muted">
            {LOT_IDS.map((lot) => (
              <Box key={lot} done={isLotDone(progress, lot)} />
            ))}
            <span className="ml-1">
              {found} of {LOT_IDS.length} leaders
            </span>
          </p>
        ))}
    </section>
  );
}
