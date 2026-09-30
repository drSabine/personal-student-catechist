import { Redis } from "@upstash/redis";
import { InMemoryReflectionRepository } from "@/core/reflection/InMemoryReflectionRepository";
import { RedisReflectionRepository } from "@/core/reflection/RedisReflectionRepository";
import type { ReflectionRepository } from "@/core/reflection/ReflectionRepository";

/** On globalThis so every route handler, and every dev reload, shares one store. */
const shared = globalThis as typeof globalThis & { reflectionStore?: ReflectionRepository };

/**
 * The server's storage, created on first use so builds need no settings.
 * Upstash Redis when its settings exist. Otherwise memory in development, and null in production.
 */
export function getStore(): ReflectionRepository | null {
  if (shared.reflectionStore) return shared.reflectionStore;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) {
    shared.reflectionStore = new RedisReflectionRepository(new Redis({ url, token }));
  } else if (process.env.NODE_ENV !== "production") {
    shared.reflectionStore = new InMemoryReflectionRepository();
  }
  return shared.reflectionStore ?? null;
}
