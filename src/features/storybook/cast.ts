/** The people and gifts shared by Lesson 03's games. Words live in the lesson's content file. */

/** The five workers' gifts, in the order they stand in the team strip. */
export const WORKER_GIFTS = ["hands", "building", "drawing", "singing", "tidying"] as const;
export type WorkerGift = (typeof WORKER_GIFTS)[number];

/** Every gift with an icon and a color. The leader's star is one too. */
export type GiftId = WorkerGift | "teaching" | "praying" | "leader";

/** The only faces a person makes. Each one matches a moment in the game. */
export type Expression = "smile" | "calm" | "driven" | "concerned" | "smileBig" | "lovingGrin1" | "explaining";

/** Open Peeps hair styles used by the cast. Add one here when a new person needs it. */
export type Hair = "short1" | "short3" | "bun" | "long" | "mediumBangs" | "pomp" | "shaved2";

/** Skin tones, each a token in globals.css (--peep-skin-*). Open Peeps draws hair in ink. */
type SkinTone = "light" | "tan" | "brown";

/** The tool each worker works with. */
export type PropId = "pail" | "hammer" | "paintbrush" | "microphone" | "broom";

export interface Look {
  hair: Hair;
  skin: SkinTone;
}

export interface Person {
  name: string;
  gift: GiftId;
  look: Look;
}

/** A gift's color token, shared by a person's shirt, badge, card, and job tags. */
export function giftColor(gift: GiftId): string {
  return `var(--gift-${gift})`;
}
