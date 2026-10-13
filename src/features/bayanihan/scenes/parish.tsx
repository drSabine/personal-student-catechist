import { giftColor } from "@/features/storybook/cast";
import { CUT, paper } from "@/features/storybook/art/paper";
import { Banderitas, Cross, detail, SignText } from "@/features/storybook/art/pieces";
import type { SceneArt } from "./types";

/** A wooden pew: a slatted back, the seat, and carved ends, standing on x, y. */
function Pew({ x, y, w = 420 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <rect x={x + 10} y={y - 112} width={w - 20} height="58" rx="6" fill={paper("wood-dark")} />
      <path d={`M${x + 24} ${y - 84} L${x + w - 24} ${y - 84}`} stroke={paper("wood")} strokeWidth="6" strokeLinecap="round" />
      <rect x={x} y={y - 58} width={w} height="18" rx="6" fill={paper("wood")} />
      <path
        d={`M${x - 6} ${y} L${x - 6} ${y - 112} Q${x + 10} ${y - 132} ${x + 26} ${y - 112} L${x + 26} ${y} Z`}
        fill={paper("wood-dark")}
      />
      <path
        d={`M${x + w - 26} ${y} L${x + w - 26} ${y - 112} Q${x + w - 10} ${y - 132} ${x + w + 6} ${y - 112} L${x + w + 6} ${y} Z`}
        fill={paper("wood-dark")}
      />
    </g>
  );
}

/** A hanging lamp on its chain. */
function Lamp({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x} 0 L${x} 150`} stroke={paper("frame")} strokeWidth="3" />
      <path d={`M${x - 30} 186 L${x + 30} 186 L${x + 18} 150 L${x - 18} 150 Z`} fill={paper("gold")} />
      <ellipse cx={x} cy="192" rx="16" ry="9" fill={paper("sun")} />
    </g>
  );
}

/** The stained glass: small colored panes inside the arch, with the cross in front. */
const PANES = ["glass", "glass-warm", "pink", "glass", "leaf", "glass-warm", "glass", "pink", "glass-warm"] as const;

function Vase({ x, y, flowers = true, angle = 0 }: { x: number; y: number; flowers?: boolean; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {flowers && (
        <g>
          <path d="M0 -50 L-24 -96 M0 -50 L0 -110 M0 -50 L24 -96" stroke={paper("leaf-dark")} strokeWidth="5" />
          <circle cx="-24" cy="-100" r="15" fill={paper("pink")} />
          <circle cx="0" cy="-116" r="17" fill={paper("red")} />
          <circle cx="24" cy="-100" r="15" fill={paper("pink")} />
          <circle cx="-12" cy="-80" r="11" fill={paper("white")} />
          <circle cx="14" cy="-78" r="11" fill={paper("sun")} />
        </g>
      )}
      <path d="M-16 -54 L16 -54 Q30 -30 18 0 L-18 0 Q-30 -30 -16 -54 Z" fill={paper("gold")} />
    </g>
  );
}

/** Our parish the day before Sunday Mass: the arched window, the altar, the pews, and banderitas. */
function Backdrop() {
  return (
    <>
      <rect width="1600" height="900" fill={paper("church")} />
      <g filter={CUT}>
        <rect y="640" width="1600" height="260" fill={paper("stone")} />
        <path
          d="M0 720 L1600 720 M0 810 L1600 810 M200 640 L180 900 M500 640 L480 900 M800 640 L800 900 M1100 640 L1120 900 M1400 640 L1420 900"
          {...detail}
          strokeWidth="1.5"
          opacity="0.3"
        />
      </g>
      <g filter={CUT}>
        <path d="M720 640 L880 640 L960 900 L640 900 Z" fill={paper("red")} />
        <rect x="360" y="80" width="70" height="560" fill={paper("stone")} />
        <rect x="1170" y="80" width="70" height="560" fill={paper("stone")} />
        <rect x="350" y="70" width="90" height="24" rx="4" fill={paper("stone-dark")} />
        <rect x="1160" y="70" width="90" height="24" rx="4" fill={paper("stone-dark")} />
        <path d="M660 400 L660 200 Q660 90 800 90 Q940 90 940 200 L940 400 Z" fill={paper("frame")} />
        <clipPath id="parish-arch">
          <path d="M680 384 L680 204 Q680 112 800 112 Q920 112 920 204 L920 384 Z" />
        </clipPath>
        <g clipPath="url(#parish-arch)">
          {PANES.map((pane, i) => (
            <rect key={i} x={680 + (i % 3) * 80} y={110 + Math.floor(i / 3) * 92} width="80" height="92" fill={paper(pane)} />
          ))}
          <path
            d="M760 110 L760 384 M840 110 L840 384 M680 202 L920 202 M680 294 L920 294"
            stroke={paper("frame")}
            strokeWidth="6"
          />
        </g>
        <Cross x={800} y={250} s={1.3} fill={paper("frame")} />
        <circle cx="800" cy="230" r="58" fill="none" stroke={paper("sun")} strokeWidth="6" />
      </g>
      <g filter={CUT}>
        <rect x="470" y="470" width="60" height="150" rx="6" fill={paper("wood-dark")} />
        <path d="M450 470 L550 470 L540 430 L460 430 Z" fill={paper("wood")} />
        <rect x="470" y="612" width="60" height="14" rx="3" fill={paper("stone-dark")} />
      </g>
      <g filter={CUT}>
        <rect x="560" y="610" width="480" height="36" rx="4" fill={paper("stone-dark")} />
        <rect x="590" y="580" width="420" height="34" rx="4" fill={paper("stone")} />
        <rect x="610" y="470" width="380" height="112" fill={paper("wood-dark")} />
        <rect x="596" y="456" width="408" height="56" rx="6" fill={paper("white")} />
        <rect x="596" y="500" width="408" height="10" fill={paper("gold")} />
        <Cross x={800} y={540} s={0.45} fill={paper("gold")} />
        <rect x="680" y="400" width="14" height="56" rx="3" fill={paper("white")} />
        <rect x="906" y="400" width="14" height="56" rx="3" fill={paper("white")} />
      </g>
      <g filter={CUT}>
        <Pew x={60} y={760} />
        <Pew x={1120} y={760} />
        <Pew x={40} y={880} w={460} />
        <Pew x={1100} y={880} w={460} />
      </g>
      <g filter={CUT}>
        <Banderitas x1={0} x2={1600} y={34} sag={22} count={22} />
      </g>
    </>
  );
}

/** A candle flame, its foot at x, y. */
function Flame({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y - 26} Q${x + 9} ${y - 10} ${x} ${y} Q${x - 9} ${y - 10} ${x} ${y - 26} Z`} fill={paper("sun")} />;
}

