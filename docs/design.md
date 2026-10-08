# Design

Quiet, warm, and clear. The photo is the hero, controls stay small, and the color reveal at the end is the biggest moment.

## Tokens

Every color, size, shadow, and timing lives in `src/app/globals.css`. Never write a hex color, pixel size, or clamp in a component: add or change a token.

- Tokens in `@theme` become Tailwind classes (`--color-ink` is `text-ink`, `--spacing-panel` is `w-panel`).
- Tokens in `:root` are for styles set from code, used as `var(--name)`.
- Canvas code cannot use classes. It reads tokens with `readToken()` from `src/lib/tokens.ts`.
- Colors are `paper`, `ink`, `muted`, `hairline`, `wash`, `gold`, `coral`. Gold and coral are too light for text: use them for shapes only. Shadows are mixed from `ink`.
- Reduced motion is handled in the tokens. Components need no checks.

## Fonts

| Use | Font |
| --- | --- |
| Headings | Geist Pixel (`.pixel`) |
| UI and body | Geist |
| The wall's question | Geist Mono (`font-mono`) |
| Reflection text | Sentient (`font-serif`) |

Font files and licenses are in `src/styles/fonts/`.

## Rules

- No gradients. No divider lines: use space and card borders. The lesson list's tree lines are the one exception.
- No middots, em dashes, or emoji. Headings are lowercase.
- Tap targets are at least 44px.
- Cards are `rounded-2xl border border-hairline` with generous padding.
- Mobile first: every screen works at 375px, then grows for laptop (`lg`) and TV.

## Layout

- Laptop and TV: a slim lesson list on the left, content on the right. On the activity, the wall fills the height and the controls sit in a narrow column beside it.
- Phone: a top bar whose menu opens a small card under the button, never the whole screen.
- Full screen (the TV): the wall is centered and the controls float in a small card that folds away. Where the browser has no Fullscreen API, the activity covers the window.
- The activity screen never scrolls. Other pages do.

## Build Our Wall

- The photo is cut into a repeatable mix of squares, lying bricks, and standing bricks, so no finished area gives the picture away.
- It plays like a puzzle. Spots and bricks are numbered, bricks come in a fixed order, and each fits only its own spot. A wrong spot refuses it with a small shake.
- The brick rests small in a fixed-size tray. Picked up, it grows to its spot's exact size and follows the pointer. The tray never changes size, so the wall never jumps on a phone.
- Filled spots are halftone dots. When the wall is full, the color photo fades in and the question appears on one line across the bottom.
- Music is played separately, so the panel is only Reset and full screen.

## Build Our Bayan

A pixel town on Phaser and grid-engine, with every word drawn by React over the canvas so it stays sharp and readable on a TV.

- Who does what: `BayanRules` holds the rules for all five stages, `Director` runs the story, two zustand stores hold the saved progress and what is on screen, and the scenes only draw. The scenes hear "now" moments through one small `EventBus`, and tell the Director when a building has finished rising. Every building, the church too, rises in Stage 1. Stage 2 reveals the standing church instead of building it: a close-up over the game shows its foundation, walls, and capstone dark, and each right answer lights one with its name, so the lesson reads from across the room.
- Buildings rise from a change in saved progress, so a refresh draws the town as it is and a change made elsewhere still animates. A teacher's jump or reset marks the save not ready for a moment, so the town is redrawn at once instead.
- The teacher can restart the current stage or reset the whole town. Stage 5's promises are the groups' saved reflections, so resetting the town, or restarting Stage 5, takes them down first. If that fails nothing changes and the panel says so.
- A building going up is the reward, so it takes its time, and the story waits for its card before going on.
- Guidance comes in layers: the guide's lines at the start of each stage, the quest card, an arrow over the next place to go, marks over who is next, the Talk button, and the controls reminder. Nobody else talks unless spoken to, so the screen stays quiet.
- Where the pupil can go is always clear: walkable ground has a faint grid, a mouse outlines the tile it points at, and a blocked tile shows a red X when tapped or walked into.
- Every wrong choice has its own reply, so a second wrong pick gets a new nudge.
- Everyone has an id (their object's name in the map) and a behavior, so no two move alike. A new habit is one entry in `town/Behaviors.ts`. Townsfolk and animals never block the pupil. Under reduced motion the jeepney stays parked.
- The camera frames the town or the church and never zooms out past what fills the screen with the map, so no empty space shows on a wide screen.
- Text sizes come from the game area (a size container), so the same page reads well on a phone and from the back of a classroom.
- Pixels stay square: the canvas is drawn at device pixels and the camera zooms by whole numbers when it can. Too small to read, the camera follows the pupil instead.
- Layer depths live in `game/depth.ts` and overlay looks in `overlay/styles.ts`, so nothing is set twice.
- The maps, sprites, and sounds are generated by the scripts in `tools/bayan-art`. Change a script and run it; edits made by hand to the files it writes are lost on the next run.
- Stage 5 saves each group's sentence as a reflection under the group's name, so it uses the reflections API and shows on the lesson's reflection wall too.

## Performance

Release what is no longer needed, the way Flutter widgets clean up in `dispose`.

- The halftone reads a small copy of the photo, shared while a wall is on screen and dropped when the last one leaves.
- A slot frees its canvas when emptied or removed.
- The color photo starts loading after the first brick.
- Every listener, observer, and timer is removed in the effect cleanup. After an `await`, check you are still mounted.
- Lesson pages are built ahead of time, so they open instantly.
- The game loads only in the browser and is destroyed when its page closes. All games on the page share one audio context, because browsers allow only a few.
