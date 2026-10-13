import { CUT, paper } from "@/features/storybook/art/paper";
import { CapizWindow, Cross, detail, Plant, SignText } from "@/features/storybook/art/pieces";
import type { SceneArt } from "./types";

/** A classroom chair, standing on x, y. */
function Chair({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(1.25)`}>
      <rect x="-34" y="-128" width="68" height="46" rx="8" fill={paper("flag-blue")} />
      <rect x="-30" y="-84" width="8" height="40" fill={paper("stone-dark")} />
      <rect x="22" y="-84" width="8" height="40" fill={paper("stone-dark")} />
      <rect x="-40" y="-50" width="80" height="14" rx="5" fill={paper("flag-blue")} />
      <rect x="-34" y="-38" width="8" height="38" fill={paper("stone-dark")} />
      <rect x="26" y="-38" width="8" height="38" fill={paper("stone-dark")} />
    </g>
  );
}

function Book({
  x,
  y,
  w = 18,
  h = 70,
  color,
  angle = 0,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  color: Parameters<typeof paper>[0];
  angle?: number;
}) {
  return (
    <rect x={x} y={y - h} width={w} height={h} rx="3" fill={paper(color)} transform={`rotate(${angle} ${x + w / 2} ${y})`} />
  );
}

function Shelf({ tilt = 0 }: { tilt?: number }) {
  return (
    <g transform={`rotate(${tilt} 1180 640)`}>
      <rect x="1180" y="440" width="240" height="200" rx="6" fill={paper("wood-dark")} />
      <rect x="1194" y="454" width="212" height="80" fill={paper("wood")} />
      <rect x="1194" y="546" width="212" height="80" fill={paper("wood")} />
    </g>
  );
}

/** Our classroom: a mint wall, the chalkboard with a small crucifix, capiz windows, and a plant. */
function Backdrop() {
  return (
    <>
      <rect width="1600" height="900" fill={paper("mint")} />
      <g filter={CUT}>
        <rect y="630" width="1600" height="270" fill={paper("wood")} />
        <rect y="618" width="1600" height="18" fill={paper("wood-dark")} />
      </g>
      <path
        d="M0 700 L1600 700 M0 780 L1600 780 M0 860 L1600 860 M300 636 L260 700 M900 700 L880 780 M500 780 L470 860 M1300 780 L1320 860"
        {...detail}
        strokeWidth="1.5"
        opacity="0.35"
      />
      <g filter={CUT}>
        <rect x="510" y="140" width="580" height="290" rx="10" fill={paper("wood-dark")} />
        <rect x="528" y="158" width="544" height="254" rx="4" fill={paper("chalkboard")} />
        <rect x="540" y="420" width="520" height="14" rx="4" fill={paper("wood")} />
        <rect x="600" y="412" width="30" height="8" rx="2" fill={paper("chalk")} />
      </g>
      <g filter={CUT}>
        <Cross x={800} y={84} s={0.8} />
        <circle cx="800" cy="58" r="6" fill={paper("skin")} />
        <path d="M778 68 L822 68 L806 74 L804 104 L796 104 L794 74 Z" fill={paper("skin")} />
      </g>
      {/* The alphabet cards above the bulletin board, and the wall clock. */}
      <g filter={CUT}>
        {["A", "B", "C", "D", "E", "F", "G"].map((letter, i) => (
          <g key={letter}>
            <rect x={96 + i * 48} y={92} width="40" height="48" rx="4" fill={i % 2 ? paper("sun") : paper("pink")} />
            <SignText x={116 + i * 48} y={117} text={letter} size={28} />
          </g>
        ))}
        <circle cx="1170" cy="80" r="44" fill={paper("white")} />
        <circle cx="1170" cy="80" r="44" fill="none" stroke={paper("frame")} strokeWidth="8" />
        <path d="M1170 80 L1192 92" stroke={paper("frame")} strokeWidth="5" strokeLinecap="round" />
      </g>
      <g filter={CUT}>
        <rect x="90" y="160" width="340" height="250" rx="8" fill={paper("wood-dark")} />
        <rect x="104" y="174" width="312" height="222" rx="4" fill={paper("clay")} opacity="0.55" />
        <circle cx="130" cy="196" r="6" fill={paper("red")} />
        <circle cx="390" cy="196" r="6" fill={paper("flag-blue")} />
      </g>
      <g filter={CUT}>
        <CapizWindow x={1210} y={150} w={130} h={200} />
        <CapizWindow x={1370} y={150} w={130} h={200} />
      </g>
    </>
  );
}

export const classroom: SceneArt = {
  Backdrop,
  ambient: [
    {
      box: [1120, 30, 100, 100],
      move: "spin",
      Art: () => <path d="M1170 80 L1170 48" stroke={paper("frame")} strokeWidth="4" strokeLinecap="round" />,
    },
    { box: [1470, 460, 140, 200], move: "sway", Art: () => <Plant x={1540} y={660} s={1.4} /> },
    {
      box: [0, 470, 60, 30],
      move: "fly",
      Art: () => (
        <path
          d="M0 490 L60 478 L22 500 Z M22 500 L60 478 L30 488 Z"
          fill={paper("white")}
          stroke={paper("stone-dark")}
          strokeWidth="2"
        />
      ),
    },
  ],
  jobs: {
    hands: {
      spot: { x: 210, y: 770 },
      stand: { x: 1080, y: 760 },
      box: [380, 640, 680, 240],
      Mess: () => (
        <g filter={CUT}>
          <Chair x={470} y={790} angle={-28} />
          <Chair x={640} y={860} angle={18} />
          <Chair x={810} y={780} angle={-75} />
          <Chair x={960} y={860} angle={34} />
        </g>
      ),
      Clean: () => (
        <g filter={CUT}>
          <Chair x={460} y={850} />
          <Chair x={620} y={850} />
          <Chair x={780} y={850} />
          <Chair x={940} y={850} />
        </g>
      ),
    },
    building: {
      spot: { x: 1300, y: 410 },
      stand: { x: 1110, y: 610 },
      box: [1120, 430, 340, 240],
      Mess: () => (
        <g filter={CUT}>
          <Shelf tilt={-9} />
          <Book x={1210} y={548} color="flag-blue" angle={-9} />
          <Book x={1170} y={655} color="red" h={18} w={70} />
          <Book x={1250} y={650} color="sun" h={16} w={64} angle={8} />
          <Book x={1340} y={652} color="leaf" h={16} w={60} angle={-6} />
        </g>
      ),
      Clean: () => (
        <g filter={CUT}>
          <Shelf />
          {(["flag-blue", "red", "sun", "leaf", "pink", "flag-blue", "sun"] as const).map((color, i) => (
            <Book key={i} x={1206 + i * 26} y={534} color={color} h={i % 2 ? 62 : 72} />
          ))}
          {(["leaf", "red", "pink", "flag-blue", "sun"] as const).map((color, i) => (
            <Book key={`b${i}`} x={1206 + i * 26} y={626} color={color} h={i % 2 ? 66 : 74} />
          ))}
        </g>
      ),
    },
    drawing: {
      spot: { x: 260, y: 500 },
      stand: { x: 470, y: 330 },
      box: [104, 174, 312, 222],
      Clean: ({ sign }) => (
        <g>
          <g filter={CUT}>
            <rect x="130" y="210" width="260" height="150" rx="6" fill={paper("white")} transform="rotate(-2 260 285)" />
            <circle cx="170" cy="330" r="14" fill={paper("sun")} />
            <path d="M330 340 L350 310 L370 340 Z" fill={paper("leaf")} />
          </g>
          <SignText x={260} y={268} text={sign} size={30} fill={paper("flag-blue")} />
        </g>
      ),
    },
    singing: {
      spot: { x: 1420, y: 790 },
      stand: { x: 1330, y: 720 },
      box: [0, 0, 0, 0],
    },
    tidying: {
      spot: { x: 800, y: 500 },
      stand: { x: 870, y: 470 },
      box: [528, 158, 544, 254],
      Mess: () => (
        <g stroke={paper("chalk")} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M570 210 Q620 170 660 230 T760 210 T860 250" />
          <path d="M600 300 L690 260 L640 350 L740 320" />
          <path d="M880 190 Q960 260 1020 200 Q1040 300 940 330" />
          <path d="M780 360 Q840 300 900 370 Q960 330 1030 380" />
          <circle cx="700" cy="380" r="18" />
        </g>
      ),
    },
  },
};
