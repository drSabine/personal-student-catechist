import { describe, expect, it } from "vitest";
import { planCamera } from "./camera";

const town = { width: 416, height: 256 };

describe("planCamera", () => {
  it("fills a 1080p TV with a whole-number zoom", () => {
    expect(planCamera({ width: 1920, height: 1080 }, town, 16, 1, 24)).toEqual({ zoom: 4, follow: false });
  });

  it("fills a 768p laptop in full screen", () => {
    expect(planCamera({ width: 1366, height: 768 }, town, 16, 1, 24)).toEqual({ zoom: 3, follow: false });
  });

  it("keeps a fractional zoom below 2 so the map is not halved", () => {
    expect(planCamera({ width: 780, height: 500 }, town, 16, 1, 24).zoom).toBeCloseTo(1.875);
  });

  it("follows the pupil when the whole map would be too small to read", () => {
    // A phone: 375 CSS pixels wide at 3 device pixels each.
    expect(planCamera({ width: 1125, height: 1500 }, town, 16, 3, 24)).toEqual({ zoom: 5, follow: true });
  });
});
