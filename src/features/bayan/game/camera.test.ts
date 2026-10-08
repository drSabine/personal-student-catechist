import { describe, expect, it } from "vitest";
import { planCamera } from "./camera";

const town = { width: 512, height: 352 };
const world = { width: 1024, height: 576 };

/** How much of the view the world covers at a plan's zoom. */
function covered(view: { width: number; height: number }, zoom: number) {
  return world.width * zoom >= view.width && world.height * zoom >= view.height;
}

describe("planCamera", () => {
  it("fills a 1080p TV with a whole-number zoom", () => {
    expect(planCamera({ width: 1920, height: 1080 }, town, 16, 1, 24, world)).toEqual({ zoom: 3, follow: false });
  });

  it("fills a 768p laptop in full screen", () => {
    expect(planCamera({ width: 1366, height: 768 }, town, 16, 1, 24, world)).toEqual({ zoom: 2, follow: false });
  });

  it("keeps a fractional zoom below 2 so the map is not halved", () => {
    expect(planCamera({ width: 780, height: 500 }, town, 16, 1, 16).zoom).toBeCloseTo(1.42, 2);
  });

  it("never shows past the world's edge in a wide box on a 1080p screen", () => {
    // The game area beside the menu, not full screen, at 100% and 125% scaling.
    for (const view of [
      { width: 1550, height: 760 },
      { width: 1937, height: 950 },
      { width: 2400, height: 700 },
    ]) {
      const plan = planCamera(view, town, 16, 1, 24, world);
      expect(covered(view, plan.zoom), `${view.width}x${view.height}`).toBe(true);
    }
  });

  it("follows the pupil when the whole map would be too small to read", () => {
    // A phone: 375 CSS pixels wide at 3 device pixels each.
    expect(planCamera({ width: 1125, height: 2436 }, town, 16, 3, 24, world)).toEqual({ zoom: 5, follow: true });
  });
});
