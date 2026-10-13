import type { CSSProperties } from "react";
import { giftColor, type Expression, type GiftId, type Look } from "../cast";
import { faceMarkup } from "./faces";

interface BustProps {
  look: Look;
  /** The shirt takes this gift's color. */
  gift: GiftId;
  face: Expression;
  x: number;
  y: number;
  /** Width and height of the square the bust is drawn in. */
  size: number;
}

/** A person's Open Peeps head and shoulders, for the clue pictures and the barangay picture. Static only. */
export function Bust({ look, gift, face, x, y, size }: BustProps) {
  const colors = { "--peep-skin": `var(--peep-skin-${look.skin})`, "--peep-shirt": giftColor(gift) } as CSSProperties;
  return (
    <g style={colors}>
      <svg
        x={x}
        y={y}
        width={size}
        height={size}
        viewBox="0 0 704 704"
        dangerouslySetInnerHTML={{ __html: faceMarkup(look.hair, face) }}
      />
    </g>
  );
}

/** Townsfolk who appear only in pictures. */
export const FOLK = {
  boy: { hair: "short1", skin: "tan" },
  girl: { hair: "long", skin: "brown" },
  big: { hair: "mediumBangs", skin: "light" },
  small: { hair: "short3", skin: "brown" },
  lola: { hair: "bun", skin: "tan" },
  kuya: { hair: "pomp", skin: "tan" },
} as const satisfies Record<string, Look>;
