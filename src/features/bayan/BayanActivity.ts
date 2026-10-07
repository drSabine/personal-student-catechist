import { Activity, type ActivityInit } from "@/core/activity/Activity";
import { initialProgress, type BayanProgress } from "./BayanRules";
import type { BayanContent } from "./content";
import { getBayanSession, type BayanSession } from "./session";

export type SoundName =
  | "music"
  | "talk"
  | "blip"
  | "pop"
  | "right"
  | "wrong"
  | "sparkle"
  | "hammer"
  | "rise"
  | "build"
  | "cheer"
  | "stage"
  | "door"
  | "cluck"
  | "bark"
  | "meow"
  | "quack";

/** Files under public/. Map positions live in the Tiled maps, never in code. */
export interface BayanAssets {
  townMap: string;
  churchMap: string;
  tiles: { town: string; dungeon: string; extra: string };
  /** Sprite sheet with one row per person: standing, then a step. */
  people: string;
  /** Person name to row in the people sheet. */
  peopleIndex: string;
  /** Name to frame in the extra sheet, for markers, animals, and effects. */
  extraIndex: string;
  cloud: string;
  sounds: Readonly<Record<SoundName, string>>;
}

export interface BayanInit extends ActivityInit {
  content: BayanContent;
  assets: BayanAssets;
}

/**
 * Build Our Bayan: a town the class builds by finding its leaders. The rules live in BayanRules,
 * the story in Director, and the progress in a store saved to the server.
 */
export class BayanActivity extends Activity<BayanProgress> {
  static readonly TYPE = "bayan";

  readonly type = BayanActivity.TYPE;
  readonly content: BayanContent;
  readonly assets: BayanAssets;
  private session: BayanSession | null = null;

  constructor(init: BayanInit) {
    super(init);
    this.content = init.content;
    this.assets = init.assets;
  }

  /** The game's shared state. Browser only. */
  sessionFor(lessonId: string): BayanSession {
    this.session ??= getBayanSession(lessonId, this.id, this.content);
    return this.session;
  }

  reset(): void {
    this.session?.director.reset();
  }

  isComplete(): boolean {
    return this.session?.saved.getState().progress.closingSeen ?? false;
  }

  protected createSnapshot(): BayanProgress {
    return this.session?.saved.getState().progress ?? initialProgress();
  }
}
