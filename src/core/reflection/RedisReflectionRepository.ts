import { cleanReflection, type NewReflection, type Reflection } from "./Reflection";
import type { ReflectionRepository } from "./ReflectionRepository";

/** The Redis hash commands used here. `@upstash/redis` provides them. */
export interface HashClient {
  hset(key: string, fields: Record<string, string>): Promise<unknown>;
  hgetall(key: string): Promise<Record<string, unknown> | null>;
  hdel(key: string, ...fields: string[]): Promise<unknown>;
}

const KEY = "reflections";

/** Server only. One Redis hash: the id is the field, the entry is JSON. Listing reads the whole hash. */
export class RedisReflectionRepository implements ReflectionRepository {
  constructor(
    private readonly client: HashClient,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async save(input: NewReflection): Promise<Reflection> {
    const clean = cleanReflection(input);
    const reflection: Reflection = { id: crypto.randomUUID(), ...clean, createdAt: this.now() };
    await this.client.hset(KEY, { [reflection.id]: JSON.stringify(reflection) });
    return reflection;
  }

  async listByLesson(lessonId: string): Promise<Reflection[]> {
    const stored = (await this.client.hgetall(KEY)) ?? {};
    return Object.values(stored)
      .map(readStored)
      .filter((entry): entry is Reflection => entry !== null && entry.lessonId === lessonId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<void> {
    await this.client.hdel(KEY, id);
  }
}

/** Accepts JSON text or an already parsed object, and skips anything malformed. */
function readStored(value: unknown): Reflection | null {
  let data = value;
  if (typeof value === "string") {
    try {
      data = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof data !== "object" || data === null) return null;

  const { id, lessonId, pupilName, content, createdAt } = data as Record<string, unknown>;
  if (
    typeof id !== "string" ||
    typeof lessonId !== "string" ||
    typeof pupilName !== "string" ||
    typeof content !== "string" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : { id, lessonId, pupilName, content, createdAt: date };
}
