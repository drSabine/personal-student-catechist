"use client";

import { Maximize, Minimize } from "lucide-react";
import { useEffect, useRef } from "react";
import { useReflections } from "@/features/reflections/useReflections";
import { readToken } from "@/lib/tokens";
import type { BayanActivity } from "./BayanActivity";
import { createGame, type GamePalette } from "./game/createGame";
import { BuiltCard } from "./overlay/BuiltCard";
import { ChurchCloseUp } from "./overlay/ChurchCloseUp";
import { ControlsHint } from "./overlay/ControlsHint";
import { DialogBox } from "./overlay/DialogBox";
import { QuestCard } from "./overlay/QuestCard";
import { SaveBadge } from "./overlay/SaveBadge";
import { ServeBoard, ServeWriter } from "./overlay/Serve";
import { SpeechBubbles } from "./overlay/SpeechBubbles";
import { StageBanner } from "./overlay/StageBanner";
import { StartScreen } from "./overlay/StartScreen";
import { TalkButton } from "./overlay/TalkButton";
import { TeacherPanel } from "./overlay/TeacherPanel";
import { usePeopleIndex, useSaved, useUi } from "./useBayan";

interface BayanPlayProps {
  activity: BayanActivity;
  lessonId: string;
  fullscreen: { active: boolean; enter: () => void; exit: () => void };
}

function colors(token: `--${string}`): number[] {
  return readToken(token)
    .split(/\s+/)
    .filter(Boolean)
    .map((hex) => Number.parseInt(hex.replace("#", ""), 16));
}

/** The game and everything drawn over it. Loaded only in the browser (see BayanView). */
export function BayanPlay({ activity, lessonId, fullscreen }: BayanPlayProps) {
  const host = useRef<HTMLDivElement>(null);
  const session = activity.sessionFor(lessonId);
  const { content, assets } = activity;
  const peopleRows = usePeopleIndex(assets.peopleIndex);
  // Stage 5: the groups' sentences are saved as the lesson's reflections.
  const lastStage = useSaved(session, (state) => state.progress.stage === 5);
  const started = useUi(session, (state) => state.started);
  const serving = lastStage && started;
  const { entries, save, refresh } = useReflections(lessonId, { list: serving });

  // A reset takes the promises down on the server first, so the board reloads to an empty list.
  useEffect(() => session.bus.on((event) => event.type === "reset" && refresh()), [session, refresh]);

  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    const palette: GamePalette = {
      confetti: colors("--game-confetti"),
      walkable: colors("--game-walkable")[0] ?? 0,
      blocked: colors("--game-blocked")[0] ?? 0,
    };
    // Strict mode mounts twice: the first game is destroyed here before the second starts.
    const game = createGame(parent, {
      assets,
      content,
      session,
      palette,
      backdrop: readToken("--color-leaf"),
      minTile: Number.parseFloat(readToken("--game-min-tile")),
      calm: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    return () => {
      // The pupil may come back; nobody should still be marked as near or mid-sentence.
      session.ui.setState({ near: null, bubbles: [] });
      game.destroy(true);
    };
  }, [assets, content, session]);

  const label = fullscreen.active ? "Leave full screen" : "Full screen";
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div ref={host} className="absolute inset-0 cursor-pointer" />
      <SpeechBubbles session={session} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-game-gap">
        <div className="pointer-events-auto flex flex-col gap-2">
          <QuestCard session={session} content={content} />
          {serving && <ServeBoard session={session} content={content} entries={entries} sheet={assets.buildings} />}
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2 @lg:flex-row @lg:items-center">
          <SaveBadge session={session} />
          <TeacherPanel session={session} />
          <button
            type="button"
            aria-label={label}
            title={label}
            onClick={fullscreen.active ? fullscreen.exit : fullscreen.enter}
            className="inline-flex size-11 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-game hover:bg-wash"
          >
            {fullscreen.active ? <Minimize aria-hidden className="size-5" /> : <Maximize aria-hidden className="size-5" />}
          </button>
        </div>
      </div>
      <ControlsHint session={session} />
      <TalkButton session={session} content={content} />
      {serving && <ServeWriter session={session} content={content} save={save} />}
      <DialogBox session={session} content={content} peopleSheet={assets.people} peopleRows={peopleRows} statue={assets.statue} />
      <BuiltCard session={session} content={content} sheet={assets.buildings} />
      <ChurchCloseUp session={session} content={content} sheet={assets.buildings} />
      <StageBanner session={session} content={content} />
      <StartScreen session={session} content={content} fullscreen={fullscreen} />
    </div>
  );
}
