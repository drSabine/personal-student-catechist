/** A game's saved state for one activity. The state is opaque JSON text the game reads back itself. */
export interface GameSave {
  readonly state: string;
  /** Milliseconds since 1970, set by the device that saved. The newer save wins. */
  readonly savedAt: number;
}

/** Which activity a save belongs to. */
export interface SaveSlot {
  lessonId: string;
  activityId: string;
}

/** Big enough for any game state here, small enough that nobody can fill the database. */
export const SAVE_LIMIT = 16_000;

/** Checks a save from outside. Returns null when it is not a usable save. */
export function readSave(value: unknown): GameSave | null {
  let data = value;
  if (typeof value === "string") {
    try {
      data = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof data !== "object" || data === null) return null;
  const { state, savedAt } = data as Record<string, unknown>;
  if (typeof state !== "string" || state.length === 0 || state.length > SAVE_LIMIT) return null;
  if (typeof savedAt !== "number" || !Number.isFinite(savedAt) || savedAt < 0) return null;
  return { state, savedAt };
}

export function slotKey({ lessonId, activityId }: SaveSlot): string {
  return `${lessonId}/${activityId}`;
}
