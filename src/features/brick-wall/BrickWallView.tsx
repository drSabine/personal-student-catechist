"use client";

import { useCallback, useState } from "react";
import type { ActivityViewProps } from "@/core/activity/ActivityRegistry";
import { Button } from "@/components/ui/Button";
import { PieceCountPicker } from "@/components/ui/PieceCountPicker";
import { Stage } from "@/components/ui/Stage";
import { useFullscreen } from "@/hooks/useFullscreen";
import type { BrickWallActivity } from "./BrickWallActivity";
import { Brick } from "./Brick";
import { useBrickWall, usePassTheDove } from "./useBrickWall";
import { useHalftoneRenderer } from "./useHalftoneRenderer";
import { Wall } from "./Wall";

/** Matches the wall's border-2 dashed top and left edge. */
const WALL_EDGE = 2;

function Icon({ path, filled = false }: { path: string; filled?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 10"
      className="size-3.5"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.2"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  play: "M2.5 1.5 8.5 5 2.5 8.5Z",
  stop: "M2 2h6v6H2Z",
  enterFullscreen: "M1 3V1h2M9 3V1H7M1 7v2h2M9 7v2H7",
  leaveFullscreen: "M3 1v2H1M7 1v2h2M3 9V7H1M7 9V7h2",
  collapse: "M2 4l3 3 3-3",
  expand: "M2 6l3-3 3 3",
} as const;

/** Build Our Wall: the whole activity on one screen, with a full screen mode for the TV. */
export function BrickWallView({ activity }: ActivityViewProps<BrickWallActivity>) {
  const { snapshot, place, reset, setPieceCount } = useBrickWall(activity);
  const round = usePassTheDove();
  const fullscreen = useFullscreen();
  const renderer = useHalftoneRenderer(activity.photo.src, activity.photo, activity.halftoneCells);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const canPlace = !round.passing && !snapshot.complete;
  const handlePlace = useCallback((slot: number) => canPlace && place(slot), [canPlace, place]);

  const handleReset = useCallback(() => {
    round.stop();
    reset();
  }, [round, reset]);

  const handlePieceCount = useCallback(
    (count: number) => {
      round.stop();
      setPieceCount(count);
    },
    [round, setPieceCount],
  );

  const floating = fullscreen.active;
  const showDetails = !(floating && collapsed);

  return (
    <div
      className={
        floating ? "fixed inset-0 z-50 flex flex-col bg-paper lg:flex-row" : "flex min-h-0 flex-1 flex-col lg:flex-row"
      }
    >
      <Stage
        aspect={activity.photo.width / activity.photo.height}
        className={floating ? "p-3 lg:p-6" : "px-4 py-3 lg:py-6 lg:pl-10 lg:pr-4"}
      >
        {(fit) => (
          <Wall
            photo={activity.photo}
            pieceCount={snapshot.pieceCount}
            width={fit.width - WALL_EDGE}
            height={fit.height - WALL_EDGE}
            layoutSeed={activity.layoutSeed}
            cells={activity.halftoneCells}
            filled={snapshot.filled}
            complete={snapshot.complete}
            question={activity.question}
            targetSlot={targetSlot}
            canPlace={canPlace}
            renderer={renderer}
            onPlace={handlePlace}
          />
        )}
      </Stage>

      <aside
        aria-label="Wall controls"
        className={`flex shrink-0 flex-col gap-4 px-4 pb-4 ${
          floating
            ? // Full screen: the wall stays centered and the controls float in a corner card.
              `lg:absolute lg:bottom-6 lg:right-6 lg:z-10 lg:rounded-2xl lg:border lg:border-hairline lg:bg-paper lg:p-4 lg:shadow-float ${
                collapsed ? "lg:w-auto" : "lg:w-float-panel"
              }`
            : "lg:w-panel lg:justify-center lg:gap-8 lg:py-6 lg:pl-4 lg:pr-8"
        }`}
      >
        {showDetails && !snapshot.complete && (
          <div className="flex min-h-tray flex-col items-center justify-center gap-2 text-center lg:items-start lg:text-left">
            <div key={snapshot.filledCount} className="animate-pop-in">
              <Brick shape={snapshot.filledCount} ready={canPlace} onHover={setTargetSlot} onDrop={handlePlace} />
            </div>
            <p className="text-sm text-muted" aria-live="polite">
              {round.passing ? "Pass the dove. Wait for the music to stop." : "Drag the brick to an empty spot."}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-col lg:items-start lg:justify-start">
          <div className="flex flex-wrap items-center gap-2">
            {!snapshot.complete && (
              <Button variant="solid" onClick={round.toggle} aria-pressed={round.passing} className="min-w-24">
                <Icon path={round.passing ? ICONS.stop : ICONS.play} filled />
                {round.passing ? "Stop" : "Play"}
              </Button>
            )}
            {showDetails && (
              <Button onClick={handleReset}>{snapshot.complete ? "Build again" : "Reset"}</Button>
            )}
            <Button
              onClick={fullscreen.active ? fullscreen.exit : fullscreen.enter}
              aria-label={fullscreen.active ? "Leave full screen" : "Full screen"}
              title={fullscreen.active ? "Leave full screen" : "Full screen"}
              className="px-0"
            >
              <Icon path={fullscreen.active ? ICONS.leaveFullscreen : ICONS.enterFullscreen} />
            </Button>
            {floating && (
              <Button
                onClick={() => setCollapsed((value) => !value)}
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Show controls" : "Hide controls"}
                title={collapsed ? "Show controls" : "Hide controls"}
                className="px-0"
              >
                <Icon path={collapsed ? ICONS.expand : ICONS.collapse} />
              </Button>
            )}
          </div>
          {showDetails && !snapshot.complete && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Pieces</span>
              <PieceCountPicker counts={activity.pieceCounts} value={snapshot.pieceCount} onChange={handlePieceCount} />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
