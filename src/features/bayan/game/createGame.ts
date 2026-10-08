import { GridEngine } from "grid-engine";
import * as Phaser from "phaser";
import type { BayanAssets } from "../BayanActivity";
import type { BayanContent } from "../content";
import type { BayanSession } from "../session";
import { ChurchScene } from "./ChurchScene";
import { TownScene } from "./TownScene";

/** Art colors for tinted sprites, read from the design tokens. */
export interface GamePalette {
  confetti: readonly number[];
  /** The tile outline where the pupil can walk, and the X where they cannot. */
  walkable: number;
  blocked: number;
}

/** What the scenes are given. They reach React only through the session's stores and bus. */
export interface GameDeps {
  assets: BayanAssets;
  content: BayanContent;
  session: BayanSession;
  palette: GamePalette;
  /** Color behind the map where it does not fill the screen. */
  backdrop: string;
  /** Smallest a tile may look on screen, in CSS pixels, before the camera follows the pupil instead. */
  minTile: number;
  /** The viewer asked for reduced motion: the jeepney stays parked. */
  calm: boolean;
}

let audioContext: AudioContext | null = null;

/** One audio context for the page. Browsers allow only a few, and each new game would otherwise make one. */
function sharedAudio(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

/** Starts the game inside `parent`. The caller destroys it. */
export function createGame(parent: HTMLElement, deps: GameDeps): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: deps.backdrop,
    banner: false,
    audio: { context: sharedAudio() },
    // Sized by hand below, so the canvas matches the screen's real pixels.
    scale: { mode: Phaser.Scale.NONE, width: 1, height: 1 },
    plugins: { scene: [{ key: "gridEngine", plugin: GridEngine, mapping: "gridEngine" }] },
    // The town opens first and loads both scenes' files.
    scene: [new TownScene(deps), new ChurchScene(deps)],
  });

  // Draw at device pixels and show at CSS size, so pixel art stays sharp on any screen.
  const fit = () => {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(parent.clientWidth * ratio));
    const height = Math.max(1, Math.round(parent.clientHeight * ratio));
    game.scale.resize(width, height);
    game.scale.setZoom(1 / ratio);
  };
  const observer = new ResizeObserver(() => {
    if (game.isBooted) fit();
  });
  game.events.once(Phaser.Core.Events.READY, () => {
    fit();
    observer.observe(parent);
  });
  game.events.once(Phaser.Core.Events.DESTROY, () => observer.disconnect());
  return game;
}
