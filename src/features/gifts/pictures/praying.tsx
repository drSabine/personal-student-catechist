import { HandsPraying } from "@phosphor-icons/react";
import { Bust, FOLK } from "@/features/storybook/art/Bust";
import { CUT, paper } from "@/features/storybook/art/paper";
import { Cross } from "@/features/storybook/art/pieces";
import type { Pictures } from "./types";

/** A candle standing on x, y, with its flame and a soft glow. */
function Candle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-100" r="34" fill={paper("sun")} opacity="0.35" />
      <rect x="-16" y="-80" width="32" height="80" rx="4" fill={paper("white")} />
      <path d="M0 -118 Q14 -100 0 -86 Q-14 -100 0 -118 Z" fill={paper("glass-warm")} />
      <path d="M0 -108 Q6 -98 0 -90 Q-6 -98 0 -108 Z" fill={paper("sun")} />
      <rect x="-24" y="-6" width="48" height="10" rx="3" fill={paper("gold")} />
    </g>
  );
}

export const praying = {
  "folded-hands": () => (
    <g>
      <rect width="200" height="200" fill={paper("cream")} />
      <circle cx="100" cy="100" r="74" fill={paper("sun")} opacity="0.4" />
      <HandsPraying x={36} y={36} width={128} height={128} weight="fill" color={paper("skin")} />
    </g>
  ),
  rosary: () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("pink")} />
      {Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={Math.round(100 + Math.cos(angle) * 56)}
            cy={Math.round(80 + Math.sin(angle) * 50)}
            r="7"
            fill={paper("flag-blue")}
          />
        );
      })}
      <path d="M100 130 L100 150" stroke={paper("flag-blue")} strokeWidth="4" />
      <circle cx="100" cy="146" r="7" fill={paper("flag-blue")} />
      <Cross x={100} y={174} s={0.45} fill={paper("gold")} />
    </g>
  ),
  "kneel-church": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("church")} />
      <path d="M110 200 L110 60 Q110 20 150 20 Q190 20 190 60 L190 200 Z" fill={paper("glass")} />
      <Cross x={150} y={70} s={0.5} fill={paper("frame")} />
      <rect x="0" y="168" width="200" height="32" fill={paper("wood")} />
      <Bust look={FOLK.girl} gift="praying" face="calm" x={-10} y={46} size={130} />
      <HandsPraying x={56} y={136} width={36} height={36} weight="fill" color={paper("skin")} />
    </g>
  ),
  candle: () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("frame")} />
      <Candle x={100} y={180} s={1.3} />
    </g>
  ),
} satisfies Pictures;
