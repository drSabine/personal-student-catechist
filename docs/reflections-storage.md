# Reflections storage

Right now reflections live in memory (`InMemoryReflectionRepository`). They disappear when the page reloads. When you are ready to keep them, write your own repository and swap it in with one line.

## The pieces

| File | What it is |
| --- | --- |
| `src/core/reflection/Reflection.ts` | The `Reflection` model and `cleanReflection()`, which trims and checks input |
| `src/core/reflection/ReflectionRepository.ts` | The interface every storage must follow |
| `src/core/reflection/InMemoryReflectionRepository.ts` | The current storage, for reference |
| `src/core/reflection/repository.ts` | **The one line that picks the storage** |
| `src/features/reflections/useReflections.ts` | The hook components use. It only talks to the repository |

```ts
export interface Reflection {
  readonly id: string;
  readonly lessonId: string;
  readonly pupilName: string;
  readonly content: string;
  readonly createdAt: Date;
}

export interface ReflectionRepository {
  save(input: NewReflection): Promise<Reflection>;
  listByLesson(lessonId: string): Promise<Reflection[]>; // newest first
  delete(id: string): Promise<void>;
}
```

All methods return promises, so a database or an API fits without changes elsewhere.

## Write your own

1. Create a file, for example `src/core/reflection/MyReflectionRepository.ts`:

   ```ts
   import { cleanReflection, type NewReflection, type Reflection } from "./Reflection";
   import type { ReflectionRepository } from "./ReflectionRepository";

   export class MyReflectionRepository implements ReflectionRepository {
     async save(input: NewReflection): Promise<Reflection> {
       const clean = cleanReflection(input);
       // Store `clean` and return the saved entry with its id and createdAt.
     }

     async listByLesson(lessonId: string): Promise<Reflection[]> {
       // Return this lesson's entries, newest first. createdAt must be a Date.
     }

     async delete(id: string): Promise<void> {
       // Remove the entry.
     }
   }
   ```

2. Swap it in, in `src/core/reflection/repository.ts`:

   ```ts
   export const reflectionRepository: ReflectionRepository = new MyReflectionRepository();
   ```

That is the only change. The screens keep working.

## Good to know

- Call `cleanReflection()` in `save`, so empty or too-long entries are refused with a friendly message. The form shows that message to the pupil.
- If a method throws, the screens show a short error instead of crashing.
- `InMemoryReflectionRepository.test.ts` shows the expected behavior. Copy it to test your own repository.
- The pupil's name is saved but not shown on the teacher's cards.
