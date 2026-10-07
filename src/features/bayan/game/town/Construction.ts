import { NoPathFoundStrategy, type GridEngine } from "grid-engine";
import * as Phaser from "phaser";
import { CHURCH_LAYERS, isBuilt, visibleBuildingLayers, type BayanProgress, type TownLot } from "../../BayanRules";
import { LOT_IDS, type BayanContent, type LotId } from "../../content";
import type { ProgressStore, UiStore } from "../../stores";
import { KEY, TILE, type Frames } from "../assets";
import type { GamePalette } from "../createGame";
import type { SoundBoard } from "../SoundBoard";
import type { Lot, TilePoint, TownObjects } from "../mapObjects";
import type { Behaviors } from "./Behaviors";
import type { Cast } from "./Cast";
import type { Chatter } from "./Chatter";

const RISE_FROM = 10;
const SMOKE_EVERY_MS = 900;

/** Steps of a building going up, in milliseconds from the start. */
const BEAT = { secondHammer: 600, rise: 1300, cheer: 2100, settle: 2600 };

/**
 * Shows each lot as the saved progress says. A lot that becomes built while the town is on screen
 * goes up with dust, hammering, and a cheer; on page open everything is simply drawn as it is.
 */
export class Construction {
  private drawn: BayanProgress | null = null;
  private readonly flag: Phaser.GameObjects.Sprite;
  private smokeTimer: Phaser.Time.TimerEvent | null = null;
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly gridEngine: GridEngine,
    private readonly layers: Map<string, Phaser.Tilemaps.TilemapLayer>,
    private readonly objects: TownObjects,
    private readonly cast: Cast,
    private readonly behaviors: Behaviors,
    private readonly frames: Frames,
    private readonly sounds: SoundBoard,
    private readonly chatter: Chatter,
    private readonly content: BayanContent,
    private readonly saved: ProgressStore,
    private readonly ui: UiStore,
    private readonly palette: GamePalette,
  ) {
    const flagAt = objects.flag;
    this.flag = scene.add
      .sprite(flagAt.x * TILE, flagAt.y * TILE, KEY.extraFrames, frames.extra("flag-wave"))
      .setOrigin(0)
      .setVisible(false);
    if (!scene.anims.exists("flag-wave")) {
      scene.anims.create({
        key: "flag-wave",
        frames: [
          { key: KEY.extraFrames, frame: frames.extra("flag-wave") },
          { key: KEY.extraFrames, frame: frames.extra("flag-wave-2") },
        ],
        frameRate: 3,
        repeat: -1,
      });
    }
    this.flag.play("flag-wave");

    this.stops.push(
      saved.subscribe(() => this.sync()),
      ui.subscribe((state, previous) => {
        if (state.ready !== previous.ready || state.dialog !== previous.dialog) this.sync();
      }),
    );
    this.sync();
  }

  dispose(): void {
    for (const stop of this.stops) stop();
    this.smokeTimer?.remove();
  }

  /** Brings the town in line with the save. Waits while someone is talking, so the class sees it happen. */
  private sync() {
    const ui = this.ui.getState();
    if (!ui.ready) return;
    const progress = this.saved.getState().progress;
    if (!this.drawn) {
      this.drawAll(progress);
      this.drawn = progress;
      return;
    }
    if (ui.dialog || progress === this.drawn) return;
    const before = this.drawn;
    this.drawn = progress;
    for (const lot of LOT_IDS) {
      if (lot === "church") continue;
      const was = isBuilt(before, lot);
      const now = isBuilt(progress, lot);
      if (!was && now) this.raise(lot);
      else if (was && !now) this.drawLot(lot, false);
    }
    if (before.church !== progress.church) this.showChurch(progress);
  }

  private drawAll(progress: BayanProgress) {
    const visible = new Set(visibleBuildingLayers(progress));
    for (const [name, layer] of this.layers) layer.setVisible(visible.has(name)).setAlpha(1).setY(0);
    for (const lot of LOT_IDS) if (lot !== "church") this.drawLot(lot, isBuilt(progress, lot));
    // Church builders keep their tools until the church is finished in Stage 2.
    this.placeVillagers("church", progress.church === CHURCH_LAYERS.length - 1);
  }

  private drawLot(lot: TownLot, built: boolean) {
    this.layers.get(`${lot}-site`)?.setVisible(!built).setAlpha(1);
    this.layers.get(`${lot}-built`)?.setVisible(built).setAlpha(1).setY(0);
    this.placeVillagers(lot, built);
    if (lot === "hall") this.flag.setVisible(built).setAlpha(1);
    if (lot === "house") this.setSmoke(built);
  }

  private showChurch(progress: BayanProgress) {
    for (const name of CHURCH_LAYERS) this.layers.get(name)?.setVisible(name === CHURCH_LAYERS[progress.church]);
  }

  /** Builders hold their materials by their lot until it is built, then hang about by it, empty-handed. */
  private placeVillagers(lot: LotId, built: boolean) {
    const gathers = this.objects.gathers[lot];
    this.cast
      .ofKind("villager")
      .filter((villager) => villager.lot === lot)
      .forEach((villager, i) => {
        this.gridEngine.stopMovement(villager.id);
        villager.held?.setVisible(!built).setAlpha(1);
        villager.home = built ? (gathers[i] ?? villager.origin) : villager.origin;
        this.gridEngine.setPosition(villager.id, villager.home);
      });
  }

  private raise(lot: TownLot) {
    const site = this.layers.get(`${lot}-site`);
    const building = this.layers.get(`${lot}-built`);
    const area = this.objects.lots.find((l) => l.id === lot);
    if (!site || !building || !area) return;
    const builders = this.cast.ofKind("villager").filter((v) => v.lot === lot);
    const camera = this.scene.cameras.main;
    const after = (ms: number, fn: () => void) => this.scene.time.delayedCall(ms, fn);

    // Hammering: the builders stop what they are doing, dust flies.
    for (const builder of builders) this.behaviors.hold(builder.id, BEAT.settle + 2000);
    this.sounds.play("hammer");
    camera.shake(250, 0.003);
    for (let i = 0; i < 8; i++) after(i * 150, () => this.dust(randomTileIn(area)));
    after(BEAT.secondHammer, () => this.sounds.play("hammer"));

    // The building rises out of the dust.
    after(BEAT.rise, () => {
      this.sounds.play("rise");
      this.scene.tweens.add({ targets: site, alpha: 0, duration: 300, onComplete: () => site.setVisible(false) });
      building.setVisible(true).setAlpha(0).setY(RISE_FROM);
      this.scene.tweens.add({ targets: building, alpha: 1, y: 0, duration: 750, ease: "Back.easeOut" });
      for (const builder of builders) {
        if (builder.held) this.scene.tweens.add({ targets: builder.held, alpha: 0, duration: 250 });
      }
    });

    // Everyone cheers.
    after(BEAT.cheer, () => {
      this.sounds.play("build");
      this.sounds.play("cheer", 0.5);
      this.burst(area);
      const gathers = this.objects.gathers[lot];
      const lines = this.content.lots[lot].chatter.done;
      builders.forEach((builder, i) => {
        const spot = gathers[i];
        if (spot) {
          builder.home = spot;
          this.gridEngine
            .moveTo(builder.id, spot, { noPathFoundStrategy: NoPathFoundStrategy.CLOSEST_REACHABLE })
            .subscribe({ complete: () => this.hop(builder.sprite) });
        }
        if (lines[i]) after(300 + i * 500, () => this.chatter.say(builder.id, lines[i]));
      });
    });

    after(BEAT.settle, () => {
      if (lot === "hall") {
        this.flag.setVisible(true).setAlpha(0);
        this.scene.tweens.add({ targets: this.flag, alpha: 1, duration: 500 });
      }
      if (lot === "house") this.setSmoke(true);
    });
  }

  private dust(at: TilePoint) {
    const puff = this.scene.add
      .sprite(at.x * TILE + TILE / 2, at.y * TILE + TILE / 2, KEY.extraFrames, this.frames.extra("dust"))
      .setDepth(40)
      .setScale(0.6);
    this.scene.tweens.add({
      targets: puff,
      scale: 1.4,
      alpha: 0,
      y: puff.y - 6,
      duration: 700,
      onComplete: () => puff.destroy(),
    });
  }

  private burst(area: Lot) {
    const emitter = this.scene.add.particles(
      (area.x + area.width / 2) * TILE,
      (area.y + 1) * TILE,
      KEY.extraFrames,
      {
        frame: this.frames.extra("confetti"),
        speed: { min: 60, max: 150 },
        angle: { min: 200, max: 340 },
        gravityY: 220,
        lifespan: 1400,
        rotate: { min: 0, max: 360 },
        tint: [...this.palette.confetti],
        emitting: false,
      },
    );
    emitter.setDepth(45);
    emitter.explode(36);
    this.scene.time.delayedCall(1600, () => emitter.destroy());
  }

  private hop(sprite: Phaser.GameObjects.Sprite) {
    this.scene.tweens.add({ targets: sprite, y: -4, duration: 140, yoyo: true, repeat: 3, ease: "Sine.easeOut" });
  }

  private setSmoke(on: boolean) {
    this.smokeTimer?.remove();
    this.smokeTimer = null;
    if (!on) return;
    const at = this.objects.chimney;
    this.smokeTimer = this.scene.time.addEvent({
      delay: SMOKE_EVERY_MS,
      loop: true,
      callback: () => {
        const puff = this.scene.add
          .sprite(at.x * TILE + TILE / 2, at.y * TILE, KEY.extraFrames, this.frames.extra("dust"))
          .setDepth(48)
          .setScale(0.35)
          .setAlpha(0.7)
          .setTint(this.palette.smoke);
        this.scene.tweens.add({
          targets: puff,
          y: puff.y - 14,
          x: puff.x + Phaser.Math.Between(-3, 3),
          scale: 0.8,
          alpha: 0,
          duration: 2200,
          onComplete: () => puff.destroy(),
        });
      },
    });
  }
}

function randomTileIn(area: Lot): TilePoint {
  return { x: area.x + 1 + Phaser.Math.Between(0, area.width - 3), y: area.y + Phaser.Math.Between(1, area.height - 1) };
}
