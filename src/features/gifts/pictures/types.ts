import type { ComponentType } from "react";
import type { PictureArt } from "../content";

/** Clue pictures, each drawn on a 200 by 200 card. */
export type Pictures = Partial<Record<PictureArt, ComponentType>>;
