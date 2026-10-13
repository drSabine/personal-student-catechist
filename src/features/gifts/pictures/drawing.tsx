import { giftColor } from "@/features/storybook/cast";
import { Bust, FOLK } from "@/features/storybook/art/Bust";
import { CUT, INK, paper, type Paper } from "@/features/storybook/art/paper";
import { Prop } from "@/features/storybook/art/props";
import type { Pictures } from "./types";

function Crayon({ x, y, angle, color }: { x: number; y: number; angle: number; color: Paper }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x="-12" y="-60" width="24" height="96" rx="4" fill={paper(color)} />
      <path d="M-12 -60 L0 -88 L12 -60 Z" fill={paper(color)} />
      <rect x="-12" y="-36" width="24" height="10" fill={paper("white")} opacity="0.7" />
      <rect x="-12" y="10" width="24" height="10" fill={paper("white")} opacity="0.7" />
    </g>
  );
}

export const drawing = {
  crayons: () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("cream")} />
      <Crayon x={50} y={120} angle={-20} color="red" />
      <Crayon x={84} y={128} angle={-6} color="sun" />
      <Crayon x={118} y={126} angle={8} color="flag-blue" />
      <Crayon x={150} y={118} angle={22} color="leaf" />
    </g>
  ),
  paintbrush: () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("white")} />
      <path
        d="M20 160 Q60 110 110 140 Q150 165 184 120"
        stroke={giftColor("drawing")}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(120 80) rotate(35) scale(1.6)">
        <Prop id="paintbrush" />
      </g>
    </g>
  ),
  "paint-poster": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("sky")} />
      <path d="M118 190 L140 60 M182 190 L160 60" stroke={paper("wood-dark")} strokeWidth="7" />
      <rect x="104" y="40" width="90" height="100" rx="4" fill={paper("white")} />
      <circle cx="130" cy="70" r="12" fill={paper("sun")} />
      <path d="M116 126 L140 96 L162 126 Z" fill={paper("leaf")} />
      <path d="M150 80 Q164 70 180 82" stroke={giftColor("drawing")} strokeWidth="6" fill="none" strokeLinecap="round" />
      <Bust look={FOLK.girl} gift="drawing" face="driven" x={-20} y={60} size={140} />
      <g transform="translate(108 120) rotate(30)">
        <Prop id="paintbrush" />
      </g>
    </g>
  ),
  "house-drawing": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("cream")} />
      <rect x="20" y="20" width="160" height="160" rx="4" fill={paper("white")} transform="rotate(-3 100 100)" />
      <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M58 150 L58 100 L142 100 L142 150 Z" stroke={paper("red")} />
        <path d="M48 104 L100 60 L152 104" stroke={paper("roof")} />
        <path d="M90 150 L90 120 L110 120 L110 150" stroke={paper("wood-dark")} />
        <path d="M30 156 Q100 146 170 156" stroke={paper("leaf")} />
      </g>
      <circle cx="152" cy="48" r="14" fill={paper("sun")} />
    </g>
  ),
} satisfies Pictures;
