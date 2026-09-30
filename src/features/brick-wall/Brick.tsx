"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { NextBrick } from "./BrickWallActivity";

interface BrickProps {
  brick: NextBrick;
  /** Goes up each time the brick is dropped on the wrong spot, which shakes it. */
  nudge: number;
  /** Called when the brick moves over a new empty slot, or off all slots. */
  onHover: (slot: number | null) => void;
  /** Called when the brick is let go over an empty slot. */
  onDrop: (slot: number) => void;
}

/** How far the brick's center has moved, and how much it grew to match its spot. */
interface Drag {
  x: number;
  y: number;
  scale: number;
}

/** Finds the empty slot under a point on the screen. */
function emptySlotAt(x: number, y: number): number | null {
  for (const element of document.elementsFromPoint(x, y)) {
    const slot = element.closest<HTMLElement>("[data-slot]");
    if (slot) return slot.dataset.empty === "true" ? Number(slot.dataset.slot) : null;
  }
  return null;
}

/**
 * The tray brick. It rests small, fitted to the tray (a size container, so every brick fills
 * the same box). Picked up, it grows to its spot's exact size and its center follows the pointer.
 */
export function Brick({ brick, nudge, onHover, onDrop }: BrickProps) {
  const center = useRef({ x: 0, y: 0 });
  const hovered = useRef<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  function hover(slot: number | null) {
    if (slot !== hovered.current) {
      hovered.current = slot;
      onHover(slot);
    }
  }

  function handleDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button > 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const own = event.currentTarget.getBoundingClientRect();
    const spot = document.querySelector<HTMLElement>(`[data-slot="${brick.slot}"]`)?.getBoundingClientRect();
    center.current = { x: own.left + own.width / 2, y: own.top + own.height / 2 };
    setDrag({
      x: event.clientX - center.current.x,
      y: event.clientY - center.current.y,
      scale: spot && own.width > 0 ? spot.width / own.width : 1,
    });
  }

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    setDrag({ ...drag, x: event.clientX - center.current.x, y: event.clientY - center.current.y });
    hover(emptySlotAt(event.clientX, event.clientY));
  }

  function handleUp(event: PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    const slot = emptySlotAt(event.clientX, event.clientY);
    handleCancel();
    if (slot !== null) onDrop(slot);
  }

  function handleCancel() {
    hover(null);
    setDrag(null);
  }

  return (
    <div
      role="img"
      aria-label={`Brick ${brick.number}. Drag it to spot ${brick.number}, or tap that spot.`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      className={`relative shrink-0 cursor-grab touch-none select-none active:cursor-grabbing ${drag ? "z-50" : ""}`}
      style={{
        width: `min(calc(100cqw * ${brick.size}), calc(100cqh * ${brick.size} * ${brick.aspect}))`,
        aspectRatio: brick.aspect,
        transform: drag ? `translate(${drag.x}px, ${drag.y}px)` : undefined,
      }}
    >
      {/* Separate layers, so growing, dragging, and shaking never fight over one transform. */}
      <div
        className={`size-full transition-transform duration-200 ease-(--ease-soft) ${drag ? "opacity-90" : ""}`}
        style={{ transform: drag ? `scale(${drag.scale})` : undefined }}
      >
        <div
          key={nudge}
          className={`relative flex size-full items-center justify-center rounded-md bg-coral shadow-brick ${
            nudge > 0 ? "animate-nudge" : ""
          }`}
        >
          <span aria-hidden className="absolute left-1/8 top-1/5 h-1/7 w-1/5 rounded-xs bg-paper/35" />
          <span aria-hidden className="absolute bottom-1/5 right-1/8 size-1.5 rounded-full bg-ink/15" />
          <span aria-hidden className="absolute bottom-1/3 right-1/4 size-1 rounded-full bg-ink/15" />
          <span aria-hidden className="text-sm font-semibold tabular-nums text-ink/70">
            {brick.number}
          </span>
        </div>
      </div>
    </div>
  );
}
