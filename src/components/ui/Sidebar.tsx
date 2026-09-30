"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LessonSummary } from "@/core/lesson/Lesson";
import { site } from "@/content/site";

interface SidebarProps {
  lessons: readonly LessonSummary[];
  currentLessonId: string;
}

function lessonLinks(id: string) {
  return [
    { href: `/lessons/${id}`, label: "Activity" },
    { href: `/lessons/${id}/reflect`, label: "Write a reflection" },
    { href: `/lessons/${id}/reflections`, label: "Read reflections" },
  ];
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 8 8"
      className={`size-2.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="currentColor"
    >
      <polygon points="2,1 6,4 2,7" />
    </svg>
  );
}

// Tree lines, like the `tree` command: a stem on the left and a short branch to each page.
// The last page's stem stops halfway, which draws the corner.
const branch =
  "relative pl-5 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-ink/20 before:content-[''] last:before:h-1/2 after:absolute after:left-0 after:top-1/2 after:h-px after:w-3 after:bg-ink/20 after:content-['']";

function Nav({
  lessons,
  currentLessonId,
  pathname,
  onNavigate,
}: SidebarProps & { pathname: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set([currentLessonId]));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <nav aria-label="Lessons" className="flex flex-col gap-1">
      <p className="mb-2 text-xs uppercase tracking-label text-muted">Lessons</p>
      {lessons.map((lesson) => {
        const current = lesson.id === currentLessonId;
        const expanded = open.has(lesson.id);
        const listId = `lesson-pages-${lesson.id}`;
        return (
          <div key={lesson.id} className="flex flex-col">
            <div className="flex items-start">
              <button
                type="button"
                onClick={() => toggle(lesson.id)}
                aria-expanded={expanded}
                aria-controls={listId}
                aria-label={`${expanded ? "Hide" : "Show"} pages for lesson ${lesson.label}`}
                className="-ml-2 flex h-11 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:text-ink"
              >
                <Chevron open={expanded} />
              </button>
              <Link
                href={`/lessons/${lesson.id}`}
                onClick={onNavigate}
                className={`flex min-h-11 items-start gap-3 py-3 text-sm leading-snug ${
                  current ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span className="pixel pt-px text-xs tabular-nums">{lesson.label}</span>
                <span>{lesson.title}</span>
              </Link>
            </div>
            {expanded && (
              <ul id={listId} className="mb-2 ml-4.5 flex flex-col">
                {lessonLinks(lesson.id).map((link) => {
                  const active = pathname === link.href;
                  return (
                    <li key={link.href} className={branch}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-10 items-center gap-2 text-sm ${
                          active ? "font-medium text-ink" : "text-muted hover:text-ink"
                        }`}
                      >
                        {link.label}
                        {active && <span aria-hidden className="size-1.5 rounded-full bg-gold" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex flex-col">
      <span className="pixel text-lg lowercase leading-none text-ink">{site.name}</span>
      <span className="mt-1.5 text-xs text-muted">{site.grade}</span>
    </Link>
  );
}

/** Lesson list: a slim column on laptops and TVs, a top bar with a menu on phones. */
export function Sidebar({ lessons, currentLessonId }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = lessons.find((lesson) => lesson.id === currentLessonId);

  return (
    <>
      <aside className="hidden w-sidebar shrink-0 flex-col gap-10 overflow-y-auto px-7 py-8 lg:flex">
        <Brand />
        <Nav lessons={lessons} currentLessonId={currentLessonId} pathname={pathname} />
      </aside>

      <header className="flex items-center justify-between gap-4 px-4 pt-3 lg:hidden">
        <Brand />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="lesson-menu"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-4 text-sm"
        >
          {current ? `Lesson ${current.label}` : "Lessons"}
          <span aria-hidden className="pixel text-xs">{open ? "x" : "+"}</span>
        </button>
      </header>

      {open && (
        <div id="lesson-menu" className="fixed inset-0 z-40 overflow-y-auto bg-paper px-4 pb-10 pt-3 lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <Brand />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-4 text-sm"
            >
              Close
            </button>
          </div>
          <Nav
            lessons={lessons}
            currentLessonId={currentLessonId}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
