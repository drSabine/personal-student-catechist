/** Shared looks for the game's overlays, so every card and button matches. */

export const panel = "rounded-2xl border-3 border-ink bg-paper p-game-gap shadow-game";

/** The main action on screen, such as Start or Talk. */
export const bigButton =
  "inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-gold px-6 py-3 text-game font-medium text-ink shadow-game disabled:opacity-50";

/** A card's own button, such as Next or Continue. */
export const actionButton =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink bg-gold px-6 py-2 text-game-small font-semibold text-ink shadow-game hover:bg-gold/85 disabled:opacity-50";
