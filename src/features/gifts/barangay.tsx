import { HandsPraying, MusicNotes } from "@phosphor-icons/react";
import { memo } from "react";
import { giftColor } from "@/features/storybook/cast";
import { Bust, FOLK } from "@/features/storybook/art/Bust";
import { CUT, paper } from "@/features/storybook/art/paper";
import { Banderitas, CapizWindow, Cloud, Cross, MangoTree, SignText } from "@/features/storybook/art/pieces";
import { Prop } from "@/features/storybook/art/props";
import type { RoundGift } from "./content";

/** The picture is 1200 by 800, cut into 3 by 2 pieces of 400. */
export const PICTURE_WIDTH = 1200;
export const PICTURE_HEIGHT = 800;
export const COLS = 3;
export const ROWS = 2;

/** Which piece shows each gift at work: column, row. */
export const CELLS: Readonly<Record<RoundGift, readonly [number, number]>> = {
  hands: [0, 0],
  singing: [1, 0],
  drawing: [2, 0],
  building: [0, 1],
  teaching: [1, 1],
  praying: [2, 1],
};

/** The barangay working together in front of the church, one gift in each piece. Drawn once. */
export const BarangayPicture = memo(function BarangayPicture({ poster }: { poster: readonly [string, string] }) {
  return (
    <svg viewBox={`0 0 ${PICTURE_WIDTH} ${PICTURE_HEIGHT}`} aria-hidden className="absolute inset-0 size-full">
      <rect width="1200" height="800" fill={paper("sky")} />
      <g filter={CUT}>
        <circle cx="1080" cy="110" r="50" fill={paper("sun")} />
        <Cloud x={200} y={110} s={0.8} />
        <Cloud x={900} y={200} s={0.7} />
      </g>
      <g filter={CUT}>
        <path
          d="M0 420 L180 250 L330 380 L480 260 L640 400 L820 270 L1000 390 L1200 280 L1200 480 L0 480 Z"
          fill={paper("leaf-dark")}
        />
      </g>
      <g filter={CUT}>
        <rect y="440" width="1200" height="360" fill={paper("grass")} />
        <path d="M380 440 L820 440 L900 800 L300 800 Z" fill={paper("path")} />
      </g>

      {/* The church, at the top middle, with its bell and big door. */}
      <g filter={CUT}>
        <rect x="430" y="170" width="340" height="300" fill={paper("church")} />
        <path d="M410 180 L600 70 L790 180 Z" fill={paper("roof")} />
        <rect x="575" y="28" width="50" height="70" fill={paper("church")} />
        <path d="M565 32 L600 6 L635 32 Z" fill={paper("roof")} />
        <circle cx="600" cy="66" r="14" fill={paper("gold")} />
        <Cross x={600} y={-10} s={0.35} fill={paper("gold")} />
        <circle cx="600" cy="220" r="34" fill={paper("glass-warm")} />
        <path d="M545 470 L545 340 Q545 290 600 290 Q655 290 655 340 L655 470 Z" fill={paper("wood-dark")} />
        <path d="M600 296 L600 470" stroke={paper("wood")} strokeWidth="4" />
        <CapizWindow x={455} y={260} w={64} h={96} cols={2} rows={3} />
        <CapizWindow x={681} y={260} w={64} h={96} cols={2} rows={3} />
      </g>
      <g filter={CUT}>
        <Banderitas x1={0} x2={1200} y={150} sag={30} count={18} />
      </g>

      {/* Hands: a neighbor carries water from the poso to the house. */}
      <g filter={CUT}>
        <rect x="40" y="240" width="170" height="130" fill={paper("path")} />
        <path d="M20 250 L125 170 L230 250 Z" fill={paper("gold")} />
        <rect x="100" y="290" width="44" height="80" fill={paper("wood")} />
        <rect x="270" y="320" width="22" height="80" rx="4" fill={paper("stone-dark")} />
        <path d="M292 330 L340 310" stroke={paper("stone-dark")} strokeWidth="10" strokeLinecap="round" />
        <path d="M250 330 L270 330 L270 346 L256 346 Z" fill={paper("stone-dark")} />
        <Bust look={FOLK.boy} gift="hands" face="driven" x={180} y={250} size={150} />
        <g transform="translate(330 380) scale(1.2)">
          <Prop id="pail" />
        </g>
      </g>

      {/* Singing: the choir sings at the church door. */}
      <g filter={CUT}>
        <Bust look={FOLK.girl} gift="singing" face="explaining" x={430} y={300} size={120} />
        <Bust look={FOLK.small} gift="singing" face="smileBig" x={650} y={306} size={114} />
      </g>
      <g fill={giftColor("singing")}>
        <MusicNotes x={470} y={240} width={50} height={50} weight="fill" />
        <MusicNotes x={690} y={240} width={44} height={44} weight="fill" />
      </g>

      {/* Drawing: a poster to keep the barangay clean. */}
      <g filter={CUT}>
        <MangoTree x={1120} y={460} s={0.55} />
        <path d="M900 420 L930 250 M1040 420 L1010 250" stroke={paper("wood-dark")} strokeWidth="9" />
        <rect x="880" y="220" width="180" height="140" rx="6" fill={paper("white")} />
        <path d="M900 330 L940 300 L980 330 Z" fill={paper("leaf")} />
        <circle cx="1020" cy="320" r="16" fill={paper("sun")} />
        <Bust look={FOLK.big} gift="drawing" face="driven" x={790} y={300} size={130} />
      </g>
      <SignText x={970} y={256} text={poster[0]} size={24} fill={giftColor("drawing")} />
      <SignText x={970} y={284} text={poster[1]} size={24} fill={giftColor("drawing")} />

      {/* Building: fixing the chapel bench. */}
      <g filter={CUT}>
        <rect x="60" y="590" width="260" height="20" rx="5" fill={paper("wood")} />
        <rect x="60" y="560" width="260" height="16" rx="5" fill={paper("wood")} />
        <rect x="80" y="606" width="18" height="70" fill={paper("wood-dark")} />
        <rect x="282" y="606" width="18" height="70" fill={paper("wood-dark")} />
        <rect x="40" y="700" width="110" height="64" rx="8" fill={paper("red")} />
        <rect x="40" y="718" width="110" height="8" fill={paper("roof")} />
        <Bust look={FOLK.kuya} gift="building" face="driven" x={220} y={560} size={150} />
        <g transform="translate(220 620) rotate(-40) scale(1.2)">
          <Prop id="hammer" />
        </g>
      </g>

      {/* Teaching: an older child reads to a younger one. */}
      <g filter={CUT}>
        <path d="M430 740 L770 740 L740 790 L460 790 Z" fill={paper("pink")} />
        <Bust look={FOLK.lola} gift="teaching" face="explaining" x={430} y={560} size={170} />
        <Bust look={FOLK.small} gift="hands" face="smileBig" x={620} y={610} size={130} />
        <path
          d="M600 700 Q570 690 540 700 L540 740 Q570 730 600 740 Q630 730 660 740 L660 700 Q630 690 600 700 Z"
          fill={paper("white")}
        />
        <path d="M600 700 L600 740" stroke={paper("stone-dark")} strokeWidth="3" />
      </g>

      {/* Praying: a wayside cross with candles, and a child praying for the sick. */}
      <g filter={CUT}>
        <rect x="960" y="500" width="160" height="200" rx="10" fill={paper("stone")} />
        <path d="M950 510 L1040 450 L1130 510 Z" fill={paper("stone-dark")} />
        <Cross x={1040} y={590} s={0.9} fill={paper("wood-dark")} />
        {[990, 1090].map((x) => (
          <g key={x}>
            <rect x={x - 8} y="640" width="16" height="44" rx="3" fill={paper("white")} />
            <ellipse cx={x} cy="632" rx="6" ry="10" fill={paper("glass-warm")} />
          </g>
        ))}
        <Bust look={FOLK.girl} gift="praying" face="calm" x={820} y={600} size={150} />
      </g>
      <HandsPraying x={872} y={712} width={46} height={46} weight="fill" color={paper("skin")} />
    </svg>
  );
});
