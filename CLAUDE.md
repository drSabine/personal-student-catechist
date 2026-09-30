# CLAUDE.md

A small classroom website for Grade 5 Christian Living. It is shown on an LED TV from a laptop, and sometimes on a phone. Lessons are added one at a time. No backend, no database, no login.

## Commands

```bash
npm run dev        # start at http://localhost:3000
npm test           # unit tests (Vitest)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run check      # all of the above, in order
```

The git hooks run these for you (see `docs/workflow.md`).

## Folder map

```
src/
  app/                     routes only (thin pages)
    page.tsx               redirects to the newest lesson (no landing page)
    lessons/[lessonId]/    activity, reflect (pupil form), reflections (teacher view)
  core/                    plain TypeScript, no React
    Observable.ts          subscribe/notify base for useSyncExternalStore
    activity/              Activity base class, ActivityRegistry
    lesson/Lesson.ts
    image/                 ImageSlicer (brick layout), HalftoneRenderer
    reflection/            Reflection model, repository interface, in-memory repository
      repository.ts        THE one line that picks the storage
  features/
    index.ts               registers every activity type (one import each)
    brick-wall/            Build Our Wall (Lesson 1)
    reflections/           useReflections hook, form, cards
  content/
    site.ts                site name and grade
    lessons/index.ts       list of lessons (one line each)
    lessons/lesson-XX/     one folder per lesson
  components/              LessonRunner and shared UI (Button, Screen, Stage, Sidebar, LessonCard, ...)
  hooks/                   useFullscreen
  lib/tokens.ts            readToken(): read a design token from code (canvas drawing)
  styles/fonts/            Geist Pixel, Geist, Sentient (with licenses)
public/lessons/lesson-XX/  images for each lesson
docs/                      how-tos (adding a lesson, storage, design, workflow)
.github/workflows/         CI checks and the release guard
.githooks/                 pre-commit, commit-msg, pre-push
.claude/skills/            start-branch, commit, open-pr, release
```

## Rules

1. Logic lives in plain TypeScript classes in `core/` or `features/*/*.ts`. They never import React.
2. React components stay thin. They render state and forward user actions. Hooks connect classes to React with `useSyncExternalStore`.
3. No `any`. Strict TypeScript.
4. Components never touch storage. They use `useReflections(lessonId)` only.
5. Adding a lesson must not change existing pages. See `docs/adding-a-lesson.md`.
6. A new activity type is a new folder in `features/` plus one line in `features/index.ts`.
7. Windows file names ignore case. Never create two files whose names differ only by case.
8. Keep it simple. Delete code that nothing uses. No new layers, settings, or options unless a lesson needs them.
9. Mobile first. Check every change at 375px wide and at laptop width.
10. Release what is no longer needed: remove listeners and observers in effect cleanups, check you are still mounted after an `await`, and free large buffers or canvases on unmount. See "Performance" in `docs/design.md`.

## Build Our Wall in one breath

`BrickWallActivity` holds the slots. `PassTheDove` tracks Play and Stop (the brick only moves after Stop). `ImageSlicer` cuts the photo into a repeatable mix of lying and standing bricks, so no finished area gives the picture away and slot i always shows piece i. `HalftoneRenderer` draws each placed piece as ink dots. When every slot is filled, `Wall` fades in the color photo and shows the question in a band across its bottom. `BrickWallView` has a full screen mode for the TV.

## Design rules

Read `docs/design.md` before changing the look. The short version:

- **Design tokens only.** No hex colors, pixel sizes, clamps, or timings in components. Every one lives in `src/app/globals.css` and is used as a class (`text-ink`, `w-panel`, `text-title`) or as `var(--token)`. Canvas code uses `readToken()`.
- Colors: `paper`, `ink`, `muted`, `hairline`, `wash`, `gold`, `coral`.
- Fonts: `.pixel` (Geist Pixel) for headings only, Geist for UI text, `font-serif` (Sentient) for reflection text only.
- No gradients, no divider lines, no middots, no em dashes, no emoji. This applies to UI text and docs. (The lesson list's tree lines are the one allowed exception.)
- Headings are lowercase. Instructions fit in one or two lines.
- Tap targets are at least 44px.
- Reduced motion is handled by the tokens in `globals.css`; components need no checks.

## Git

Read `docs/workflow.md`. The short version:

- `main` is production (Vercel). `staging` collects finished work. Nothing is committed or pushed to either directly.
- Every change starts on a branch cut from `staging`: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/` (skill: `start-branch`).
- Commit messages: `type(scope): summary`, 72 characters max, no Co-Authored-By or other attribution lines (skill: `commit`).
- Pull request into `staging`, squash merge (skill: `open-pr`). Release by a pull request from `staging` into `main`, merge commit (skill: `release`).
- Hooks in `.githooks/` run lint, typecheck, and tests before each commit and the build before each push. GitHub Actions runs all four on every push and pull request.
- Run `npm run check` before opening a pull request.
