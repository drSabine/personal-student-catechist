import type { NewReflection, Reflection } from "./Reflection";

/**
 * Where reflections are kept.
 * Write your own class that implements this (for example one that talks
 * to a database), then swap it in at src/core/reflection/repository.ts.
 */
export interface ReflectionRepository {
  save(input: NewReflection): Promise<Reflection>;
  /** Newest first. */
  listByLesson(lessonId: string): Promise<Reflection[]>;
  delete(id: string): Promise<void>;
}
