import { StoryActivity, type StoryRules } from "@/features/storybook/StoryActivity";
import type { StoryGame } from "@/features/storybook/StoryGame";
import type { BayanihanContent } from "./content";
import { initialProgress, sanitizeProgress, step, type Action, type Progress } from "./rules";

export type BayanihanGame = StoryGame<Progress, Action>;

/** Bayanihan Crew: the leader gives each friend the job that fits their gift, in three places. */
export class BayanihanActivity extends StoryActivity<BayanihanContent, Progress, Action> {
  static readonly TYPE = "bayanihan";

  readonly type = BayanihanActivity.TYPE;

  protected makeRules(): StoryRules<Progress, Action> {
    const scenarios = this.content.scenarios.length;
    return {
      version: 1,
      initial: initialProgress,
      sanitize: (raw) => sanitizeProgress(raw, scenarios),
      step: (progress, action) => step(progress, action, scenarios),
      reset: { type: "reset" },
      isDone: (progress) => progress.phase === "end",
    };
  }
}
