import type { ReactElement } from "react";
import { giftColor, type PropId } from "../cast";
import { INK, LINE, paper } from "./paper";

const line = { stroke: INK, strokeWidth: LINE, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** Each worker's tool, drawn around 0,0 and standing upright, shown beside them while they work. */
const PROPS: Record<PropId, () => ReactElement> = {
  pail: () => (
    <g>
      <path d="M-17 4 Q0 -24 17 4" fill="none" {...line} />
      <path d="M-19 4 L19 4 L14 40 L-14 40 Z" fill={paper("stone")} {...line} />
      <path d="M-17 10 L17 10" {...line} strokeWidth={LINE * 0.7} />
      <ellipse cx="0" cy="5" rx="17" ry="4" fill={paper("glass")} {...line} />
    </g>
  ),
  hammer: () => (
    <g>
      <rect x="-4.5" y="-30" width="9" height="52" rx="3" fill={paper("wood")} {...line} />
      <path d="M-20 -44 L14 -44 Q24 -44 24 -36 L24 -32 Q24 -26 14 -26 L-20 -26 Z" fill={paper("stone-dark")} {...line} />
      <path d="M-20 -44 L-26 -39 L-26 -31 L-20 -26" fill={paper("stone-dark")} {...line} />
    </g>
  ),
  paintbrush: () => (
    <g>
      <rect x="-4" y="-24" width="8" height="46" rx="4" fill={paper("red")} {...line} />
      <rect x="-6" y="-34" width="12" height="11" fill={paper("stone")} {...line} />
      <path d="M-6 -34 Q-7 -50 0 -56 Q7 -50 6 -34 Z" fill={giftColor("drawing")} {...line} />
    </g>
  ),
  microphone: () => (
    <g>
      <path d="M-5 -14 L5 -14 L3 24 L-3 24 Z" fill={INK} {...line} />
      <circle cx="0" cy="-24" r="12" fill={paper("stone-dark")} {...line} />
      <path d="M-8 -28 L8 -28 M-10 -22 L10 -22 M-4 -34 L-4 -14 M4 -34 L4 -14" {...line} strokeWidth={LINE * 0.5} />
    </g>
  ),
  broom: () => (
    <g>
      <rect x="-3.5" y="-70" width="7" height="104" rx="3" fill={paper("wood")} {...line} />
      <path d="M-6 32 L6 32 L18 66 L-18 66 Z" fill={paper("sun")} {...line} />
      <path d="M-10 44 L-12 64 M-3 44 L-4 65 M4 44 L4 65 M11 44 L12 64" {...line} strokeWidth={LINE * 0.5} />
      <path d="M-8 38 L8 38" {...line} />
    </g>
  ),
};

export function Prop({ id }: { id: PropId }) {
  const Draw = PROPS[id];
  return <Draw />;
}
