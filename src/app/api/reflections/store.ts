import { InMemoryReflectionRepository } from "@/core/reflection/InMemoryReflectionRepository";
import { RedisReflectionRepository } from "@/core/reflection/RedisReflectionRepository";
import type { ReflectionRepository } from "@/core/reflection/ReflectionRepository";
import { redisFromEnv } from "../redis";

/** On globalThis so every route handler, and every dev reload, shares one store. */
const shared = globalThis as typeof globalThis & { reflectionStore?: ReflectionRepository };

/**
 * The server's storage, created on first use so builds need no settings.
 * Upstash Redis when its settings exist. Otherwise memory in development, and null in production.
 */
export function getStore(): ReflectionRepository | null {
  if (shared.reflectionStore) return shared.reflectionStore;

  const redis = redisFromEnv();
  if (redis) {
    shared.reflectionStore = new RedisReflectionRepository(redis);
  } else if (process.env.NODE_ENV !== "production") {
    shared.reflectionStore = new InMemoryReflectionRepository();
  }
  return shared.reflectionStore ?? null;
}