export const parish: SceneArt = {
  Backdrop,
  ambient: [
    { box: [500, 0, 80, 205], move: "swing", Art: () => <Lamp x={540} /> },
    { box: [1020, 0, 80, 205], move: "swing", Art: () => <Lamp x={1060} /> },
    { box: [677, 374, 20, 26], move: "flicker", Art: () => <Flame x={687} y={400} /> },
    { box: [903, 374, 20, 26], move: "flicker", Art: () => <Flame x={913} y={400} /> },
  ],
  jobs: {
    hands: {
      spot: { x: 800, y: 790 },
      stand: { x: 800, y: 680 },
      box: [520, 300, 560, 420],
      Mess: () => (
        <g filter={CUT}>
          <g transform="translate(600 696) scale(1.4)">
            <Vase x={0} y={0} angle={-88} flowers={false} />
          </g>
          <g transform="translate(1040 690) scale(1.4)">
            <Vase x={0} y={0} flowers={false} />
          </g>
        </g>
      ),
      Clean: () => (
        <g filter={CUT}>
          <Vase x={630} y={458} />
          <Vase x={970} y={458} />
        </g>
      ),
    },
    building: {
      spot: { x: 290, y: 560 },
      stand: { x: 580, y: 730 },
      box: [60, 690, 440, 90],
      Mess: () => (
        <g filter={CUT}>
          <rect x="90" y="742" width="380" height="16" rx="5" fill={paper("wood")} transform="rotate(7 90 742)" />
          <rect x="430" y="748" width="14" height="30" rx="3" fill={paper("wood-dark")} transform="rotate(40 437 763)" />
        </g>
      ),
      Clean: () => (
        <g filter={CUT}>
          <rect x="90" y="742" width="380" height="16" rx="5" fill={paper("wood")} />
          <rect x="100" y="756" width="12" height="18" fill={paper("wood-dark")} />
          <rect x="448" y="756" width="12" height="18" fill={paper("wood-dark")} />
        </g>
      ),
    },
    drawing: {
      spot: { x: 1080, y: 290 },
      stand: { x: 1240, y: 330 },
      box: [1240, 140, 340, 160],
      Mess: () => (
        <g filter={CUT}>
          <rect x="1252" y="150" width="316" height="10" rx="5" fill={paper("wood-dark")} />
          <path d="M1262 158 L1558 158 L1558 270 L1410 290 L1262 270 Z" fill={paper("white")} />
        </g>
      ),
      Clean: ({ sign }) => (
        <g>
          <g filter={CUT}>
            <rect x="1252" y="150" width="316" height="10" rx="5" fill={paper("wood-dark")} />
            <path d="M1262 158 L1558 158 L1558 270 L1410 290 L1262 270 Z" fill={giftColor("drawing")} />
          </g>
          <SignText x={1410} y={206} text={sign} size={26} fill={paper("white")} />
        </g>
      ),
    },
    singing: {
      spot: { x: 1400, y: 560 },
      stand: { x: 1440, y: 500 },
      box: [0, 0, 0, 0],
    },
    tidying: {
      spot: { x: 160, y: 380 },
      stand: { x: 1040, y: 800 },
      box: [40, 620, 1520, 270],
      Mess: () => (
        <g fill={paper("dust")} opacity="0.85">
          {[
            [120, 660],
            [260, 652],
            [400, 664],
            [1180, 656],
            [1330, 650],
            [1470, 662],
            [150, 780],
            [330, 772],
            [1200, 776],
            [1420, 784],
          ].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <ellipse cx={x} cy={y} rx="46" ry="14" />
              <circle cx={x + 30} cy={y - 16} r="7" />
              <circle cx={x - 26} cy={y - 18} r="5" />
            </g>
          ))}
        </g>
      ),
    },
  },
};
