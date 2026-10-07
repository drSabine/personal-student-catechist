import { readSave, type GameSave, type SaveSlot } from "./GameSave";
import type { SaveOptions, SaveRepository } from "./SaveRepository";

/** Browser side. Every device shares one save per activity through the saves API. */
export class HttpSaveRepository implements SaveRepository {
  constructor(
    private readonly baseUrl = "/api/saves",
    private readonly send: typeof fetch = (input, init) => fetch(input, init),
  ) {}

  async load(slot: SaveSlot): Promise<GameSave | null> {
    const response = await this.send(this.url(slot), { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load the save (${response.status}).`);
    return readSave(await response.json());
  }

  async save(slot: SaveSlot, save: GameSave, { keepalive = false }: SaveOptions = {}): Promise<void> {
    const response = await this.send(this.url(slot), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(save),
      keepalive,
    });
    if (!response.ok) throw new Error(`Could not save (${response.status}).`);
  }

  private url({ lessonId, activityId }: SaveSlot): string {
    return `${this.baseUrl}/${encodeURIComponent(lessonId)}/${encodeURIComponent(activityId)}`;
  }
}
