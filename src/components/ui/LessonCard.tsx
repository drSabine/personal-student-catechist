import Image from "next/image";
import type { ReactNode } from "react";
import type { LessonPicture } from "@/core/lesson/Lesson";

interface LessonCardProps {
  label: string;
  theme: string;
  cover?: LessonPicture;
  children?: ReactNode;
}

/**
 * The lesson's picture and big idea. Sits beside the reflection pages on wide screens,
 * and becomes a compact row above the content on phones.
 */
export function LessonCard({ label, theme, cover, children }: LessonCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-hairline p-4 sm:p-5">
      <div className="flex items-center gap-4 lg:flex-col lg:items-stretch">
        {cover && (
          <Image
            src={cover.src}
            alt={cover.alt}
            width={cover.width}
            height={cover.height}
            sizes="(min-width: 1024px) 20rem, 6rem"
            className="size-20 shrink-0 rounded-xl bg-wash object-cover sm:size-24 lg:aspect-square lg:size-auto lg:w-full"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-label text-muted">Lesson {label}, big idea</p>
          <p className="mt-1.5 font-serif text-lg leading-snug">{theme}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
