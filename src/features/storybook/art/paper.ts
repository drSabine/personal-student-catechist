/** Lesson 03's paper colors. Each is a token in globals.css (--paper-*). */
export type Paper =
  | "white"
  | "sky"
  | "cloud"
  | "sun"
  | "grass"
  | "grass-dark"
  | "leaf"
  | "leaf-dark"
  | "trunk"
  | "path"
  | "soil"
  | "clay"
  | "cream"
  | "mint"
  | "roof"
  | "wood"
  | "wood-dark"
  | "capiz"
  | "frame"
  | "stone"
  | "stone-dark"
  | "flag-blue"
  | "flag-red"
  | "flag-yellow"
  | "chalkboard"
  | "chalk"
  | "church"
  | "glass"
  | "glass-warm"
  | "gold"
  | "pink"
  | "red"
  | "dust"
  | "skin";

export function paper(name: Paper): string {
  return `var(--paper-${name})`;
}

export const INK = "var(--color-ink)";

/** The ink line every person and prop is drawn with, in scene units. */
export const LINE = 3;

/** Put on a static layer's group to cut it out of paper. Never on anything that moves. */
export const CUT = "url(#paper-cut)";
