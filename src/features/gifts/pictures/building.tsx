import { Bust, FOLK } from "@/features/storybook/art/Bust";
import { CUT, paper } from "@/features/storybook/art/paper";
import { Prop } from "@/features/storybook/art/props";
import type { Pictures } from "./types";

function Nail({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} fill={paper("stone-dark")}>
      <rect x="-9" y="-3" width="18" height="6" rx="2" />
      <path d="M-2.5 3 L2.5 3 L0 40 Z" />
    </g>
  );
}

export const building = {
  "hammer-nails": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("cream")} />
      <g transform="translate(86 120) rotate(-30) scale(1.9)">
        <Prop id="hammer" />
      </g>
      <Nail x={140} y={120} angle={20} />
      <Nail x={162} y={110} angle={-10} />
      <Nail x={150} y={150} angle={60} />
    </g>
  ),
  "fix-chair": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("sky")} />
      <rect y="170" width="200" height="30" fill={paper("wood")} />
      <g fill={paper("wood-dark")}>
        <rect x="110" y="80" width="70" height="12" rx="3" />
        <rect x="114" y="120" width="70" height="12" rx="3" />
        <rect x="112" y="80" width="10" height="92" />
        <rect x="170" y="80" width="10" height="92" />
        <rect x="118" y="130" width="10" height="42" transform="rotate(14 123 151)" />
      </g>
      <Bust look={FOLK.kuya} gift="building" face="driven" x={-24} y={50} size={150} />
      <g transform="translate(136 158) rotate(-60)">
        <Prop id="hammer" />
      </g>
    </g>
  ),
  toolbox: () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("sun")} />
      <path
        d="M70 76 L70 58 Q70 50 78 50 L122 50 Q130 50 130 58 L130 76"
        stroke={paper("stone-dark")}
        strokeWidth="9"
        fill="none"
      />
      <g transform="translate(70 70) rotate(-12)">
        <Prop id="hammer" />
      </g>
      <rect x="140" y="40" width="10" height="60" rx="3" fill={paper("flag-blue")} transform="rotate(14 145 70)" />
      <rect x="30" y="76" width="140" height="90" rx="8" fill={paper("red")} />
      <rect x="30" y="100" width="140" height="10" fill={paper("roof")} />
      <rect x="88" y="94" width="24" height="22" rx="3" fill={paper("stone")} />
    </g>
  ),
  "bahay-kubo": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("sky")} />
      <rect y="176" width="200" height="24" fill={paper("grass")} />
      <g fill={paper("wood-dark")}>
        <rect x="44" y="120" width="8" height="58" />
        <rect x="96" y="120" width="8" height="58" />
        <rect x="148" y="120" width="8" height="58" />
      </g>
      <rect x="36" y="112" width="128" height="12" fill={paper("wood")} />
      <rect x="44" y="74" width="112" height="40" fill={paper("path")} />
      <path d="M44 84 L156 84 M44 98 L156 98" stroke={paper("wood")} strokeWidth="3" />
      <path d="M20 80 L100 22 L180 80 Z" fill={paper("gold")} />
      <path d="M40 66 L160 66 M60 52 L140 52" stroke={paper("wood-dark")} strokeWidth="2" opacity="0.6" />
      <path d="M150 112 L190 112 L190 176 M170 112 L170 176" stroke={paper("wood")} strokeWidth="5" fill="none" />
      <path d="M150 140 L190 140" stroke={paper("wood")} strokeWidth="5" />
    </g>
  ),
} satisfies Pictures;
