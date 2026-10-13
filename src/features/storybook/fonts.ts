import { Atkinson_Hyperlegible, Baloo_2 } from "next/font/google";

/** Lesson 03's display font, round and friendly, for names, buttons, and big lines. */
const baloo = Baloo_2({ subsets: ["latin"], variable: "--nf-baloo", display: "swap" });

/** Lesson 03's body font, made to read clearly from far away. */
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--nf-atkinson",
  display: "swap",
});

/** Put on a Lesson 03 game's root, so only its games use these fonts. */
export const storyFonts = `${baloo.variable} ${atkinson.variable}`;
