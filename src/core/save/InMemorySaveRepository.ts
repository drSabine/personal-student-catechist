import { readSave, slotKey, type GameSave, type SaveSlot } from "./GameSave";
import type { SaveRepository } from "./SaveRepository";

/** Memory only. Used by the dev server when Redis is not set up. */
export class InMemorySaveRepository implements SaveRepository {
  private readonly saves = new Map<string, GameSave>();

  async load(slot: SaveSlot): Promise<GameSave | null> {
    return this.saves.get(slotKey(slot)) ?? null;
  }

  async save(slot: SaveSlot, save: GameSave): Promise<void> {
    const clean = readSave(save);
    if (!clean) throw new Error("That save did not look right.");
    this.saves.set(slotKey(slot), clean);
  }
}
