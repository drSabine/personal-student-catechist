import type { ComponentType } from "react";
import type { WorkerGift } from "@/features/storybook/cast";

/** Every scene is drawn on a 1600 by 900 sheet. */
export const SCENE_WIDTH = 1600;
export const SCENE_HEIGHT = 900;

/** A point on the sheet. */
export interface Spot {
  x: number;
  y: number;
}

/** A rectangle on the sheet: x, y, width, height. */
export type Box = readonly [number, number, number, number];

interface JobArt {
  /** Where the job's tag is pinned. */
  spot: Spot;
  /** Where the worker stands to work, beside the mess. They walk here from the tag on Go. */
  stand: Spot;
  /** The part of the sheet the mess and the clean layer cover, so each is its own small picture. */
  box: Box;
  /** What needs doing, faded out while the worker works. None for the song. */
  Mess?: ComponentType;
  /** How it looks when done. `sign` is the words painted on the scene's sign or poster. */
  Clean?: ComponentType<{ sign: string }>;
}

/**
 * How a living part of the scene moves. drift: clouds sliding. sway: a tree in the wind, from its foot.
 * swing: a lamp on its chain, from the top. wave: a flag, from the pole. flicker: a flame.
 * fly: a bird crossing the sky. spin: a clock hand.
 */
export type Move = "drift" | "sway" | "swing" | "wave" | "flicker" | "fly" | "spin";

/** A small part of the scene that keeps moving, so the place feels alive. Plain fills only, since it moves. */
export interface Ambient {
  box: Box;
  move: Move;
  Art: ComponentType;
}

/** One scene's drawing: the still background, the parts that move, and a mess and a clean layer per job. */
export interface SceneArt {
  /** Drawn once and never again, so moving tokens never redraw it. */
  Backdrop: ComponentType;
  ambient: readonly Ambient[];
  jobs: Readonly<Record<WorkerGift, JobArt>>;
}
