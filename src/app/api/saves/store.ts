import { InMemorySaveRepository } from "@/core/save/InMemorySaveRepository";
import { RedisSaveRepository } from "@/core/save/RedisSaveRepository";
import type { SaveRepository } from "@/core/save/SaveRepository";
import { redisFromEnv } from "../redis";

const shared = globalThis as typeof globalThis & { saveStore?: SaveRepository };

/** Upstash Redis when its settings exist. Otherwise memory in development, and null in production. */
export function getSaveStore(): SaveRepository | null {
  if (shared.saveStore) return shared.saveStore;

  const redis = redisFromEnv();
  if (redis) {
    shared.saveStore = new RedisSaveRepository(redis);
  } else if (process.env.NODE_ENV !== "production") {
    shared.saveStore = new InMemorySaveRepository();
  }
  return shared.saveStore ?? null;
}
