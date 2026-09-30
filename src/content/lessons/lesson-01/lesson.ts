import { Lesson } from "@/core/lesson/Lesson";
import { BrickWallActivity } from "@/features/brick-wall/BrickWallActivity";

const dove = {
  src: "/lessons/lesson-01/hidden.jpg",
  width: 736,
  height: 736,
  alt: "A white dove with open wings under a heart, surrounded by golden rays.",
};

/** Lesson 1. Everything this lesson shows lives in this file and public/lessons/lesson-01/. */
export const lesson01 = new Lesson({
  id: "lesson-01",
  number: 1,
  title: "The Church Is the Community of Jesus Christ's Disciples",
  theme: "A community is built by all of us, and the Holy Spirit holds us together.",
  reflectionPrompt: "How can you help build our class community this week?",
  reflectionStarters: ["This week I can help by", "Our class is like a wall because", "I felt the Holy Spirit when"],
  cover: dove,
  songs: [{ title: "Roll Over the Ocean", url: "https://www.youtube.com/watch?v=LrsaXkdK6OU" }],
  activities: [
    new BrickWallActivity({
      id: "build-our-wall",
      title: "Build our wall",
      instructions: "When the music stops, drag the brick to any empty spot.",
      question: "Who built this?",
      photo: dove,
      pieceCounts: [6, 8, 10],
      defaultPieceCount: 6,
      layoutSeed: 1,
    }),
  ],
});
