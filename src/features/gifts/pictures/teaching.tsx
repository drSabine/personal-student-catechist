import { Bust, FOLK } from "@/features/storybook/art/Bust";
import { CUT, paper } from "@/features/storybook/art/paper";
import { SignText } from "@/features/storybook/art/pieces";
import type { Pictures } from "./types";

/** An open book, centered on x, y. */
function OpenBook({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -30 Q-30 -40 -60 -30 L-60 30 Q-30 20 0 30 Q30 20 60 30 L60 -30 Q30 -40 0 -30 Z" fill={paper("flag-blue")} />
      <path d="M0 -24 Q-26 -34 -52 -24 L-52 22 Q-26 14 0 22 Z" fill={paper("white")} />
      <path d="M0 -24 Q26 -34 52 -24 L52 22 Q26 14 0 22 Z" fill={paper("white")} />
      <path
        d="M-42 -12 L-10 -12 M-42 -2 L-10 -2 M-42 8 L-18 8 M10 -12 L42 -12 M10 -2 L42 -2 M10 8 L34 8"
        stroke={paper("stone-dark")}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

export const teaching = {
  "chalkboard-abc": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("mint")} />
      <rect x="20" y="36" width="160" height="116" rx="6" fill={paper("wood-dark")} />
      <rect x="30" y="46" width="140" height="96" rx="3" fill={paper("chalkboard")} />
      <SignText x={100} y={94} text="ABC" size={52} fill={paper("chalk")} />
      <rect x="40" y="148" width="120" height="10" rx="3" fill={paper("wood")} />
    </g>
  ),
  "read-together": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("cream")} />
      <Bust look={FOLK.big} gift="teaching" face="explaining" x={-14} y={20} size={130} />
      <Bust look={FOLK.small} gift="hands" face="smileBig" x={92} y={70} size={100} />
      <OpenBook x={100} y={170} s={0.9} />
    </g>
  ),
  book: () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("sun")} />
      <OpenBook x={100} y={104} s={1.4} />
    </g>
  ),
  "point-board": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("mint")} />
      <rect x="80" y="30" width="112" height="90" rx="5" fill={paper("chalkboard")} />
      <path d="M96 60 L120 60 M96 80 L150 80 M96 100 L136 100" stroke={paper("chalk")} strokeWidth="5" strokeLinecap="round" />
      <path d="M64 130 L150 60" stroke={paper("wood")} strokeWidth="6" strokeLinecap="round" />
      <Bust look={FOLK.boy} gift="teaching" face="explaining" x={-30} y={70} size={140} />
    </g>
  ),
} satisfies Pictures;
