import type { BayanProgress } from "../BayanRules";
import type { Near } from "../stores";
import { Frames, KEY } from "./assets";
import type { GameDeps } from "./createGame";
import { readChurchObjects, type ChurchObjects, type TilePoint } from "./mapObjects";
import { SoundBoard } from "./SoundBoard";
import { Behaviors } from "./town/Behaviors";
import { Cast } from "./town/Cast";
import { Chatter } from "./town/Chatter";
import { Markers, type MarkPlan } from "./town/Markers";
import type { TownStart } from "./TownScene";
import { PLAYER, WalkScene } from "./WalkScene";

/** Stage 3: inside the church, the leaders of the Church stand in a line to meet. */
export class ChurchScene extends WalkScene {
  private chatter!: Chatter;
  private markers!: Markers;
  private objects!: ChurchObjects;

  constructor(deps: GameDeps) {
    super("church", deps);
  }

  create() {
    const { session, content } = this.deps;
    const frames = new Frames(this);
    this.frames = frames;
    const map = this.make.tilemap({ key: KEY.churchMap });
    this.world = { width: map.widthInPixels, height: map.heightInPixels };
    const tileset = map.addTilesetImage("extra", KEY.tilesExtra);
    if (!tileset) throw new Error('The church map needs the "extra" tileset.');
    for (const data of map.layers) {
      const layer = map.createLayer(data.name, tileset);
      if (layer && data.name === "collisions") layer.setVisible(false);
    }

    const objects = readChurchObjects(map);
    this.objects = objects;
    this.view = objects.view;
    const cast = new Cast(this, frames);
    this.cast = cast;
    cast.add({ id: PLAYER, kind: "pupil", look: content.people[PLAYER]?.sprite ?? PLAYER, at: objects.spawn });
    for (const f of objects.figures) {
      const figure = content.figures[f.index];
      if (!figure) throw new Error(`The church map has figure ${f.index}, but the lesson has no figure there.`);
      cast.add({ id: f.id, kind: "figure", look: figure.sprite, at: f, behavior: "leader", index: f.index });
    }
    cast.start(this.gridEngine, map);

    const sounds = new SoundBoard(this, session.saved, session.ui, session.bus);
    this.chatter = new Chatter(this, cast, content, session.saved, session.ui, (x, y) => this.toScreen(x, y));
    this.markers = new Markers(this, cast, frames, session.saved, session.ui, (progress) => this.markPlan(progress));
    const behaviors = new Behaviors(this, this.gridEngine, cast, frames, []);
    behaviors.start();

    const offBus = session.bus.on((event) => {
      if (event.type === "say") this.chatter.say(event.id, event.text);
    });
    const offUi = session.ui.subscribe((state, previous) => {
      if (!state.inside && previous.inside) {
        sounds.play("door");
        const start: TownStart = { from: "church" };
        this.scene.start("town", start);
      }
    });

    this.cleanups.push(
      () => behaviors.dispose(),
      offBus,
      offUi,
      () => sounds.dispose(),
      () => this.chatter.dispose(),
      () => this.markers.dispose(),
    );
    this.startWalking();
  }

  update(time: number) {
    if (!this.cast) return;
    this.markers.update(time);
    this.chatter.update();
    this.walk();
  }

  protected nearOf(id: string): Near | null {
    const actor = this.cast.get(id);
    return actor?.kind === "figure" && actor.index !== undefined ? { kind: "figure", id, index: actor.index } : null;
  }

  protected spotAt(tile: TilePoint): Near | null {
    const exit = this.objects.exit;
    return tile.x === exit.x && tile.y === exit.y ? { kind: "exit", id: exit.id } : null;
  }

  private markPlan(progress: BayanProgress): MarkPlan {
    const marks = new Map<string, "ask" | "done">();
    let arrow: MarkPlan["arrow"] = null;
    for (const figure of this.cast.ofKind("figure")) {
      const index = figure.index ?? 0;
      if (progress.stage > 3 || index < progress.figuresMet) marks.set(figure.id, "done");
      else if (index === progress.figuresMet) {
        marks.set(figure.id, "ask");
        arrow = { actor: figure.id };
      }
    }
    // Once everyone is met, the way out is the next place to go.
    if (!arrow && progress.stage >= 3) arrow = { tile: this.objects.exit };
    return { marks, arrow };
  }
}
