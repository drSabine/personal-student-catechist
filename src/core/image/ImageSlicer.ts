/** Squares, bricks lying flat, and bricks standing up. */
export type BrickShape = "square" | "horizontal" | "vertical";

export interface PieceBounds {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: BrickShape;
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

/** Longest side over shortest side. At or below this, a piece reads as a square. */
const SQUARE_STRETCH = 1.2;
/** At or above this, a piece clearly lies flat or stands up. */
const BRICK_STRETCH = 1.5;
/** No piece thinner than this, so none becomes a sliver. */
const MAX_STRETCH = 3.5;
/** The biggest piece is at least this many times the smallest, so sizes vary too. */
const MIN_SIZE_SPREAD = 2.2;
/** But no piece may cover more than this many fair shares, so no single slab gives the picture away. */
const MAX_FAIR_SHARES = 2;
const ATTEMPTS = 600;

/**
 * Cuts an image into a mix of squares, lying bricks, and standing bricks of different sizes.
 * Filling one area never uncovers a whole band of the picture, so pupils cannot guess it too early.
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

    // Try seeded layouts until one has every shape and a spread of sizes.
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
    // Cut near the fair share, but not exactly on it, so sizes vary.
    const share = Math.min(0.88, Math.max(0.12, (first / count) * (0.65 + random() * 0.7)));
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

  /** 0 or more when all three shapes appear, sizes vary, and nothing is a sliver. */
  private score(rects: Rect[]): number {
    const kinds = new Set<BrickShape>();
    let thinnest = 0;
    let smallest = Infinity;
    let largest = 0;
    for (const rect of rects) {
      const w = (rect.x1 - rect.x0) * this.width;
      const h = (rect.y1 - rect.y0) * this.height;
      const stretch = Math.max(w, h) / Math.min(w, h);
      if (stretch <= SQUARE_STRETCH) kinds.add("square");
      else if (stretch >= BRICK_STRETCH) kinds.add(w > h ? "horizontal" : "vertical");
      thinnest = Math.max(thinnest, stretch);
      smallest = Math.min(smallest, w * h);
      largest = Math.max(largest, w * h);
    }
    // How many shapes this many pieces can show: 1 piece is one shape, 2 pieces two, then all three.
    const missing = Math.min(3, rects.length) - kinds.size;
    const spread = rects.length >= 4 ? largest / smallest - MIN_SIZE_SPREAD : 0;
    const total = this.width * this.height;
    const slab = MAX_FAIR_SHARES - (largest / total) * rects.length;
    return Math.min(MAX_STRETCH - thinnest, spread, slab) - missing * 10;
  }

  private toPixels(rect: Rect): Omit<PieceBounds, "index"> {
    const x = Math.round(rect.x0 * this.width);
    const y = Math.round(rect.y0 * this.height);
    const width = Math.round(rect.x1 * this.width) - x;
    const height = Math.round(rect.y1 * this.height) - y;
    const stretch = Math.max(width, height) / Math.min(width, height);
    const shape: BrickShape = stretch <= SQUARE_STRETCH ? "square" : width > height ? "horizontal" : "vertical";
    return { x, y, width, height, shape };
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
