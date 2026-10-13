import { memo, useId, type CSSProperties } from "react";
import { giftColor, type Expression, type GiftId, type Look } from "../cast";
import { faceMarkup } from "./faces";
import { GIFT_ICONS } from "./icons";
import { INK, LINE, paper } from "./paper";

interface TokenProps {
  look: Look;
  gift: GiftId;
  face: Expression;
  /** The gift badge on the rim. Off for the smallest tokens. */
  badge?: boolean;
  className?: string;
}

const line = { stroke: INK, strokeWidth: LINE * 1.4 } as const;

/**
 * A person as a round paper token, like a board game piece: their Open Peeps face, a ring in their
 * gift's color, and the gift's badge. Plain fills only, since tokens move.
 */
export const Token = memo(function Token({ look, gift, face, badge = true, className }: TokenProps) {
  const clip = `token-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const Icon = GIFT_ICONS[gift];
  const colors = { "--peep-skin": `var(--peep-skin-${look.skin})`, "--peep-shirt": giftColor(gift) } as CSSProperties;

  return (
    <svg viewBox="-8 -8 216 216" className={className} style={colors} aria-hidden overflow="visible">
      <defs>
        <clipPath id={clip}>
          <circle cx="100" cy="100" r="96" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill={paper("cream")} />
      <g clipPath={`url(#${clip})`}>
        <svg
          x="0"
          y="14"
          width="200"
          height="200"
          viewBox="0 0 704 704"
          dangerouslySetInnerHTML={{ __html: faceMarkup(look.hair, face) }}
        />
      </g>
      <circle cx="100" cy="100" r="96" fill="none" stroke={giftColor(gift)} strokeWidth="12" />
      <circle cx="100" cy="100" r="102" fill="none" {...line} />
      {badge && (
        <g transform="translate(166 166)">
          <circle r="27" fill={giftColor(gift)} {...line} />
          <Icon x={-17} y={-17} width={34} height={34} weight="fill" color={INK} />
        </g>
      )}
    </svg>
  );
});
