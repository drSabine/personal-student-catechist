# Christian Living Classroom

A small website for teaching Grade 5 Christian Living. Open it on a laptop, show it on the TV, and teach. It also works on a phone.

## What you need

- [Node.js](https://nodejs.org) version 20 or newer.

## Install

Open a terminal in this folder and run:

```bash
npm install
```

You only do this once.

## Run

```bash
npm run dev
```

Then open http://localhost:3000 in your browser. It goes straight to the newest lesson.

To open it on a phone on the same Wi-Fi, use the "Network" address that appears in the terminal.

## Teach Lesson 1: Build Our Wall

1. Play the song "Roll Over the Ocean" in class. The link is at the top of the screen.
2. Press **Play** on the screen. Pupils pass the paper dove.
3. Stop the music and press **Stop**. The pupil holding the dove comes to the screen.
4. The pupil drags the brick into any empty spot. Tapping a spot works too.
5. Repeat until the wall is full. The photo turns to full color and asks "Who built this?"
6. Use **Build again** or **Reset** to start over, and **Pieces** to pick 6, 8, or 10 bricks.

Tip: press the full screen button (the four corners) for the TV. It hides everything except the wall, which sits in the middle, and a small card of buttons in the corner. The arrow on the card folds it away. Press the full screen button again, or Esc, to leave.

After the lesson, pupils can use **Write a reflection** in the menu. They can tap a sentence starter to begin. You can read them all in **Read reflections**.

Note: reflections are only kept while the site stays open. Reloading the page clears them. See `docs/reflections-storage.md` to keep them for good.

## Add a new lesson

The short version:

1. Copy `src/content/lessons/lesson-01/` to `lesson-02/` and change the words.
2. Put its pictures in `public/lessons/lesson-02/`.
3. Add one line to `src/content/lessons/index.ts`.

The step-by-step guide is in [docs/adding-a-lesson.md](docs/adding-a-lesson.md).

## Other commands

```bash
npm test           # run the tests
npm run lint       # check the code style
npm run typecheck  # check the types
npm run build      # make a production build
npm run check      # all of the above
```

## Working on the site

Work never goes straight to the live site. Make a branch from `staging`, open a pull request into `staging`, and when `staging` looks good, open a pull request from `staging` into `main`. Vercel publishes `main`. The full guide, with commit message rules and the checks that run, is in [docs/workflow.md](docs/workflow.md).

## More

- [docs/adding-a-lesson.md](docs/adding-a-lesson.md): adding lessons and new kinds of activities
- [docs/reflections-storage.md](docs/reflections-storage.md): plugging in your own storage
- [docs/design.md](docs/design.md): colors, fonts, and design rules
- [docs/workflow.md](docs/workflow.md): branches, commits, checks, and releases

Fonts: Geist and Geist Pixel (SIL Open Font License) and Sentient (ITF Free Font License). The license files are in `src/styles/fonts/`.
