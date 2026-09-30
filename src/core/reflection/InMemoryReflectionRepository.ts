import { cleanReflection, type NewReflection, type Reflection } from "./Reflection";
import type { ReflectionRepository } from "./ReflectionRepository";

/**
 * Keeps reflections in memory only.
 * They last while the site stays open and are gone after a page reload.
 */
export class InMemoryReflectionRepository implements ReflectionRepository {
  private readonly entries = new Map<string, Reflection>();
  private counter = 0;

  constructor(private readonly now: () => Date = () => new Date()) {}

  async save(input: NewReflection): Promise<Reflection> {
    const clean = cleanReflection(input);
    this.counter += 1;
    const reflection: Reflection = {
      id: `r-${Date.now().toString(36)}-${this.counter}`,
      ...clean,
      createdAt: this.now(),
    };
    this.entries.set(reflection.id, reflection);
    return reflection;
  }

  async listByLesson(lessonId: string): Promise<Reflection[]> {
    // Reverse first so entries saved in the same millisecond still come newest first.
    return [...this.entries.values()]
      .reverse()
      .filter((entry) => entry.lessonId === lessonId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<void> {
    this.entries.delete(id);
  }
}
