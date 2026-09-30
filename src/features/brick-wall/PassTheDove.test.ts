import { describe, expect, it, vi } from "vitest";
import { PassTheDove } from "./PassTheDove";

describe("PassTheDove", () => {
  it("starts stopped, passes on play and stops on stop", () => {
    const round = new PassTheDove();
    expect(round.getSnapshot()).toBe("stopped");
    round.play();
    expect(round.getSnapshot()).toBe("passing");
    round.stop();
    expect(round.getSnapshot()).toBe("stopped");
  });

  it("only notifies when the phase really changes", () => {
    const round = new PassTheDove();
    const listener = vi.fn();
    round.subscribe(listener);
    round.stop();
    round.toggle();
    round.play();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
