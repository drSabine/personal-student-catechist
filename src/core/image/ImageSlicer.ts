export type BrickOrientation = "horizontal" | "vertical";

export interface PieceBounds {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: BrickOrientation;
}

export interface SliceOptions {
  /** Same seed, same layout. Change it for a different pattern. */
  seed?: number;
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A brick must be at least this much longer than it is wide, so it reads as lying or standing. */
const MIN_STRETCH = 1.3;
/** And no thinner than this, so no piece becomes a sliver. */
const MAX_STRETCH = 4;
const ATTEMPTS = 400;

/**
 * Cuts an image into bricks that are either lying (horizontal) or standing (vertical),
 * mixed together. Filling one area never uncovers a whole band of the picture,
 * so pupils cannot guess it too early.
 *
 * Every cut goes all the way across its part, so the bricks cover the image exactly
 * with no gaps or overlap. Edges are whole pixels and shared between neighbours.
 * Bricks are numbered top to bottom, then left to right.
 */
export class ImageSlicer {
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    if (!isPositiveInteger(width) || !isPositiveInteger(height)) {
      throw new Error("Image size must be positive whole numbers.");
    }
  }

  slice(count: number, { seed = 1 }: SliceOptions = {}): PieceBounds[] {
    if (!isPositiveInteger(count)) {
      throw new Error("Piece count must be a positive whole number.");
    }

    // Try seeded layouts until one has only clear bricks, in both directions.
    // Deterministic: the same seed and count always give the same bricks.
    let best: Rect[] = [];
    let bestScore = -Infinity;
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      const random = seededRandom(seed * 1000 + count * 37 + attempt);
      const rects = this.split({ x0: 0, y0: 0, x1: 1, y1: 1 }, count, random);
      const score = this.score(rects);
      if (score > bestScore) {
        best = rects;
        bestScore = score;
      }
      if (score >= 0) break;
    }

    return best
      .map((rect) => this.toPixels(rect))
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((piece, index) => ({ ...piece, index }));
  }

  /** Splits a part into `count` bricks, cutting across it at a random place and direction. */
  private split(rect: Rect, count: number, random: () => number): Rect[] {
    if (count === 1) return [rect];
    const first = 1 + Math.floor(random() * (count - 1));
    const share = (first / count) * (0.85 + random() * 0.3);
    const across = random() < 0.5;
    const [a, b] = across
      ? [
          { ...rect, x1: rect.x0 + (rect.x1 - rect.x0) * share },
          { ...rect, x0: rect.x0 + (rect.x1 - rect.x0) * share },
        ]
      : [
          { ...rect, y1: rect.y0 + (rect.y1 - rect.y0) * share },
          { ...rect, y0: rect.y0 + (rect.y1 - rect.y0) * share },
        ];
    return [...this.split(a, first, random), ...this.split(b, count - first, random)];
  }

  /** 0 or more when every brick is clearly lying or standing and both kinds appear. */
  private score(rects: Rect[]): number {
    let worst = Infinity;
    let lying = 0;
    let standing = 0;
    for (const rect of rects) {
      const w = (rect.x1 - rect.x0) * this.width;
      const h = (rect.y1 - rect.y0) * this.height;
      const stretch = Math.max(w, h) / Math.min(w, h);
      if (w > h) lying++;
      else standing++;
      // Positive when inside the allowed range, negative when too square or too thin.
      worst = Math.min(worst, stretch - MIN_STRETCH, MAX_STRETCH - stretch);
    }
    const mixed = rects.length < 2 || (lying > 0 && standing > 0);
    return mixed ? worst : worst - 10;
  }

  private toPixels(rect: Rect): Omit<PieceBounds, "index"> {
    const x = Math.round(rect.x0 * this.width);
    const y = Math.round(rect.y0 * this.height);
    const width = Math.round(rect.x1 * this.width) - x;
    const height = Math.round(rect.y1 * this.height) - y;
    return { x, y, width, height, orientation: width >= height ? "horizontal" : "vertical" };
  }
}

/** Small repeatable random numbers (mulberry32). */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}
