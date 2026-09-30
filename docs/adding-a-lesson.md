# Adding a lesson

Each lesson is one folder of content. You never edit existing pages.

## 1. Make the folder

Copy `src/content/lessons/lesson-01/` and name the copy `lesson-02/`.

## 2. Write the lesson

Open `src/content/lessons/lesson-02/lesson.ts` and change it. Here is a template that reuses the Build Our Wall activity with a new photo:

```ts
import { Lesson } from "@/core/lesson/Lesson";
import { BrickWallActivity } from "@/features/brick-wall/BrickWallActivity";

export const lesson02 = new Lesson({
  id: "lesson-02",
  number: 2,
  title: "Your lesson title",
  theme: "The big idea in one sentence.",
  reflectionPrompt: "A question pupils answer after the lesson?",
  reflectionStarters: ["Today I learned", "I can help by"],
  cover: {
    src: "/lessons/lesson-02/cover.jpg",
    width: 1200,
    height: 800,
    alt: "Describe the picture in a few words.",
  },
  songs: [{ title: "Song name", url: "https://www.youtube.com/watch?v=..." }],
  activities: [
    new BrickWallActivity({
      id: "build-our-wall",
      title: "Build our wall",
      instructions: "When the music stops, drag the brick to any empty spot.",
      question: "Who built this?",
      photo: {
        src: "/lessons/lesson-02/hidden.jpg",
        width: 1200,
        height: 800,
        alt: "Describe the photo in a few words.",
      },
      pieceCounts: [6, 8, 10],
      defaultPieceCount: 6,
      layoutSeed: 1,
    }),
  ],
});
```

Tips:

- `id` must match the folder name. It becomes the web address: `/lessons/lesson-02`.
- `theme` is the big idea. It shows beside the reflection pages.
- `reflectionStarters`, `cover`, and `songs` are optional. Starters are short openings a pupil can tap to begin writing. The cover is the picture beside the reflection pages; you can reuse the activity photo.
- `width` and `height` must be the real size of the photo in pixels. On Windows, right click the file, then Properties, then Details.
- Piece counts are whole numbers of 2 or more.
- `halftoneCells` (optional, default 72) sets how many dots go across the photo. More dots, finer print.
- `layoutSeed` (optional, default 1) picks the brick pattern. The wall mixes squares, lying bricks, and standing bricks of different sizes so pupils cannot guess the picture early. If a pattern happens to uncover something important too soon, try another number. The pattern is the same every time, so each spot always shows the same part of the photo.

## 3. Add the pictures

Put the lesson's images in `public/lessons/lesson-02/`.

## 4. Add one line to the list

Open `src/content/lessons/index.ts`:

```ts
import { lesson01 } from "./lesson-01/lesson";
import { lesson02 } from "./lesson-02/lesson";

export const lessons: readonly Lesson[] = [
  lesson01,
  lesson02,
];
```

That is all. The menu shows the new lesson, and the home address opens the newest one.

## A new kind of activity

If a lesson needs something other than Build Our Wall:

1. Make a folder `src/features/your-activity/`.
2. Write a class that extends `Activity` from `src/core/activity/Activity.ts`. Put all the rules there, with no React.
3. Write a view component that takes `{ activity, lesson }`.
4. Add `register.ts`:

   ```ts
   import { activityRegistry } from "@/core/activity/ActivityRegistry";
   import { YourActivity } from "./YourActivity";
   import { YourActivityView } from "./YourActivityView";

   activityRegistry.register<YourActivity>(YourActivity.TYPE, YourActivityView);
   ```

5. Add one line to `src/features/index.ts`:

   ```ts
   import "./your-activity/register";
   ```

6. Add unit tests next to the class, like `BrickWallActivity.test.ts`.

A lesson can hold more than one activity. When it does, small numbered buttons appear at the top so you can switch between them.
