import { Lesson } from "@/core/lesson/Lesson";
import { BayanihanActivity } from "@/features/bayanihan/BayanihanActivity";
import { GiftsActivity } from "@/features/gifts/GiftsActivity";
import type { SfxFiles } from "@/features/storybook/useSfx";
import { bayanihan, gifts } from "./content";

const sound = (file: string) => `/lessons/lesson-03/sounds/${file}`;

const sounds: SfxFiles = {
  select: sound("select.ogg"),
  place: sound("place.ogg"),
  wrong: sound("wrong.ogg"),
  right: sound("right.ogg"),
  done: sound("done.ogg"),
  tap: sound("tap.ogg"),
};

/** Lesson 3. Everything this lesson shows lives in this folder and public/lessons/lesson-03/. */
export const lesson03 = new Lesson({
  id: "lesson-03",
  number: 3,
  title: "The Church Teaches One Faith",
  theme: "We are different, yet we are one, like one Body with Christ as the Head.",
  reflectionPrompt: gifts.writingPrompt,
  reflectionStarters: ["My gift is", "I will use it to help my community by"],
  activities: [
    new BayanihanActivity({
      id: "bayanihan-tayo",
      title: bayanihan.title,
      instructions: "Drag each friend to the job that fits their gift.",
      content: bayanihan,
      sounds,
    }),
    new GiftsActivity({
      id: "gifts-for-our-barangay",
      title: gifts.title,
      instructions: "Spell each gift, then choose how to use it.",
      content: gifts,
      sounds,
    }),
  ],
});
