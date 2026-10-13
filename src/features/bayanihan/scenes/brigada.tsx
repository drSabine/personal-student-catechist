import { CUT, paper } from "@/features/storybook/art/paper";
import { Birds, CapizWindow, Cloud, detail, FlagPole, MangoTree, PhFlag, Plant, SignText } from "@/features/storybook/art/pieces";
import type { SceneArt } from "./types";

/** Small paper flowers dotted on the grass. */
const FLOWERS = [
  [90, 760],
  [160, 840],
  [420, 870],
  [1110, 860],
  [1350, 760],
  [1500, 850],
  [1260, 880],
] as const;

/** Brigada Eskwela: the school grounds before classes start. */
function Backdrop() {
  return (
    <>
      <rect width="1600" height="900" fill={paper("sky")} />
      <g filter={CUT}>
        <circle cx="1450" cy="110" r="60" fill={paper("sun")} />
      </g>
      <g filter={CUT}>
        <ellipse cx="160" cy="560" rx="420" ry="140" fill={paper("grass-dark")} />
        <ellipse cx="1420" cy="570" rx="460" ry="150" fill={paper("grass-dark")} />
      </g>
      <g filter={CUT}>
        <rect y="510" width="1600" height="390" fill={paper("grass")} />
        <path d="M780 520 L880 520 L1080 900 L580 900 Z" fill={paper("path")} />
      </g>
      {/* The school: cream walls, a red roof, capiz windows with shutters, and a wooden door. */}
      <g filter={CUT}>
        <rect x="400" y="200" width="820" height="320" fill={paper("cream")} />
        <path d="M350 214 L1270 214 L1150 86 L470 86 Z" fill={paper("roof")} />
        <rect x="350" y="204" width="920" height="20" rx="4" fill={paper("wood-dark")} />
        <rect x="400" y="500" width="820" height="20" fill={paper("stone")} />
      </g>
      <path d="M520 120 L1100 120 M500 160 L1120 160" stroke={paper("wood-dark")} strokeWidth="3" opacity="0.35" />
      <g filter={CUT}>
        {[436, 566, 996, 1126].map((x) => (
          <g key={x}>
            <rect x={x - 14} y={286} width="14" height="146" rx="3" fill={paper("leaf")} />
            <rect x={x + 96} y={286} width="14" height="146" rx="3" fill={paper("leaf")} />
            <CapizWindow x={x} y={290} w={96} h={140} />
            <rect x={x - 6} y={430} width="108" height="10" rx="3" fill={paper("wood-dark")} />
          </g>
        ))}
        <rect x="770" y="320" width="120" height="186" rx="6" fill={paper("wood")} />
        <path d="M830 326 L830 500" {...detail} />
        <circle cx="815" cy="420" r="5" fill={paper("gold")} />
        <circle cx="845" cy="420" r="5" fill={paper("gold")} />
        <rect x="750" y="504" width="160" height="16" rx="4" fill={paper("stone-dark")} />
      </g>
      <g filter={CUT}>
        <path d="M400 520 Q430 476 470 506 Q500 474 540 508 Q560 490 570 520 Z" fill={paper("leaf")} />
        <path d="M1090 520 Q1110 486 1150 504 Q1180 476 1220 506 L1220 520 Z" fill={paper("leaf")} />
        {[440, 500, 1130, 1190].map((x) => (
          <circle key={x} cx={x} cy={500} r="7" fill={paper("pink")} />
        ))}
      </g>
      <g filter={CUT}>
        {FLOWERS.map(([x, y]) => (
          <g key={`${x}${y}`}>
            <circle cx={x} cy={y} r="9" fill={paper("white")} />
            <circle cx={x} cy={y} r="4" fill={paper("sun")} />
          </g>
        ))}
      </g>
      <g filter={CUT}>
        <FlagPole x={220} y={580} height={480} />
      </g>
    </>
  );
}

function Pot({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Plant x={0} y={0} s={1.05} />
    </g>
  );
}

