import type { NewReflection, Reflection } from "./Reflection";

/** Where reflections are kept. The screens use one, picked in repository.ts. */
export interface ReflectionRepository {
  save(input: NewReflection): Promise<Reflection>;
  /** Newest first. */
  listByLesson(lessonId: string): Promise<Reflection[]>;
  delete(id: string): Promise<void>;
}
