# Adding a lesson

Each lesson is one folder of content. Existing pages never change.

1. Copy `src/content/lessons/lesson-01/` to `lesson-02/`.
2. Edit `lesson-02/lesson.ts`. It is the template: every field is used there, and each option is documented on its type (`Lesson` in `src/core/lesson/Lesson.ts`, `BrickWallInit` in `src/features/brick-wall/BrickWallActivity.ts`).
3. Put the images in `public/lessons/lesson-02/`.
4. Add one line to `src/content/lessons/index.ts`.

The menu shows the new lesson, and the home address opens the newest one.

## Tips

- `id` must match the folder name. It becomes the address, `/lessons/lesson-02`.
- Photo `width` and `height` must be the real pixel size. On Windows: right click, Properties, Details.
- Run the site before choosing an `order` for Build Our Wall. Spots are numbered left to right, top to bottom, and a different `layoutSeed` or photo size changes the layout. If a pattern gives something away too early, try another `layoutSeed`.

## A new kind of activity

1. Make `src/features/your-activity/`.
2. Write a class that extends `Activity` (`src/core/activity/Activity.ts`). Keep all rules there, with no React, and test it next to the class.
3. Write a view that takes `{ activity, lesson }`.
4. Add `register.ts` that calls `activityRegistry.register`, as `brick-wall/register.ts` does.
5. Add one import line to `src/features/index.ts`.

A lesson can hold several activities. Numbered buttons then appear to switch between them.
