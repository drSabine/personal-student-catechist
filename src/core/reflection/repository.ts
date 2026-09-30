import { InMemoryReflectionRepository } from "./InMemoryReflectionRepository";
import type { ReflectionRepository } from "./ReflectionRepository";

// Swap storage here. This is the only line to change.
export const reflectionRepository: ReflectionRepository = new InMemoryReflectionRepository();
