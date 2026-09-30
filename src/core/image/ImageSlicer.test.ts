import { describe, expect, it } from "vitest";
import { ImageSlicer, layingOrder, type PieceBounds } from "./ImageSlicer";

function overlaps(a: PieceBounds, b: PieceBounds): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

const cases = [
  { width: 736, height: 736 },
  { width: 1200, height: 800 },
  { width: 600, height: 900 },
].flatMap((size) => [6, 8, 10].map((count) => ({ ...size, count })));

describe("ImageSlicer", () => {
  it.each(cases)("cuts $width x $height into $count bricks with no gaps or overlap", ({ width, height, count }) => {
    const pieces = new ImageSlicer(width, height).slice(count);

    expect(pieces).toHaveLength(count);
    pieces.forEach((piece, i) => {
      expect(piece.index).toBe(i);
      for (const value of [piece.x, piece.y, piece.width, piece.height]) {
        expect(Number.isInteger(value)).toBe(true);
      }
      expect(piece.x + piece.width).toBeLessThanOrEqual(width);
      expect(piece.y + piece.height).toBeLessThanOrEqual(height);
    });

    const area = pieces.reduce((sum, p) => sum + p.width * p.height, 0);
    expect(area).toBe(width * height);

    for (let a = 0; a < pieces.length; a++) {
      for (let b = a + 1; b < pieces.length; b++) {
        expect(overlaps(pieces[a], pieces[b])).toBe(false);
      }
    }
  });

  it.each(cases)("mixes squares, lying, and standing bricks of varied sizes for $width x $height, $count pieces", ({ width, height, count }) => {
    const pieces = new ImageSlicer(width, height).slice(count);
    for (const piece of pieces) {
      const stretch = Math.max(piece.width, piece.height) / Math.min(piece.width, piece.height);
      expect(stretch).toBeLessThanOrEqual(3.51);
    }
    expect(new Set(pieces.map((p) => p.shape))).toEqual(new Set(["square", "horizontal", "vertical"]));
    const areas = pieces.map((p) => p.width * p.height);
    expect(Math.max(...areas) / Math.min(...areas)).toBeGreaterThanOrEqual(2.2);
    // No slab bigger than two fair shares.
    expect(Math.max(...areas) / (width * height)).toBeLessThanOrEqual(2 / count + 0.001);
  });

  it("gives the same bricks every time, and different ones for another seed", () => {
    const slicer = new ImageSlicer(736, 736);
    expect(slicer.slice(8)).toEqual(slicer.slice(8));
    expect(slicer.slice(8, { seed: 2 })).not.toEqual(slicer.slice(8, { seed: 1 }));
  });

  it("numbers bricks top to bottom, then left to right", () => {
    const pieces = new ImageSlicer(736, 736).slice(10);
    for (let i = 1; i < pieces.length; i++) {
      const [a, b] = [pieces[i - 1], pieces[i]];
      expect(a.y < b.y || (a.y === b.y && a.x < b.x)).toBe(true);
    }
  });

  it.each(cases)("lays $count bricks bottom course first for $width x $height", ({ width, height, count }) => {
    const pieces = new ImageSlicer(width, height).slice(count);
    const order = layingOrder(pieces);

    expect([...order].sort((a, b) => a - b)).toEqual(pieces.map((p) => p.index));
    expect(layingOrder(pieces)).toEqual(order);

    const bottom = (index: number) => pieces[index].y + pieces[index].height;
    expect(bottom(order[0])).toBe(height);
    for (let i = 1; i < order.length; i++) {
      expect(bottom(order[i - 1])).toBeGreaterThanOrEqual(bottom(order[i]));
    }

    // Nothing is laid before a brick that sits directly under it.
    const position = (index: number) => order.indexOf(index);
    for (const above of pieces) {
      for (const below of pieces) {
        const sitsUnder = below.y === above.y + above.height && below.x < above.x + above.width && above.x < below.x + below.width;
        if (sitsUnder) expect(position(below.index)).toBeLessThan(position(above.index));
      }
    }
  });

  it("rejects bad sizes", () => {
    expect(() => new ImageSlicer(0, 10)).toThrow();
    expect(() => new ImageSlicer(10, 10).slice(0)).toThrow();
    expect(() => new ImageSlicer(10, 10).slice(2.5)).toThrow();
  });
});
