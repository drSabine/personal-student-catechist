import { StoryActivity, type StoryRules } from "@/features/storybook/StoryActivity";
import type { StoryGame } from "@/features/storybook/StoryGame";
import type { GiftsContent } from "./content";
import { initialProgress, sanitizeProgress, step, type Action, type Progress } from "./rules";

export type GiftsGame = StoryGame<Progress, Action>;

/** Gift Quest: spell each gift, choose its good use, and build the barangay picture. */
export class GiftsActivity extends StoryActivity<GiftsContent, Progress, Action> {
  static readonly TYPE = "gifts";

  readonly type = GiftsActivity.TYPE;

  protected makeRules(): StoryRules<Progress, Action> {
    const { rounds } = this.content;
    return {
      version: 1,
      initial: initialProgress,
      sanitize: (raw) => sanitizeProgress(raw, rounds),
      step: (progress, action) => step(progress, action, rounds),
      reset: { type: "reset" },
      isDone: (progress) => progress.phase === "prompt",
    };
  }
}
