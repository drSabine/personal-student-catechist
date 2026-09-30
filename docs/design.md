# Design

Quiet, warm, and clear. The photo is the hero. Controls stay small. The final color reveal is the biggest moment of the lesson.

## Design tokens

Every color, size, shadow, and timing lives in one file: `src/app/globals.css`. Never write a hex color, a pixel size, or a clamp in a component. Add or change a token instead.

- Tokens inside `@theme` also become Tailwind classes. `--color-ink` gives `text-ink` and `bg-ink`, `--text-title` gives `text-title`, `--spacing-panel` gives `w-panel`.
- Tokens in `:root` are for styles set from code, used as `var(--brick-width)`.
- Canvas drawing cannot use classes. It reads tokens with `readToken("--color-ink")` from `src/lib/tokens.ts`.

### Colors

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#fdfbf7` | page background |
| `ink` | `#1c1a17` | text, halftone dots, main button |
| `muted` | `#6b665e` | secondary text |
| `hairline` | `#e8e3da` | card and button borders |
| `wash` | `#f5f1e9` | soft fills, selected options, halftone paper |
| `gold` | `#c99a3b` | the one accent: focus ring, current page dot, drop target |
| `coral` | `#e38b73` | small highlights: the brick, error dot, hover |

Gold and coral are too light for text. Use them only for shapes. Shadows are mixed from `ink`, so they follow the palette.

### Type sizes

| Class | Size | Use |
| --- | --- | --- |
| `text-title` | grows from 1.5rem to 2.25rem | activity title |
| `text-display` | grows from 1.75rem to 2.75rem | page headings |
| `text-stat` | grows from 2.5rem to 4rem | big numbers |
| `text-question` | a share of the wall's width | "Who built this?", always one line |
| `tracking-label` | 0.14em | small uppercase labels |

### Layout sizes

| Token | Use |
| --- | --- |
| `w-sidebar` | lesson list on wide screens |
| `w-panel` | control column beside the wall |
| `w-float-panel` | full screen control card, sized to the space beside the wall |
| `w-aside` | lesson card beside the reflection pages |
| `max-w-page` | widest a content page grows, so it stays together on a TV |
| `min-h-tray` | space for the brick and its hint |
| `p-caption` | padding of the question band, scales with its text |
| `--brick-width`, `--brick-height` | base brick size, varied per turn |

### Motion

| Token | Use |
| --- | --- |
| `--ease-soft` | the one easing curve |
| `animate-settle`, `animate-pop-in`, `animate-rise-in` | brick placed, new brick, question appears |
| `--reveal-delay`, `--reveal-duration`, `--question-delay` | the color reveal |
| `--duration-quick` | small fades |

With reduced motion the reveal tokens shrink and all animations become nearly instant. Components do not need their own checks.

## Fonts

| Class | Font | Use |
| --- | --- | --- |
| `.pixel` | Geist Pixel | headings and the big question only |
| `.pixel-round` | Geist Pixel, round dots | the "Who built this?" reveal |
| default | Geist | all UI and body text |
| `font-serif` | Sentient | reflection prompts, entries, and the lesson's big idea |

The font files in `src/styles/fonts/` are trimmed to Latin characters to keep them small.

## Rules

- No gradients.
- No divider lines or separators. Use space and card borders instead. The one exception is the tree lines in the lesson list, which show which pages belong to a lesson.
- No middots, no em dashes, no emoji.
- Headings are lowercase (`build our wall`, `reflections`).
- Instructions are one or two short lines.
- Tap targets are at least 44px (`min-h-11`).
- Cards: `rounded-2xl border border-hairline`, generous padding.
- A faint dot grid sits in the top right corner. It fades by shrinking dots, not with a gradient.
- Mobile first. Every screen must work at 375px wide, then grow for laptop (`lg`) and TV.

## Layout

- Laptop and TV: a slim lesson list on the left, content on the right. On the activity screen the wall fills the height and the controls sit in a narrow column beside it.
- Lesson list: each lesson folds open and shut with a small arrow. Its pages hang under it on tree lines, like the `tree` command. The current lesson starts open.
- Full screen: the activity has a full screen button. It hides the lesson list and the header. The wall is centered and the controls float in a card in the bottom right corner, sized to the space beside the wall so they do not cover it. The card folds down to just Play, full screen, and a show button. Esc leaves full screen. On phones without real full screen it simply covers the window.
- Reflection pages: the form or the cards on the left, and a lesson card on the right with the lesson picture and its big idea. The teacher's page also shows a live count. On phones the lesson card becomes a compact row above the content.
- Phone: a top bar with a menu button. The wall sits under the title and the controls go below it.
- The activity screen never scrolls. Other pages scroll normally.

## Build Our Wall specifics

- The wall mixes three shapes: squares, bricks lying flat, and bricks standing up, in different sizes. The biggest piece is at least twice the smallest, but no piece covers more than two fair shares of the picture, and none is thinner than 3.5 to 1. Finishing one area (the top, or one side) never uncovers a whole band of the picture, so pupils can only guess once most pieces are in.
- The pattern is fixed per piece count and `layoutSeed`, and looks the same on phones, laptops, and TVs.
- The brick at the bottom also changes each turn: lying, standing, or square.
- No gaps between pieces, so the halftone reads as one printed picture.
- Empty spots are dashed outlines. Filled spots are ink dots on `wash`, about 72 dots across the photo.
- When the wall is full, the color photo fades in. Then the question appears on one line in a paper band across the bottom of the photo, sized from the wall width, so it is large on a TV and still fits on a phone.

## Performance

Keep the site light. Anything that is no longer needed is released, the way Flutter widgets clean up in `dispose`.

- The halftone reads a small copy of the photo (about 4 samples per dot), not the full photo.
- The photo's pixel data is shared while a wall is on screen and dropped when the last one leaves.
- A slot frees its canvas when it is emptied or removed.
- The full color photo only starts loading after the first brick is placed.
- Every listener, observer, and timer is removed in the effect's cleanup. After an `await`, code checks it is still mounted before setting state.
- Lesson pages are built ahead of time (static), so they open instantly.
