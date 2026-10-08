import type * as Phaser from "phaser";
import type { SoundName } from "../BayanActivity";
import type { EventBus } from "../events";
import type { ProgressStore, UiStore } from "../stores";
import { soundKey } from "./assets";

const MUSIC_VOLUME = 0.32;
/** Music drops while someone speaks, so the words are easy to hear. */
const MUSIC_UNDER_TALK = 0.12;
const BLIP_GAP_MS = 70;

const EVENT_SOUNDS: Partial<Record<string, SoundName[]>> = {
  pop: ["pop"],
  talk: ["talk"],
  correct: ["right", "sparkle"],
  reveal: ["rise", "sparkle"],
  wrong: ["wrong"],
  "stage-complete": ["stage", "cheer"],
};

/** Plays the music and every sound, following the teacher's Music and Sounds switches. */
export class SoundBoard {
  private readonly music: Phaser.Sound.BaseSound;
  private lastBlip = 0;
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly saved: ProgressStore,
    private readonly ui: UiStore,
    bus: EventBus,
  ) {
    this.music = scene.sound.add(soundKey("music"), { loop: true, volume: MUSIC_VOLUME });
    this.stops.push(
      saved.subscribe(() => this.updateMusic()),
      ui.subscribe((state, previous) => {
        if (state.started !== previous.started || state.dialog !== previous.dialog) this.updateMusic();
      }),
      bus.on((event) => {
        if (event.type === "blip") return this.blip();
        for (const name of EVENT_SOUNDS[event.type] ?? []) this.play(name);
      }),
    );
    this.updateMusic();
  }

  play(name: SoundName, volume = 0.7): void {
    if (!this.saved.getState().sounds) return;
    this.wake();
    this.scene.sound.play(soundKey(name), { volume });
  }

  /** The audio context is shared by every game on the page; a game closing earlier may have paused it. */
  private wake() {
    const context = (this.scene.sound as Phaser.Sound.WebAudioSoundManager).context as AudioContext | undefined;
    if (context?.state === "suspended") void context.resume();
  }

  dispose(): void {
    for (const stop of this.stops) stop();
    this.music.destroy();
  }

  private blip() {
    const now = this.scene.time.now;
    if (now - this.lastBlip < BLIP_GAP_MS) return;
    this.lastBlip = now;
    this.play("blip", 0.25);
  }

  private updateMusic() {
    const wanted = this.saved.getState().music && this.ui.getState().started;
    if (!wanted) {
      if (this.music.isPlaying) this.music.pause();
      return;
    }
    this.wake();
    const volume = this.ui.getState().dialog ? MUSIC_UNDER_TALK : MUSIC_VOLUME;
    (this.music as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setVolume(volume);
    if (this.music.isPaused) this.music.resume();
    else if (!this.music.isPlaying) this.music.play();
  }
}
