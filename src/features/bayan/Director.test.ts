import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bayan } from "@/content/lessons/lesson-02/bayan";
import { CELEBRATION_MS, Director } from "./Director";
import { LOT_IDS, type LotId } from "./content";
import { EventBus, type BayanEvent } from "./events";
import { createProgressStore, createUiStore, type Near, type UiStore } from "./stores";

function setup() {
  const saved = createProgressStore();
  const ui = createUiStore();
  const bus = new EventBus();
  const events: BayanEvent["type"][] = [];
  bus.on((event) => events.push(event.type));
  const director = new Director(bayan, saved, ui, bus);
  return { saved, ui, bus, events, director };
}

const leader = (lot: LotId): Near => ({ kind: "leader", id: `leader-${lot}`, lot });

/** Plays the open conversation to its end, answering every question right. */
function playThrough(director: Director, ui: UiStore) {
  for (let step = 0; step < 100 && ui.getState().dialog; step++) {
    const dialog = ui.getState().dialog;
    if (!dialog) break;
    const beat = dialog.beats[dialog.index];
    if (beat.kind === "ask" && dialog.solved === null) {
      director.choose(bayan.lots[beat.lot].questions[beat.question].answer);
    } else {
      director.next();
    }
  }
  expect(ui.getState().dialog).toBeNull();
}

function findLeaders(director: Director, ui: UiStore, lot: LotId) {
  director.interact(leader(lot));
  playThrough(director, ui);
}

/** Talks to a lot's leaders and reads until their first question. */
function reachQuestion(director: Director, ui: UiStore, lot: LotId) {
  director.interact(leader(lot));
  while (ui.getState().dialog?.beats[ui.getState().dialog?.index ?? 0].kind === "say") director.next();
}

describe("Director", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("plays the opening once, then marks it seen", () => {
    const { director, ui, saved } = setup();
    director.start();
    expect(ui.getState().started).toBe(true);
    playThrough(director, ui);
    expect(saved.getState().progress.openingSeen).toBe(true);
  });

  it("greets in the leaders' own voices, then asks the first question", () => {
    const { director, ui } = setup();
    director.interact(leader("house"));
    const beats = ui.getState().dialog?.beats ?? [];
    expect(beats.slice(0, -1)).toEqual(bayan.lots.house.script.greet.map((line) => ({ kind: "say", ...line })));
    expect(beats.at(-1)).toEqual({ kind: "ask", lot: "house", question: 0 });
  });

  it("will not move past a question until it is answered", () => {
    const { director, ui } = setup();
    reachQuestion(director, ui, "school");
    const index = ui.getState().dialog?.index;
    director.next();
    expect(ui.getState().dialog?.index).toBe(index);
  });

  it("gives the leader's own hint after a wrong choice, and changes nothing", () => {
    const { director, ui, events, saved } = setup();
    reachQuestion(director, ui, "house");
    const question = bayan.lots.house.questions[0];
    const wrong = (question.answer + 1) % 3;
    director.choose(wrong);
    expect(ui.getState().dialog?.tried).toEqual([wrong]);
    expect(ui.getState().dialog?.hint).toEqual(question.hint);
    expect(events).toContain("wrong");
    expect(saved.getState().progress.answered.house).toBe(0);
  });

  it("praises a right answer, then asks the next question", () => {
    const { director, ui } = setup();
    reachQuestion(director, ui, "hall");
    director.choose(bayan.lots.hall.questions[0].answer);
    director.next();
    expect(ui.getState().dialog?.beats[ui.getState().dialog?.index ?? 0]).toEqual({
      kind: "say",
      ...bayan.lots.hall.questions[0].praise,
    });
    director.next();
    expect(ui.getState().dialog?.beats[ui.getState().dialog?.index ?? 0]).toEqual({ kind: "ask", lot: "hall", question: 1 });
  });

  it("finds a lot's leaders once all four questions are answered", () => {
    const { director, ui, saved } = setup();
    findLeaders(director, ui, "school");
    expect(saved.getState().progress.answered.school).toBe(4);
  });

  it("picks up at the next question when the class comes back", () => {
    const { director, ui } = setup();
    reachQuestion(director, ui, "house");
    director.choose(bayan.lots.house.questions[0].answer);
    director.next();
    // The class walks away mid-conversation.
    ui.setState({ dialog: null });
    director.interact(leader("house"));
    const beats = ui.getState().dialog?.beats ?? [];
    expect(beats[0]).toEqual({ kind: "say", ...bayan.lots.house.script.resume[0] });
    expect(beats.at(-1)).toEqual({ kind: "ask", lot: "house", question: 1 });
  });

  it("finds the parish priest without finishing the church", () => {
    const { director, ui, saved } = setup();
    findLeaders(director, ui, "church");
    expect(saved.getState().progress.church).toBe(0);
  });

  it("thanks the class when they come back to a lot that is done", () => {
    const { director, ui } = setup();
    findLeaders(director, ui, "hall");
    director.interact(leader("hall"));
    expect(ui.getState().dialog?.beats).toEqual(bayan.lots.hall.script.thanks.map((line) => ({ kind: "say", ...line })));
  });

  it("closes Stage 1 after the last building has had its moment", () => {
    const { director, ui, saved, events } = setup();
    for (const lot of LOT_IDS) findLeaders(director, ui, lot);
    vi.advanceTimersByTime(CELEBRATION_MS);
    expect(ui.getState().dialog?.beats.at(-1)).toEqual({ kind: "card", card: bayan.closing });
    playThrough(director, ui);
    expect(saved.getState().progress.closingSeen).toBe(true);
    expect(events).toContain("stage-complete");
  });

  it("starts over on reset", () => {
    const { director, ui, saved } = setup();
    findLeaders(director, ui, "house");
    director.reset();
    expect(saved.getState().progress.answered.house).toBe(0);
  });
});