export const brigada: SceneArt = {
  Backdrop,
  ambient: [
    { box: [230, 50, 200, 100], move: "drift", Art: () => <Cloud x={330} y={100} s={0.9} /> },
    { box: [700, 15, 240, 110], move: "drift", Art: () => <Cloud x={820} y={70} s={1.1} /> },
    { box: [1120, 110, 170, 75], move: "drift", Art: () => <Cloud x={1210} y={150} s={0.75} /> },
    { box: [0, 170, 60, 30], move: "fly", Art: () => <Birds x={0} y={185} /> },
    { box: [226, 112, 210, 105], move: "wave", Art: () => <PhFlag x={226} y={112} /> },
    { box: [1220, 205, 420, 435], move: "sway", Art: () => <MangoTree x={1430} y={640} s={0.95} /> },
  ],
  jobs: {
    hands: {
      spot: { x: 560, y: 790 },
      stand: { x: 740, y: 600 },
      box: [400, 500, 330, 200],
      Mess: () => (
        <g filter={CUT}>
          <ellipse cx="500" cy="650" rx="78" ry="18" fill={paper("soil")} />
          <ellipse cx="640" cy="642" rx="62" ry="15" fill={paper("soil")} />
          <Pot x={480} y={640} angle={-80} />
          <Pot x={660} y={632} angle={95} />
          <circle cx="575" cy="658" r="10" fill={paper("soil")} />
          <circle cx="440" cy="662" r="7" fill={paper("soil")} />
        </g>
      ),
      Clean: () => (
        <g filter={CUT}>
          <Pot x={450} y={640} />
          <Pot x={565} y={640} />
          <Pot x={680} y={640} />
        </g>
      ),
    },
    building: {
      spot: { x: 1210, y: 790 },
      stand: { x: 1360, y: 600 },
      box: [1060, 560, 300, 150],
      Mess: () => (
        <g filter={CUT}>
          <path d="M1080 610 L1320 634 L1318 654 L1078 630 Z" fill={paper("wood")} />
          <rect x="1100" y="626" width="18" height="60" rx="3" fill={paper("wood-dark")} />
          <rect x="1240" y="676" width="60" height="16" rx="3" fill={paper("wood-dark")} transform="rotate(12 1270 684)" />
          <path d="M1140 620 L1148 628 M1190 625 L1198 633 M1260 632 L1268 640" {...detail} />
        </g>
      ),
      Clean: () => (
        <g filter={CUT}>
          <rect x="1080" y="594" width="240" height="16" rx="4" fill={paper("wood")} />
          <rect x="1080" y="620" width="240" height="20" rx="4" fill={paper("wood")} />
          <rect x="1100" y="636" width="18" height="54" rx="3" fill={paper("wood-dark")} />
          <rect x="1282" y="636" width="18" height="54" rx="3" fill={paper("wood-dark")} />
        </g>
      ),
    },
    drawing: {
      spot: { x: 1160, y: 140 },
      stand: { x: 1055, y: 290 },
      box: [680, 224, 300, 84],
      Mess: () => (
        <g filter={CUT}>
          <rect x="690" y="234" width="280" height="64" rx="8" fill={paper("stone")} />
          <path d="M710 254 L760 254 M890 278 L950 278" stroke={paper("stone-dark")} strokeWidth="4" strokeLinecap="round" />
        </g>
      ),
      Clean: ({ sign }) => (
        <g>
          <g filter={CUT}>
            <rect x="690" y="234" width="280" height="64" rx="8" fill={paper("flag-blue")} />
          </g>
          <SignText x={830} y={266} text={sign} size={34} fill={paper("white")} />
        </g>
      ),
    },
    singing: {
      spot: { x: 270, y: 760 },
      stand: { x: 330, y: 640 },
      box: [0, 0, 0, 0],
    },
    tidying: {
      spot: { x: 880, y: 790 },
      stand: { x: 960, y: 560 },
      box: [740, 560, 340, 140],
      Mess: () => (
        <g filter={CUT}>
          {[
            [780, 600, 20],
            [840, 640, -30],
            [910, 610, 60],
            [990, 650, 10],
            [1040, 600, -50],
            [950, 676, 80],
            [810, 676, 40],
          ].map(([x, y, a]) => (
            <ellipse
              key={`${x}${y}`}
              cx={x}
              cy={y}
              rx="24"
              ry="11"
              transform={`rotate(${a} ${x} ${y})`}
              fill={a > 30 ? paper("gold") : paper("grass-dark")}
            />
          ))}
          <path d="M870 660 L888 646 L906 658 L898 676 L878 678 Z" fill={paper("white")} />
          <path d="M1010 620 L1026 610 L1040 624 L1028 638 Z" fill={paper("white")} />
        </g>
      ),
    },
  },
};
