import type { ReactNode } from "react";
import { lessonSummaries } from "@/content/lessons";
import { DotCorner } from "./DotCorner";
import { Sidebar } from "./Sidebar";

interface ScreenProps {
  lessonId: string;
  /** Fit the page to the window with no page scroll (for activities). */
  fit?: boolean;
  children: ReactNode;
}

/** Page frame shared by every lesson page. */
export function Screen({ lessonId, fit = false, children }: ScreenProps) {
  return (
    <div className={`flex flex-col lg:flex-row ${fit ? "h-dvh overflow-hidden" : "min-h-dvh"}`}>
      <Sidebar lessons={lessonSummaries()} currentLessonId={lessonId} />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <DotCorner className="absolute right-0 top-0 hidden md:block" />
        {children}
      </main>
    </div>
  );
}
