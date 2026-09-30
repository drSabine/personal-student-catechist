import localFont from "next/font/local";

/** Display font. Headings and big moments only. */
export const pixelFont = localFont({
  src: "../styles/fonts/GeistPixel.woff2",
  variable: "--nf-pixel",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

/** Readable sans for UI and body text. */
export const sansFont = localFont({
  src: "../styles/fonts/Geist.woff2",
  variable: "--nf-geist",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/** Serif for reflection entries only. */
export const serifFont = localFont({
  src: [
    { path: "../styles/fonts/Sentient-Regular.woff2", weight: "400", style: "normal" },
    { path: "../styles/fonts/Sentient-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--nf-sentient",
  display: "swap",
  fallback: ["Georgia", "serif"],
});
