import type { GameSave, SaveSlot } from "./GameSave";

export interface SaveOptions {
  /** Let the request finish while the page is closing. Only the browser uses it. */
  keepalive?: boolean;
}

/** Where game saves are kept. One save per activity, shared by every device. */
export interface SaveRepository {
  load(slot: SaveSlot): Promise<GameSave | null>;
  save(slot: SaveSlot, save: GameSave, options?: SaveOptions): Promise<void>;
}
