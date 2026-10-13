import { openPeeps } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import type { Expression, Hair } from "../cast";

/** Stand-in colors DiceBear paints with, swapped for the person's tokens (see Person). */
const SKIN = "aa0001";
const SHIRT = "aa0002";

const cache = new Map<string, string>();

/**
 * An Open Peeps bust as SVG markup, in a 704 unit square. Made once per hair and expression and
 * kept, so a face never redraws on a re-render. Skin and shirt read --peep-skin and --peep-shirt,
 * so one drawing serves everyone with that hair.
 */
export function faceMarkup(hair: Hair, face: Expression): string {
  const key = `${hair}/${face}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const svg = createAvatar(openPeeps, {
    seed: key,
    head: [hair],
    face: [face],
    skinColor: [SKIN],
    clothingColor: [SHIRT],
    accessoriesProbability: 0,
    facialHairProbability: 0,
    maskProbability: 0,
  }).toString();

  const markup = svg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")
    .replace(/<metadata[\s\S]*?<\/metadata>/, "")
    // The square mask only trims the edges, which the nesting svg already does. Its id would repeat on the page.
    .replace(/<mask[\s\S]*?<\/mask>/, "")
    .replace(/ mask="url\(#[^)]*\)"/g, "")
    .replaceAll(`fill="#${SKIN}"`, 'style="fill:var(--peep-skin)"')
    .replaceAll(`fill="#${SHIRT}"`, 'style="fill:var(--peep-shirt)"');
  cache.set(key, markup);
  return markup;
}
