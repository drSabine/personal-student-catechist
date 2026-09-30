import { Activity, type ActivityInit } from "@/core/activity/Activity";
import { ImageSlicer, layingOrder, type PieceBounds } from "@/core/image/ImageSlicer";

export interface BrickWallPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface BrickWallInit extends ActivityInit {
  photo: BrickWallPhoto;
  /** Shown after the full photo appears. */
  question: string;
  /** Number of bricks. Default 6. */
  pieceCount?: number;
  /** Spot numbers (1 is top left) in the order the bricks are laid. Default: bottom course first. */
  order?: readonly number[];
  /** Picks the brick pattern. */
  layoutSeed?: number;
  /** Halftone dots across the photo. */
  halftoneCells?: number;
}

/** The brick in the tray and the spot it fits. */
export interface NextBrick {
  slot: number;
  /** Shown on the brick and on its spot. */
  number: number;
  /** Width over height of the spot. */
  aspect: number;
  /** Relative to the biggest brick, 0.5 to 1. */
  size: number;
}

export interface BrickWallSnapshot {
  filled: readonly boolean[];
  filledCount: number;
  complete: boolean;
  /** Null once complete. */
  next: NextBrick | null;
}

const DEFAULT_PIECE_COUNT = 6;
const MIN_BRICK_SIZE = 0.5;

/**
 * Build Our Wall: bricks are laid one at a time in a fixed order, and each fits only its own
 * slot. Slot i always shows piece i of the photo.
 */
export class BrickWallActivity extends Activity<BrickWallSnapshot> {
  static readonly TYPE = "brick-wall";

  readonly type = BrickWallActivity.TYPE;
  readonly photo: BrickWallPhoto;
  readonly question: string;
  readonly layoutSeed: number;
  readonly halftoneCells: number;
  readonly pieces: readonly PieceBounds[];

  /** Slot indices in laying order. */
  private readonly order: readonly number[];
  private readonly biggestArea: number;
  private filled: boolean[];

  constructor(init: BrickWallInit) {
    super(init);
    this.photo = init.photo;
    this.question = init.question;
    this.layoutSeed = init.layoutSeed ?? 1;
    this.halftoneCells = init.halftoneCells ?? 72;

    const count = init.pieceCount ?? DEFAULT_PIECE_COUNT;
    if (!Number.isInteger(count) || count < 2) {
      throw new Error(`Piece count must be a whole number of at least 2, got ${count}.`);
    }
    this.pieces = new ImageSlicer(this.photo.width, this.photo.height).slice(count, { seed: this.layoutSeed });
    this.order = init.order ? slotsFromNumbers(init.order, count) : layingOrder(this.pieces);
    this.biggestArea = Math.max(...this.pieces.map((piece) => piece.width * piece.height));
    this.filled = new Array<boolean>(count).fill(false);
  }

  get filledCount(): number {
    return this.filled.filter(Boolean).length;
  }

  /** The slot the tray brick fits, or null when complete. */
  get nextSlot(): number | null {
    return this.order[this.filledCount] ?? null;
  }

  /** Lays the brick. Only its own slot accepts it. */
  place(slot: number): boolean {
    if (slot !== this.nextSlot) return false;
    this.filled[slot] = true;
    this.notify();
    return true;
  }

  isComplete(): boolean {
    return this.filled.every(Boolean);
  }

  reset(): void {
    this.filled = new Array<boolean>(this.pieces.length).fill(false);
    this.notify();
  }

  protected createSnapshot(): BrickWallSnapshot {
    return {
      filled: [...this.filled],
      filledCount: this.filledCount,
      complete: this.isComplete(),
      next: this.nextBrick(),
    };
  }

  private nextBrick(): NextBrick | null {
    const slot = this.nextSlot;
    if (slot === null) return null;
    const piece = this.pieces[slot];
    return {
      slot,
      number: slot + 1,
      aspect: piece.width / piece.height,
      size: Math.max(MIN_BRICK_SIZE, Math.sqrt((piece.width * piece.height) / this.biggestArea)),
    };
  }
}

/** Spot numbers (1-based) to slot indices. Each number from 1 to count must appear once. */
function slotsFromNumbers(numbers: readonly number[], count: number): number[] {
  const valid =
    numbers.length === count &&
    new Set(numbers).size === count &&
    numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= count);
  if (!valid) throw new Error(`Order must list each spot number from 1 to ${count} once, got ${numbers.join(", ")}.`);
  return numbers.map((n) => n - 1);
}
