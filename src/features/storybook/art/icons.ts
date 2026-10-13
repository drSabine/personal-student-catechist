import {
  Broom,
  ChalkboardTeacher,
  HandHeart,
  HandsPraying,
  Hammer,
  MusicNotes,
  PaintBrush,
  Star,
  type Icon,
} from "@phosphor-icons/react";
import type { GiftId } from "../cast";

/** One icon per gift, used on badges, job tags, and cards, so a pupil matches picture to picture. */
export const GIFT_ICONS: Readonly<Record<GiftId, Icon>> = {
  hands: HandHeart,
  building: Hammer,
  drawing: PaintBrush,
  singing: MusicNotes,
  tidying: Broom,
  teaching: ChalkboardTeacher,
  praying: HandsPraying,
  leader: Star,
};
