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

## Performance

Release what is no longer needed, the way Flutter widgets clean up in `dispose`.

- The halftone reads a small copy of the photo, shared while a wall is on screen and dropped when the last one leaves.
- A slot frees its canvas when emptied or removed.
- The color photo starts loading after the first brick.
- Every listener, observer, and timer is removed in the effect cleanup. After an `await`, check you are still mounted.
- Lesson pages are built ahead of time, so they open instantly.
