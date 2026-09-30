import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonRunner } from "@/components/LessonRunner";
import { Screen } from "@/components/ui/Screen";
import { getLesson, lessons } from "@/content/lessons";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export function generateStaticParams() {
  return lessons.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const lesson = getLesson((await params).lessonId);
  return { title: lesson ? `Lesson ${lesson.label}` : "Lesson" };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  if (!getLesson(lessonId)) notFound();

  return (
    <Screen lessonId={lessonId} fit>
      <LessonRunner lessonId={lessonId} />
    </Screen>
  );
}
