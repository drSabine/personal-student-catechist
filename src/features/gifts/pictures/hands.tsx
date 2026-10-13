import { Bust, FOLK } from "@/features/storybook/art/Bust";
import { CUT, paper } from "@/features/storybook/art/paper";
import { Prop } from "@/features/storybook/art/props";
import type { Pictures } from "./types";

export const hands = {
  "hands-heart": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("cream")} />
      <path
        d="M100 118 C60 92 50 62 70 48 C84 38 98 48 100 60 C102 48 116 38 130 48 C150 62 140 92 100 118 Z"
        fill={paper("red")}
      />
      <path d="M28 120 Q30 100 50 106 L96 128 L96 168 Q60 170 34 150 Q24 138 28 120 Z" fill={paper("skin")} />
      <path d="M172 120 Q170 100 150 106 L104 128 L104 168 Q140 170 166 150 Q176 138 172 120 Z" fill={paper("skin")} />
      <path
        d="M40 112 L50 104 M54 116 L64 108 M146 104 L156 112 M136 108 L146 116"
        stroke={paper("trunk")}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  ),
  "carry-water": () => (
    <g>
      <rect width="200" height="200" fill={paper("sky")} />
      <g filter={CUT}>
        <rect y="160" width="200" height="40" fill={paper("grass")} />
        <Bust look={FOLK.boy} gift="hands" face="driven" x={10} y={34} size={150} />
        <g transform="translate(160 120) scale(1.3)">
          <Prop id="pail" />
        </g>
      </g>
      <path d="M150 104 Q146 112 150 116 Q154 112 150 104 Z M176 98 Q172 106 176 110 Q180 106 176 98 Z" fill={paper("glass")} />
    </g>
  ),
  "plant-seedling": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("cream")} />
      <path d="M20 170 Q100 120 180 170 L180 200 L20 200 Z" fill={paper("soil")} />
      <path d="M100 150 L100 100" stroke={paper("leaf-dark")} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="80" cy="96" rx="22" ry="11" transform="rotate(-25 80 96)" fill={paper("leaf")} />
      <ellipse cx="120" cy="92" rx="22" ry="11" transform="rotate(25 120 92)" fill={paper("leaf")} />
      <path d="M10 130 Q40 120 62 136 L74 150 Q66 160 52 152 L20 150 Z" fill={paper("skin")} />
      <path d="M190 130 Q160 120 138 136 L126 150 Q134 160 148 152 L180 150 Z" fill={paper("skin")} />
    </g>
  ),
  "give-pandesal": () => (
    <g filter={CUT}>
      <rect width="200" height="200" fill={paper("sun")} />
      <path d="M60 60 L140 60 L150 170 L50 170 Z" fill={paper("path")} />
      <path d="M60 60 L70 48 L80 60 L90 48 L100 60 L110 48 L120 60 L130 48 L140 60" fill={paper("path")} />
      {[
        [78, 74],
        [104, 70],
        [122, 82],
      ].map(([x, y]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx="20" ry="13" fill={paper("wood")} />
          <path
            d={`M${x - 10} ${y - 2} Q${x} ${y - 8} ${x + 10} ${y - 2}`}
            stroke={paper("wood-dark")}
            strokeWidth="2.5"
            fill="none"
          />
        </g>
      ))}
      <path d="M10 150 Q36 132 62 146 L70 160 Q60 172 40 166 L10 168 Z" fill={paper("skin")} />
      <path d="M190 120 Q164 106 140 122 L132 136 Q142 146 160 140 L190 140 Z" fill={paper("skin")} />
    </g>
  ),
} satisfies Pictures;
