import { Lesson } from "@/core/lesson/Lesson";
import { BayanActivity } from "@/features/bayan/BayanActivity";
import { bayan } from "./bayan";

const dir = "/lessons/lesson-02";
const sound = (file: string) => `${dir}/sounds/${file}`;

/** Lesson 2. Everything this lesson shows lives in this folder and public/lessons/lesson-02/. */
export const lesson02 = new Lesson({
  id: "lesson-02",
  number: 2,
  title: "The Church Is Guided by Jesus Christ's Chosen Leaders",
  theme: "Jesus Christ chose leaders to guide His Church, and every community has leaders who help us grow.",
  reflectionPrompt: "TODO reflection question for Lesson 02",
  reflectionStarters: [],
  activities: [
    new BayanActivity({
      id: "build-our-bayan",
      title: "Build our bayan",
      instructions: "Find each leader, and our community builds its town.",
      content: bayan,
      assets: {
        townMap: `${dir}/maps/town.json`,
        churchMap: `${dir}/maps/church.json`,
        tiles: { town: `${dir}/tiles/town.png`, dungeon: `${dir}/tiles/dungeon.png`, extra: `${dir}/tiles/extra.png` },
        people: `${dir}/sprites/people.png`,
        peopleIndex: `${dir}/sprites/people.json`,
        extraIndex: `${dir}/sprites/extra.json`,
        cloud: `${dir}/sprites/cloud.png`,
        sounds: {
          music: sound("town-loop.wav"),
          talk: sound("talk.ogg"),
          blip: sound("blip.wav"),
          pop: sound("pop.wav"),
          right: sound("right.ogg"),
          wrong: sound("wrong.wav"),
          sparkle: sound("sparkle.wav"),
          hammer: sound("hammer.wav"),
          rise: sound("rise.wav"),
          build: sound("build.ogg"),
          cheer: sound("cheer.wav"),
          stage: sound("stage.ogg"),
          door: sound("door.ogg"),
          cluck: sound("cluck.wav"),
          bark: sound("bark.wav"),
          meow: sound("meow.wav"),
          quack: sound("quack.wav"),
        },
      },
    }),
  ],
});
