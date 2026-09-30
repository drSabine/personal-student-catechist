"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { HalftoneRenderer } from "@/core/image/HalftoneRenderer";
import type { PieceBounds } from "@/core/image/ImageSlicer";
import type { BrickWallPhoto } from "./BrickWallActivity";
import { Slot, type SlotBox } from "./Slot";

interface WallProps {
  photo: BrickWallPhoto;
  pieces: readonly PieceBounds[];
  width: number;
  height: number;
  cells: number;
  filled: readonly boolean[];
  complete: boolean;
  /** Shown across the bottom of the photo once it is in full color. */
  question: string;
  targetSlot: number | null;
  renderer: HalftoneRenderer | null;
  onPlace: (slot: number) => void;
}

/** The wall: slots over the photo, which fades in to full color once every slot is filled. */
export function Wall({
  photo,
  pieces,
  width,
  height,
  cells,
  filled,
  complete,
  question,
  targetSlot,
  renderer,
  onPlace,
}: WallProps) {
  // Whole-pixel boxes with shared edges, so the pieces meet with no seams.
  const boxes = useMemo<SlotBox[]>(() => {
    const sx = width / photo.width;
    const sy = height / photo.height;
    return pieces.map((piece) => {
      const left = Math.round(piece.x * sx);
      const top = Math.round(piece.y * sy);
      return {
        left,
        top,
        width: Math.round((piece.x + piece.width) * sx) - left,
        height: Math.round((piece.y + piece.height) * sy) - top,
      };
    });
  }, [pieces, width, height, photo.width, photo.height]);

  const started = filled.some(Boolean);

  return (
    <div
      className={`@container relative box-content border-l-2 border-t-2 border-dashed ${
        complete ? "border-transparent" : "border-ink/25"
      }`}
      style={{ width, height }}
    >
      {pieces.map((piece, i) => (
        <Slot
          key={piece.index}
          piece={piece}
          box={boxes[i]}
          filled={filled[i] === true}
          targeted={targetSlot === piece.index}
          renderer={renderer}
          cells={cells}
          onPlace={onPlace}
        />
      ))}

      {/* The color photo loads after the first brick, well before it is needed. */}
      {started && (
        <Image
          src={photo.src}
          alt={complete ? photo.alt : ""}
          aria-hidden={!complete}
          fill
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="pointer-events-none select-none object-cover transition-opacity ease-(--ease-soft)"
          style={{
            opacity: complete ? 1 : 0,
            transitionDuration: complete ? "var(--reveal-duration)" : "var(--duration-quick)",
            transitionDelay: complete ? "var(--reveal-delay)" : "0ms",
          }}
        />
      )}

      {complete && (
        <p
          className="absolute inset-x-0 bottom-0 animate-rise-in bg-paper p-caption text-center font-mono text-question font-medium text-ink"
          style={{ animationDelay: "var(--question-delay)" }}
        >
          {question}
        </p>
      )}
    </div>
  );
}
