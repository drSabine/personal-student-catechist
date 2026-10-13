import { describe, expect, it } from "vitest";
import { edgesOf, piecePath } from "./jigsaw";

const COLS = 3;
const ROWS = 2;

describe("jigsaw pieces", () => {
  it("keep the picture's border straight", () => {
    for (let col = 0; col < COLS; col++) {
      expect(edgesOf(col, 0, COLS, ROWS).top).toBe(0);
      expect(edgesOf(col, ROWS - 1, COLS, ROWS).bottom).toBe(0);
    }
    for (let row = 0; row < ROWS; row++) {
      expect(edgesOf(0, row, COLS, ROWS).left).toBe(0);
      expect(edgesOf(COLS - 1, row, COLS, ROWS).right).toBe(0);
    }
  });

  it("fit their neighbors: a tab out on one side is a tab in on the other", () => {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 1; col++) {
        expect(edgesOf(col, row, COLS, ROWS).right).toBe(-edgesOf(col + 1, row, COLS, ROWS).left);
      }
    }
    for (let col = 0; col < COLS; col++) {
      expect(edgesOf(col, 0, COLS, ROWS).bottom).toBe(-edgesOf(col, 1, COLS, ROWS).top);
    }
  });

  it("draw a closed outline starting at the piece's corner", () => {
    const path = piecePath(1, 1, COLS, ROWS, 1200, 800);
    expect(path.startsWith("M400 400")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
  });
});
