import { readSave, slotKey, type GameSave, type SaveSlot } from "./GameSave";
import type { SaveRepository } from "./SaveRepository";

/** The Redis commands used here. `@upstash/redis` provides them. */
export interface KeyValueClient {
  get(key: string): Promise<unknown>;
  set(key: string, value: string): Promise<unknown>;
}

/** Server only. One Redis key per activity, holding the save as JSON. */
export class RedisSaveRepository implements SaveRepository {
  constructor(private readonly client: KeyValueClient) {}

  async load(slot: SaveSlot): Promise<GameSave | null> {
    // Upstash may hand back parsed JSON or text; readSave takes either and skips anything malformed.
    return readSave(await this.client.get(key(slot)));
  }

  async save(slot: SaveSlot, save: GameSave): Promise<void> {
    const clean = readSave(save);
    if (!clean) throw new Error("That save did not look right.");
    await this.client.set(key(slot), JSON.stringify(clean));
  }
}

function key(slot: SaveSlot): string {
  return `saves:${slotKey(slot)}`;
}
