import type { ComponentType } from "react";
import type { PictureArt } from "../content";
import { building } from "./building";
import { drawing } from "./drawing";
import { hands } from "./hands";
import { praying } from "./praying";
import { singing } from "./singing";
import { teaching } from "./teaching";

/** Every clue picture by name. The type check fails if one named in the content is missing. */
export const PICTURES: Readonly<Record<PictureArt, ComponentType>> = {
  ...hands,
  ...singing,
  ...drawing,
  ...building,
  ...teaching,
  ...praying,
};
