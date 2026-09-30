import type { Lesson, LessonSummary } from "@/core/lesson/Lesson";
import { lesson01 } from "./lesson-01/lesson";

/** Every lesson, in teaching order. Add one line per new lesson. */
export const lessons: readonly Lesson[] = [
  lesson01,
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function lessonSummaries(): LessonSummary[] {
  return lessons.map((lesson) => lesson.toSummary());
}
