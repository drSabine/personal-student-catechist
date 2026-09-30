import { describe, expect, it } from "vitest";
import { HalftoneRenderer } from "./HalftoneRenderer";

function solid(width: number, height: number, value: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
  return data;
}

describe("HalftoneRenderer.averageDarkness", () => {
  it("reads white as 0 and black as 1", () => {
    const white = new HalftoneRenderer({ width: 4, height: 4, data: solid(4, 4, 255) });
    const black = new HalftoneRenderer({ width: 4, height: 4, data: solid(4, 4, 0) });
    expect(white.averageDarkness(0, 0, 4, 4)).toBeCloseTo(0);
    expect(black.averageDarkness(0, 0, 4, 4)).toBeCloseTo(1);
  });

  it("averages only the asked area", () => {
    const data = solid(4, 2, 255);
    // Paint the left half black.
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const i = (y * 4 + x) * 4;
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
    }
    const renderer = new HalftoneRenderer({ width: 4, height: 2, data });
    expect(renderer.averageDarkness(0, 0, 2, 2)).toBeCloseTo(1);
    expect(renderer.averageDarkness(2, 0, 4, 2)).toBeCloseTo(0);
    expect(renderer.averageDarkness(0, 0, 4, 2)).toBeCloseTo(0.5);
    expect(renderer.averageDarkness(-5, -5, 50, 50)).toBeCloseTo(0.5);
  });

  it("reads a small copy in the photo's own coordinates", () => {
    // 4x2 samples standing in for an 800x400 photo; left half black.
    const data = solid(4, 2, 255);
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const i = (y * 4 + x) * 4;
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
    }
    const renderer = new HalftoneRenderer({ width: 4, height: 2, data }, { width: 800, height: 400 });
    expect(renderer.averageDarkness(0, 0, 400, 400)).toBeCloseTo(1);
    expect(renderer.averageDarkness(400, 0, 800, 400)).toBeCloseTo(0);
  });
});
