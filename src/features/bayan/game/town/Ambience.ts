import { Direction, type GridEngine } from "grid-engine";
import * as Phaser from "phaser";
import type { SoundName } from "../../BayanActivity";
import { KEY, TILE, type Frames } from "../assets";
import type { GamePalette } from "../createGame";
import type { SoundBoard } from "../SoundBoard";
import type { TileRect, TownObjects } from "../mapObjects";
import { headOf, type Cast } from "./Cast";

/** Depths above the people, so things that fly pass over them. Clouds stay under the leaders' markers. */
const DEPTH = { clouds: 51, butterflies: 55, birds: 60, hearts: 62 };
/** Light enough that nothing under a cloud is ever hard to see. */
const CLOUD_ALPHA = 0.55;
const CLOUD_COUNT = 2;

const PET_SOUND: Record<string, SoundName> = { chicken: "cluck", chick: "cluck", dog: "bark", cat: "meow", duck: "quack" };

/**
 * The town's scenery that moves on its own: ducks, butterflies, birds, clouds, glints on the water,
 * and petting animals. How people and animals walk lives in Behaviors.
 */
export class Ambience {
  private readonly timers: Phaser.Time.TimerEvent[] = [];
  private readonly ducks: Phaser.GameObjects.Sprite[] = [];
  private readonly turning: { unsubscribe(): void };
  private stopped = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly gridEngine: GridEngine,
    private readonly cast: Cast,
    objects: TownObjects,
    private readonly frames: Frames,
    private readonly sounds: SoundBoard,
    private readonly palette: GamePalette,
    private readonly world: { width: number; height: number },
  ) {
    this.makeAnimations();
    // Everyone faces the way they walk. The art faces right, so walking left flips it.
    this.turning = gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      const actor = cast.get(charId);
      if (direction === Direction.LEFT) actor?.sprite.setFlipX(true);
      if (direction === Direction.RIGHT) actor?.sprite.setFlipX(false);
    });
    for (const pond of objects.ponds) this.addPond(pond);
    for (const meadow of objects.meadows) for (let i = 0; i < meadow.butterflies; i++) this.addButterfly(meadow);
    this.addClouds();
    this.timers.push(scene.time.addEvent({ delay: 9000, loop: true, callback: () => this.flyBird() }));
    this.scene.time.delayedCall(2500, () => this.flyBird());
  }

  /** A pat or a tap on an animal: a heart and its sound. */
  pet(id: string): void {
    const actor = this.cast.get(id);
    if (!actor) return;
    const head = headOf(actor);
    this.heart(head.x, head.y);
    const sound = PET_SOUND[actor.look];
    if (sound) this.sounds.play(sound);
    if (actor.kind === "animal" && actor.look !== "cat") {
      this.scene.tweens.add({ targets: actor.sprite, y: -3, duration: 120, yoyo: true, repeat: 1 });
    }
  }

  /** Ducks are not on the grid, so the scene asks here whether a tap landed on one. */
  duckAt(x: number, y: number): Phaser.GameObjects.Sprite | null {
    return this.ducks.find((duck) => duck.getBounds().contains(x, y)) ?? null;
  }

  quack(duck: Phaser.GameObjects.Sprite): void {
    this.heart(duck.x, duck.y - TILE / 2);
    this.sounds.play("quack");
  }

  dispose(): void {
    this.stopped = true;
    this.turning.unsubscribe();
    for (const timer of this.timers) timer.remove();
  }

  private makeAnimations() {
    const anims = this.scene.anims;
    const make = (key: string, names: string[], frameRate: number) => {
      if (anims.exists(key)) return;
      anims.create({
        key,
        frames: names.map((name) => ({ key: KEY.extraFrames, frame: this.frames.extra(name) })),
        frameRate,
        repeat: -1,
      });
    };
    make("butterfly", ["butterfly", "butterfly-shut"], 8);
    make("bird", ["bird", "bird-flap"], 6);
    make("duck", ["duck", "duck-bob"], 2);
    make("cat", ["cat", "cat", "cat", "cat", "cat", "cat-blink"], 3);
  }

  private addPond(pond: TileRect & { ducks: number }) {
    const left = pond.x * TILE + 6;
    const right = (pond.x + pond.width) * TILE - 10;
    for (let i = 0; i < pond.ducks; i++) {
      const y = (pond.y + (i % pond.height)) * TILE + 6;
      const duck = this.scene.add
        .sprite(Phaser.Math.Between(left, right), y, KEY.extraFrames, this.frames.extra("duck"))
        .setDepth(5)
        .play("duck");
      this.ducks.push(duck);
      const swim = () => {
        if (this.stopped || !duck.active) return;
        const to = Phaser.Math.Between(left, right);
        duck.setFlipX(to < duck.x);
        this.scene.tweens.add({
          targets: duck,
          x: to,
          duration: Math.abs(to - duck.x) * 90 + 600,
          ease: "Sine.easeInOut",
          onComplete: () => this.scene.time.delayedCall(Phaser.Math.Between(800, 2500), swim),
        });
      };
      swim();
    }
    // Light glinting on the water.
    this.timers.push(
      this.scene.time.addEvent({
        delay: 700,
        loop: true,
        callback: () => {
          const glint = this.scene.add
            .sprite(
              Phaser.Math.Between(left, right),
              Phaser.Math.Between(pond.y * TILE + 4, (pond.y + pond.height) * TILE - 4),
              KEY.extraFrames,
              this.frames.extra("spark"),
            )
            .setDepth(4)
            .setScale(0.4)
            .setAlpha(0);
          this.scene.tweens.add({
            targets: glint,
            alpha: 0.9,
            duration: 350,
            yoyo: true,
            onComplete: () => glint.destroy(),
          });
        },
      }),
    );
  }

  private addButterfly(meadow: TileRect) {
    const bounds = {
      left: meadow.x * TILE,
      right: (meadow.x + meadow.width) * TILE,
      top: meadow.y * TILE,
      bottom: (meadow.y + meadow.height) * TILE,
    };
    const butterfly = this.scene.add
      .sprite(
        Phaser.Math.Between(bounds.left, bounds.right),
        Phaser.Math.Between(bounds.top, bounds.bottom),
        KEY.extraFrames,
        this.frames.extra("butterfly"),
      )
      .setDepth(DEPTH.butterflies)
      .setTint(Phaser.Utils.Array.GetRandom([...this.palette.butterflies]))
      .play("butterfly");
    const flutter = () => {
      if (this.stopped || !butterfly.active) return;
      const x = Phaser.Math.Between(bounds.left, bounds.right);
      butterfly.setFlipX(x < butterfly.x);
      this.scene.tweens.add({
        targets: butterfly,
        x,
        y: Phaser.Math.Between(bounds.top, bounds.bottom),
        duration: Phaser.Math.Between(1800, 3200),
        ease: "Sine.easeInOut",
        onComplete: flutter,
      });
    };
    flutter();
  }

  private flyBird() {
    if (this.stopped) return;
    const fromLeft = Math.random() < 0.5;
    const y = Phaser.Math.Between(TILE, this.world.height / 3);
    const bird = this.scene.add
      .sprite(fromLeft ? -TILE : this.world.width + TILE, y, KEY.extraFrames, this.frames.extra("bird"))
      .setDepth(DEPTH.birds)
      .setFlipX(!fromLeft)
      .play("bird");
    this.scene.tweens.add({
      targets: bird,
      x: fromLeft ? this.world.width + TILE : -TILE,
      y: y + Phaser.Math.Between(-20, 20),
      duration: Phaser.Math.Between(6000, 9000),
      onComplete: () => bird.destroy(),
    });
  }

  /** A couple of white clouds drifting slowly across, each at its own height and pace. */
  private addClouds() {
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const cloud = this.scene.add.image(0, 0, KEY.cloud).setDepth(DEPTH.clouds).setAlpha(CLOUD_ALPHA);
      const drift = (start: number) => {
        if (this.stopped || !cloud.active) return;
        const width = cloud.displayWidth;
        cloud.setPosition(start, Phaser.Math.Between(TILE * 2, this.world.height - TILE * 2));
        cloud.setScale(Phaser.Math.FloatBetween(1, 1.6));
        const distance = this.world.width + width - start;
        this.scene.tweens.add({
          targets: cloud,
          x: this.world.width + width,
          duration: (distance / this.world.width) * Phaser.Math.Between(70_000, 110_000),
          onComplete: () => drift(-width),
        });
      };
      drift((this.world.width / CLOUD_COUNT) * i + Phaser.Math.Between(0, TILE * 8));
    }
  }

  private heart(x: number, y: number) {
    const heart = this.scene.add
      .sprite(x, y, KEY.extraFrames, this.frames.extra("heart"))
      .setDepth(DEPTH.hearts)
      .setScale(0.7);
    this.scene.tweens.add({ targets: heart, y: y - 12, alpha: 0, duration: 900, onComplete: () => heart.destroy() });
  }
}
