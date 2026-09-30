import { Activity, type ActivityInit } from "@/core/activity/Activity";

export interface BrickWallPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface BrickWallInit extends ActivityInit {
  photo: BrickWallPhoto;
  /** Question shown after the full photo appears. */
  question: string;
  pieceCounts?: readonly number[];
  defaultPieceCount?: number;
  /** Picks the brick pattern. Change it for a different mix of squares, lying, and standing bricks. */
  layoutSeed?: number;
  /** Halftone dots across the whole photo. More dots, finer print. */
  halftoneCells?: number;
}

export interface BrickWallSnapshot {
  pieceCount: number;
  filled: readonly boolean[];
  filledCount: number;
  complete: boolean;
}

/**
 * "Build Our Wall": pupils place one brick at a time into empty slots.
 * Slot i always reveals piece i of the photo, so the order never matters.
 */
export class BrickWallActivity extends Activity<BrickWallSnapshot> {
  static readonly TYPE = "brick-wall";
  static readonly DEFAULT_PIECE_COUNTS: readonly number[] = [6, 8, 10];

  readonly type = BrickWallActivity.TYPE;
  readonly photo: BrickWallPhoto;
  readonly question: string;
  readonly pieceCounts: readonly number[];
  readonly layoutSeed: number;
  readonly halftoneCells: number;

  private count: number;
  private filled: boolean[];

  constructor(init: BrickWallInit) {
    super(init);
    this.photo = init.photo;
    this.question = init.question;
    this.pieceCounts = init.pieceCounts ?? BrickWallActivity.DEFAULT_PIECE_COUNTS;
    this.layoutSeed = init.layoutSeed ?? 1;
    this.halftoneCells = init.halftoneCells ?? 72;

    for (const n of this.pieceCounts) {
      if (!Number.isInteger(n) || n < 2) {
        throw new Error(`Piece counts must be whole numbers of at least 2, got ${n}.`);
      }
    }
    const start = init.defaultPieceCount ?? this.pieceCounts[0];
    if (!this.pieceCounts.includes(start)) {
      throw new Error(`Default piece count ${start} is not one of ${this.pieceCounts.join(", ")}.`);
    }

    this.count = start;
    this.filled = new Array<boolean>(start).fill(false);
  }

  get pieceCount(): number {
    return this.count;
  }

  get filledCount(): number {
    return this.filled.filter(Boolean).length;
  }

  isFilled(slot: number): boolean {
    return this.filled[slot] === true;
  }

  /** Puts a brick in a slot. Returns false if the slot is taken or does not exist. */
  place(slot: number): boolean {
    if (!Number.isInteger(slot) || slot < 0 || slot >= this.count) return false;
    if (this.filled[slot]) return false;
    this.filled[slot] = true;
    this.notify();
    return true;
  }

  /** Changes the number of pieces and starts the wall over. */
  setPieceCount(count: number): boolean {
    if (!this.pieceCounts.includes(count)) return false;
    this.count = count;
    this.filled = new Array<boolean>(count).fill(false);
    this.notify();
    return true;
  }

  isComplete(): boolean {
    return this.filled.every(Boolean);
  }

  reset(): void {
    this.filled = new Array<boolean>(this.count).fill(false);
    this.notify();
  }

  protected createSnapshot(): BrickWallSnapshot {
    return {
      pieceCount: this.count,
      filled: [...this.filled],
      filledCount: this.filledCount,
      complete: this.isComplete(),
    };
  }
}
