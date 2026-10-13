import { describe, expect, it } from "vitest";
import type { Expression, Hair } from "../cast";
import { faceMarkup } from "./faces";

const HAIRS: Hair[] = ["short1", "short3", "bun", "long", "mediumBangs", "pomp", "shaved2"];
const FACES: Expression[] = ["smile", "calm", "driven", "concerned", "smileBig", "lovingGrin1", "explaining"];

// The faces rewrite DiceBear's markup, so a DiceBear update that changes it should fail here, not on the TV.
describe("faces", () => {
  it.each(HAIRS)("draw %s in every expression with the person's own skin and shirt", (hair) => {
    for (const face of FACES) {
      const markup = faceMarkup(hair, face);
      expect(markup).toContain("var(--peep-skin)");
      expect(markup).toContain("var(--peep-shirt)");
      expect(markup).not.toMatch(/<svg|<mask|<metadata|aa000[12]/);
    }
  });

  it("are made once and kept", () => {
    expect(faceMarkup("bun", "smile")).toBe(faceMarkup("bun", "smile"));
  });
});
