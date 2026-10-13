"use client";

import { Maximize, Minimize } from "lucide-react";
import { MotionConfig } from "motion/react";
import { useState, type ReactNode } from "react";
import { useFullscreen } from "@/hooks/useFullscreen";
import { PaperDefs } from "./art/PaperDefs";
import { storyFonts } from "./fonts";
import { StartScreen } from "./StartScreen";
import type { StoryGame } from "./StoryGame";
import { cornerButton } from "./styles";
import { TeacherPanel, type Jump } from "./TeacherPanel";
import { useHydrated, useSaved, useSaveStatus } from "./useGame";
import { useSfx, type SfxFiles, type SfxName } from "./useSfx";
import { useConfetti } from "./useStory";

/** What a game's board gets from the shell. */
export interface Stage {
  play: (name: SfxName) => void;
  fire: () => void;
}

interface StoryPlayProps<TProgress, TAction> {
  game: StoryGame<TProgress, TAction>;
  sounds: SfxFiles;
  cover: { title: string; tagline: string; play: string; art: ReactNode; cast: ReactNode };
  jumpTitle: string;
  jumps: readonly Jump[];
  replayLabel: string;
  onReplay: () => void;
  onReset: () => void;
  children: (stage: Stage) => ReactNode;
}

/**
 * Everything both Lesson 03 games share: the board they are pinned to, the cover with its Play button,
 * the teacher panel, full screen, sound, and confetti. Play fills the screen, so the TV shows only the game.
 */
export function StoryPlay<TProgress, TAction>(props: StoryPlayProps<TProgress, TAction>) {
  const { game, sounds, cover, children } = props;
  const fullscreen = useFullscreen();
  const ready = useHydrated(game);
  const sound = useSaved(game, (state) => state.sound);
  const status = useSaveStatus(game);
  const play = useSfx(sounds, sound);
  const { canvas, fire } = useConfetti();
  const [started, setStarted] = useState(false);
  const label = fullscreen.active ? "Leave full screen" : "Full screen";

  const start = () => {
    setStarted(true);
    fullscreen.enter();
    play("select");
  };

  return (
    <div
      className={
        fullscreen.active ? "fixed inset-0 z-50 bg-board" : "flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3 lg:px-10 lg:pb-6"
      }
    >
      <div
        className={`${storyFonts} relative min-h-0 flex-1 overflow-hidden bg-board font-story-body text-ink [container-type:size] ${
          fullscreen.active ? "size-full" : "rounded-2xl"
        }`}
      >
        <PaperDefs />
        {/* Under reduced motion, tokens jump straight to their place instead of hopping. */}
        <MotionConfig reducedMotion="user">
          {ready &&
            (started ? (
              children({ play, fire })
            ) : (
              <StartScreen title={cover.title} tagline={cover.tagline} play={cover.play} art={cover.art} onPlay={start}>
                {cover.cast}
              </StartScreen>
            ))}
        </MotionConfig>
        <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full" />
        <div className="absolute right-story-gap top-story-gap z-30 flex items-center gap-2">
          <TeacherPanel
            sound={sound}
            onSound={(on) => game.setSound(on)}
            jumpTitle={props.jumpTitle}
            jumps={props.jumps}
            replayLabel={props.replayLabel}
            onReplay={props.onReplay}
            onReset={props.onReset}
            status={status}
          />
          <button
            type="button"
            aria-label={label}
            title={label}
            onClick={fullscreen.active ? fullscreen.exit : fullscreen.enter}
            className={cornerButton}
          >
            {fullscreen.active ? <Minimize aria-hidden className="size-5" /> : <Maximize aria-hidden className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
