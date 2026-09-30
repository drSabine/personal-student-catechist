"use client";

import { memo, useEffect, useRef } from "react";
import type { HalftoneRenderer } from "@/core/image/HalftoneRenderer";
import type { PieceBounds } from "@/core/image/ImageSlicer";
import { readToken } from "@/lib/tokens";

export interface SlotBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface SlotProps {
  piece: PieceBounds;
  box: SlotBox;
  filled: boolean;
  /** A brick is being dragged over this slot. */
  targeted: boolean;
  renderer: HalftoneRenderer | null;
  cells: number;
  onPlace: (slot: number) => void;
}

/** One spot in the wall: a numbered outline, or its piece of the photo in halftone. */
export const Slot = memo(function Slot({ piece, box, filled, targeted, renderer, cells, onPlace }: SlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!filled || !renderer || !canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    renderer.renderPiece(ctx, piece, box.width, box.height, {
      ink: readToken("--color-ink"),
      paper: readToken("--color-wash"),
      cells,
    });
  }, [filled, renderer, piece, box.width, box.height, cells]);

  // Free the canvas memory when the slot is emptied or removed.
  useEffect(() => {
    const canvas = canvasRef.current;
    return () => {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [filled]);

  const position = { left: box.left, top: box.top, width: box.width, height: box.height };

  if (filled) {
    return (
      <div data-slot={piece.index} data-empty="false" className="absolute" style={position}>
        <canvas ref={canvasRef} aria-hidden className="block size-full animate-settle bg-wash" />
      </div>
    );
  }

  // Only the right and bottom edges are drawn; the wall draws its top and left.
  return (
    <button
      type="button"
      data-slot={piece.index}
      data-empty="true"
      onClick={() => onPlace(piece.index)}
      aria-label={`Empty spot ${piece.index + 1}. Place the brick here.`}
      className={`absolute flex cursor-pointer items-center justify-center border-b-2 border-r-2 border-dashed transition-colors ${
        targeted ? "border-gold bg-gold/15" : "border-ink/25 hover:bg-coral/10 focus-visible:bg-coral/10"
      }`}
      style={position}
    >
      <span aria-hidden className="pointer-events-none select-none text-slot font-medium tabular-nums text-ink/35">
        {piece.index + 1}
      </span>
    </button>
  );
});
