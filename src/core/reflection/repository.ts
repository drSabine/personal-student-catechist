import { HttpReflectionRepository } from "./HttpReflectionRepository";
import type { ReflectionRepository } from "./ReflectionRepository";

// The one line that picks the storage the screens use.
export const reflectionRepository: ReflectionRepository = new HttpReflectionRepository();
