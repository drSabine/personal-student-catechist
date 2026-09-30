"use client";

import { useRef, useState, type PointerEvent } from "react";

interface BrickProps {
  /** Picks one of a few brick shapes, so each new brick looks different. */
  shape: number;
  ready: boolean;
  /** Called when the brick moves over a new empty slot, or off all slots. */
  onHover: (slot: number | null) => void;
  /** Called when the brick is let go over an empty slot. */
  onDrop: (slot: number) => void;
}

/** Width and height multipliers of the base brick: some lie flat, some stand up, like the wall. */
const SHAPES: readonly (readonly [number, number])[] = [
  [1, 1],
  [0.5, 1.9],
  [1.2, 0.9],
  [0.55, 1.7],
  [0.9, 1.1],
];

/** Finds the empty slot under a point on the screen. */
function emptySlotAt(x: number, y: number): number | null {
  for (const element of document.elementsFromPoint(x, y)) {
    const slot = element.closest<HTMLElement>("[data-slot]");
    if (slot) {
      return slot.dataset.empty === "true" ? Number(slot.dataset.slot) : null;
    }
  }
  return null;
}

/**
 * The one brick at the bottom. Drag it with a mouse or a finger.
 * Pointer events cover both, and touch-action: none keeps the page from scrolling.
 */
export function Brick({ shape, ready, onHover, onDrop }: BrickProps) {
  const start = useRef({ x: 0, y: 0 });
  const hovered = useRef<number | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

  function hover(slot: number | null) {
    if (slot !== hovered.current) {
      hovered.current = slot;
      onHover(slot);
    }
  }

  function handleDown(event: PointerEvent<HTMLDivElement>) {
    if (!ready || event.button > 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = { x: event.clientX, y: event.clientY };
    setOffset({ x: 0, y: 0 });
  }

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (!offset) return;
    setOffset({ x: event.clientX - start.current.x, y: event.clientY - start.current.y });
    hover(emptySlotAt(event.clientX, event.clientY));
  }

  function handleUp(event: PointerEvent<HTMLDivElement>) {
    if (!offset) return;
    const slot = emptySlotAt(event.clientX, event.clientY);
    hover(null);
    setOffset(null);
    if (slot !== null) onDrop(slot);
  }

  function handleCancel() {
    hover(null);
    setOffset(null);
  }

  const [w, h] = SHAPES[Math.abs(shape) % SHAPES.length];
  const dragging = offset !== null;

  return (
    <div
      role="img"
      aria-label={ready ? "Brick. Drag it to an empty spot, or tap a spot." : "Brick. Waiting for the music to stop."}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      className={`relative touch-none select-none rounded-md bg-coral inset-shadow-brick ${
        ready ? "cursor-grab active:cursor-grabbing" : "opacity-30"
      } ${dragging ? "z-50" : "transition-transform duration-300 ease-(--ease-soft)"}`}
      style={{
        width: `calc(var(--brick-width) * ${w})`,
        height: `calc(var(--brick-height) * ${h})`,
        transform: offset ? `translate(${offset.x}px, ${offset.y}px) scale(1.05)` : undefined,
      }}
    >
      <span aria-hidden className="absolute left-1/8 top-1/5 h-1/7 w-1/5 rounded-xs bg-paper/35" />
    </div>
  );
}
