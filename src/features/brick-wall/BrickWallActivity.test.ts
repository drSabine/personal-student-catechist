import { describe, expect, it, vi } from "vitest";
import { BrickWallActivity, type BrickWallInit } from "./BrickWallActivity";

const init: BrickWallInit = {
  id: "wall",
  title: "Build Our Wall",
  instructions: "Place one brick.",
  question: "Who built this?",
  photo: { src: "/x.jpg", width: 736, height: 736, alt: "" },
};

function make(overrides: Partial<BrickWallInit> = {}): BrickWallActivity {
  return new BrickWallActivity({ ...init, ...overrides });
}

describe("BrickWallActivity", () => {
  it("starts empty with the first piece count", () => {
    const wall = make();
    expect(wall.pieceCount).toBe(6);
    expect(wall.filledCount).toBe(0);
    expect(wall.isComplete()).toBe(false);
  });

  it("places a brick in an empty slot", () => {
    const wall = make();
    expect(wall.place(3)).toBe(true);
    expect(wall.isFilled(3)).toBe(true);
    expect(wall.filledCount).toBe(1);
  });

  it("rejects a slot that is already filled", () => {
    const wall = make();
    wall.place(2);
    expect(wall.place(2)).toBe(false);
    expect(wall.filledCount).toBe(1);
  });

  it("rejects slots that do not exist", () => {
    const wall = make();
    expect(wall.place(-1)).toBe(false);
    expect(wall.place(6)).toBe(false);
    expect(wall.place(1.5)).toBe(false);
    expect(wall.filledCount).toBe(0);
  });

  it.each([6, 8, 10])("completes after all %i slots are filled, in any order", (count) => {
    const wall = make({ defaultPieceCount: count });
    const order = Array.from({ length: count }, (_, i) => count - 1 - i);
    order.forEach((slot, n) => {
      expect(wall.isComplete()).toBe(false);
      expect(wall.place(slot)).toBe(true);
      expect(wall.filledCount).toBe(n + 1);
    });
    expect(wall.isComplete()).toBe(true);
    expect(wall.getSnapshot().complete).toBe(true);
  });

  it("reset clears the wall and keeps the piece count", () => {
    const wall = make({ defaultPieceCount: 8 });
    wall.place(0);
    wall.place(5);
    wall.reset();
    expect(wall.pieceCount).toBe(8);
    expect(wall.filledCount).toBe(0);
    expect(wall.isFilled(0)).toBe(false);
  });

  it("changing the piece count starts over", () => {
    const wall = make();
    wall.place(0);
    expect(wall.setPieceCount(10)).toBe(true);
    expect(wall.pieceCount).toBe(10);
    expect(wall.filledCount).toBe(0);
    expect(wall.getSnapshot().filled).toHaveLength(10);
  });

  it("refuses piece counts that are not offered", () => {
    const wall = make();
    expect(wall.setPieceCount(7)).toBe(false);
    expect(wall.setPieceCount(12)).toBe(false);
    expect(wall.pieceCount).toBe(6);
  });

  it("refuses impossible or unknown counts in its setup", () => {
    expect(() => make({ pieceCounts: [6, 1] })).toThrow();
    expect(() => make({ pieceCounts: [6, 7.5] })).toThrow();
    expect(() => make({ defaultPieceCount: 12 })).toThrow();
  });

  it("tells listeners about changes and keeps snapshots stable in between", () => {
    const wall = make();
    const listener = vi.fn();
    wall.subscribe(listener);
    const before = wall.getSnapshot();
    expect(wall.getSnapshot()).toBe(before);
    wall.place(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(wall.getSnapshot()).not.toBe(before);
    wall.place(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
