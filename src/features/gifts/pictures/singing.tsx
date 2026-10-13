import { giftColor } from "@/features/storybook/cast";
import { Bust, FOLK } from "@/features/storybook/art/Bust";
import { CUT, paper } from "@/features/storybook/art/paper";
import { Cross } from "@/features/storybook/art/pieces";
import type { Pictures } from "./types";

/** A music note at x, y (the bottom of its head), `double` for two joined notes. */
function Note({ x, y, s = 1, fill, double = false }: { x: number; y: number; s?: number; fill: string; double?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <ellipse cx="-8" cy="-6" rx="11" ry="8" transform="rotate(-20 -8 -6)" />
      <rect x="1" y="-60" width="5" height="54" />
      {double ? (
        <>
          <ellipse cx="32" cy="-14" rx="11" ry="8" transform="rotate(-20 32 -14)" />
          <rect x="41" y="-68" width="5" height="54" />
          <path d="M1 -60 L46 -68 L46 -56 L1 -48 Z" />
        </>
      ) : (
        <path d="M6 -60 Q24 -52 20 -34 Q16 -46 6 -46 Z" />
      )}
    </g>
  );
}

export const singing = {
  "music-notes": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("cream")} />
      <Note x={50} y={150} s={1.3} fill={giftColor("singing")} double />
      <Note x={150} y={90} s={1.1} fill={giftColor("drawing")} />
      <Note x={130} y={170} s={0.9} fill={giftColor("hands")} />
      <Note x={50} y={70} s={0.8} fill={giftColor("tidying")} />
    </g>
  ),
  "child-singing": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("sky")} />
      <Bust look={FOLK.girl} gift="singing" face="explaining" x={-4} y={40} size={160} />
      <Note x={160} y={80} s={0.8} fill={giftColor("singing")} />
      <Note x={178} y={130} s={0.6} fill={paper("flag-blue")} />
    </g>
  ),
  microphone: () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("pink")} />
      <rect x="96" y="96" width="8" height="84" fill={paper("stone-dark")} />
      <path d="M60 188 L140 188 L120 174 L80 174 Z" fill={paper("stone-dark")} />
      <path d="M86 92 L114 92 L108 130 L92 130 Z" fill={paper("frame")} />
      <circle cx="100" cy="66" r="34" fill={paper("stone")} />
      <path
        d="M78 52 L122 52 M72 66 L128 66 M78 80 L122 80 M90 36 L90 96 M110 36 L110 96"
        stroke={paper("stone-dark")}
        strokeWidth="3"
      />
    </g>
  ),
  "church-choir": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("church")} />
      <path d="M30 200 L30 80 Q30 20 100 20 Q170 20 170 80 L170 200 Z" fill={paper("glass")} />
      <Cross x={100} y={70} s={0.6} fill={paper("frame")} />
      <Bust look={FOLK.boy} gift="praying" face="smileBig" x={-6} y={96} size={100} />
      <Bust look={FOLK.girl} gift="singing" face="explaining" x={50} y={88} size={104} />
      <Bust look={FOLK.small} gift="teaching" face="smileBig" x={106} y={96} size={100} />
      <Note x={30} y={60} s={0.5} fill={giftColor("singing")} />
      <Note x={176} y={56} s={0.5} fill={giftColor("singing")} />
    </g>
  ),
} satisfies Pictures;
